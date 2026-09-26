"use server";

/**
 * Account & Authentication Server Actions — Stage 4.11
 *
 * Implements server-side actions for Shopify Customer Account OAuth PKCE initiation,
 * callback token exchange, session management, and authenticated profile/order retrieval.
 *
 * Security & Guardrails:
 * - OIDC discovery endpoints dynamically resolved (no hardcoded URLs).
 * - PKCE code_verifier and state cryptographically generated and stored in temporary HttpOnly cookies.
 * - Access tokens stored ONLY in server-side TokenStore boundary (never in browser cookies or client props).
 * - Open-redirect protection on callback redirect parameters.
 */

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { fetchOidcConfiguration } from "@/lib/auth/discovery";
import { generatePkcePair, validateState } from "@/lib/auth/pkce";
import {
  setPkceCookie,
  getPkceCookie,
  clearPkceCookie,
  createCustomerSession,
  getCustomerSession,
  destroyCustomerSession,
} from "@/lib/auth/session";
import { customerAccountClient } from "@/lib/commerce/providers/shopify/customerAccount";
import { getShopifyStoreDomain } from "@/lib/commerce/providers/shopify/config";
import { commerce } from "@/lib/commerce";
import type { CommerceResult, PaginatedResult } from "@/lib/commerce/types";
import type { CustomerProfile, CustomerAddress } from "@/types/customer";
import type { Order } from "@/types/order";

const CART_COOKIE_NAME = "gensis_cart_id";

function getClientId(): string {
  return (process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || "gensis-client-id").trim();
}

function sanitizeRedirectUrl(url?: string): string {
  if (!url || typeof url !== "string") return "/account";
  // Only allow relative paths starting with /
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes(":\\")) {
    return url;
  }
  return "/account";
}

/**
 * Server Action: Initiates Shopify Customer Account OAuth PKCE login flow.
 * Returns the validated authorization redirect URL.
 */
export async function initiateLoginAction(
  redirectTo?: string
): Promise<CommerceResult<string>> {
  const storeDomain = getShopifyStoreDomain();

  if (!storeDomain) {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Commerce store domain is not configured.",
      },
    };
  }

  try {
    const oidcConfig = await fetchOidcConfiguration(storeDomain);
    const pkce = generatePkcePair();

    await setPkceCookie(pkce.codeVerifier, pkce.state);

    const clientId = getClientId();
    // Callback must use HTTPS
    const redirectUri = `https://${storeDomain}/account/callback`;

    const authUrl = new URL(oidcConfig.authorization_endpoint);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email customer-account-api:full");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", pkce.state);
    authUrl.searchParams.set("code_challenge", pkce.codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    const safeRedirect = sanitizeRedirectUrl(redirectTo);
    if (safeRedirect !== "/account") {
      authUrl.searchParams.set("destination", safeRedirect);
    }

    return { ok: true, data: authUrl.toString() };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "PROVIDER_ERROR",
        message: `Failed to initiate authentication: ${(error as Error).message}`,
      },
    };
  }
}

/**
 * Server Action: Processes OAuth callback authorization code exchange.
 * Sets server session and binds anonymous cart.
 */
export async function handleOAuthCallbackAction(
  code: string,
  state: string,
  redirectUrl?: string
): Promise<CommerceResult<string>> {
  if (!code || typeof code !== "string" || !state || typeof state !== "string") {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid OAuth callback parameters.",
      },
    };
  }

  const pkceCookie = await getPkceCookie();
  await clearPkceCookie();

  if (!pkceCookie || !validateState(state, pkceCookie.state)) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Authentication state mismatch. Security validation failed.",
      },
    };
  }

  const storeDomain = getShopifyStoreDomain();
  if (!storeDomain) {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Store domain unconfigured." },
    };
  }

  try {
    const oidcConfig = await fetchOidcConfiguration(storeDomain);
    const clientId = getClientId();
    const redirectUri = `https://${storeDomain}/account/callback`;

    // Execute token exchange
    const tokenRes = await fetch(oidcConfig.token_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        code_verifier: pkceCookie.codeVerifier,
      }).toString(),
    });

    if (!tokenRes.ok) {
      return {
        ok: false,
        error: {
          code: "PROVIDER_ERROR",
          message: `OAuth token exchange failed with status ${tokenRes.status}`,
        },
      };
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 3600;

    if (!accessToken) {
      return {
        ok: false,
        error: {
          code: "PROVIDER_ERROR",
          message: "Token endpoint returned missing access_token.",
        },
      };
    }

    // Establish secure server-side session (opaque cookie ID)
    await createCustomerSession({
      accessToken,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    // Anonymous cart binding if cart cookie exists
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get(CART_COOKIE_NAME)?.value;

    if (existingCartId) {
      try {
        // Bind customerAccessToken to cart on Storefront API
        await commerce.updateCartBuyerIdentity(existingCartId, accessToken);
      } catch {
        // Fail-safe: Cart binding failure does not disrupt customer sign-in
        console.warn("[GENSIS Auth] Cart buyer identity update warning during sign-in.");
      }
    }

    return { ok: true, data: sanitizeRedirectUrl(redirectUrl) };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "PROVIDER_ERROR",
        message: `OAuth processing failed: ${(error as Error).message}`,
      },
    };
  }
}

/**
 * Server Action: Logs out customer session and returns logout destination.
 */
export async function logoutAction(): Promise<CommerceResult<string>> {
  await destroyCustomerSession();

  const storeDomain = getShopifyStoreDomain();
  if (storeDomain) {
    try {
      const oidcConfig = await fetchOidcConfiguration(storeDomain);
      if (oidcConfig.end_session_endpoint) {
        return { ok: true, data: oidcConfig.end_session_endpoint };
      }
    } catch {
      // Ignore discovery error on logout fallback
    }
  }

  return { ok: true, data: "/account/login" };
}

/**
 * Server Action: Fetches authenticated customer profile.
 */
export async function getCustomerProfileAction(): Promise<
  CommerceResult<CustomerProfile>
> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Unauthenticated. Please sign in." },
    };
  }

  return customerAccountClient.getCustomerProfile(session.tokens.accessToken);
}

/**
 * Server Action: Fetches customer order history.
 */
export async function getCustomerOrdersAction(options?: {
  first?: number;
  after?: string;
}): Promise<PaginatedResult<Order>> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      items: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      error: true,
    };
  }

  return customerAccountClient.getCustomerOrders(session.tokens.accessToken, options);
}

/**
 * Server Action: Fetches single order detail.
 */
export async function getOrderDetailAction(
  orderId: string
): Promise<CommerceResult<Order>> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Unauthenticated. Please sign in." },
    };
  }

  return customerAccountClient.getOrderById(session.tokens.accessToken, orderId);
}

/**
 * Server Action: Creates a new customer address.
 */
export async function createAddressAction(
  address: Omit<CustomerAddress, "id">
): Promise<CommerceResult<CustomerAddress>> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Unauthenticated. Please sign in." },
    };
  }

  if (!address.address1 || !address.city || !address.country || !address.zip) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Address line 1, city, country, and postal code are required.",
      },
    };
  }

  const result = await customerAccountClient.createAddress(session.tokens.accessToken, address);

  if (result.ok) {
    if (address.isDefault && result.data.id) {
      await customerAccountClient.setDefaultAddress(session.tokens.accessToken, result.data.id);
    }
    revalidatePath("/account/addresses");
    revalidatePath("/account");
  }

  return result;
}

/**
 * Server Action: Updates an existing customer address.
 */
export async function updateAddressAction(
  addressId: string,
  address: Partial<CustomerAddress>
): Promise<CommerceResult<CustomerAddress>> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Unauthenticated. Please sign in." },
    };
  }

  if (!addressId) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Address ID is required." },
    };
  }

  const result = await customerAccountClient.updateAddress(
    session.tokens.accessToken,
    addressId,
    address
  );

  if (result.ok) {
    if (address.isDefault) {
      await customerAccountClient.setDefaultAddress(session.tokens.accessToken, addressId);
    }
    revalidatePath("/account/addresses");
    revalidatePath("/account");
  }

  return result;
}

/**
 * Server Action: Deletes a saved customer address.
 */
export async function deleteAddressAction(
  addressId: string
): Promise<CommerceResult<boolean>> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Unauthenticated. Please sign in." },
    };
  }

  if (!addressId) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Address ID is required." },
    };
  }

  const result = await customerAccountClient.deleteAddress(
    session.tokens.accessToken,
    addressId
  );

  if (result.ok) {
    revalidatePath("/account/addresses");
    revalidatePath("/account");
  }

  return result;
}

/**
 * Server Action: Sets a saved address as default.
 */
export async function setDefaultAddressAction(
  addressId: string
): Promise<CommerceResult<CustomerAddress>> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Unauthenticated. Please sign in." },
    };
  }

  if (!addressId) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Address ID is required." },
    };
  }

  const result = await customerAccountClient.setDefaultAddress(
    session.tokens.accessToken,
    addressId
  );

  if (result.ok) {
    revalidatePath("/account/addresses");
    revalidatePath("/account");
  }

  return result;
}
