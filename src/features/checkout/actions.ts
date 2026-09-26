"use server";

/**
 * Checkout Server Action — Stage 4.10
 *
 * Retrieves and validates the Shopify checkoutUrl immediately before navigation.
 * The client supplies no URL. The cart ID comes exclusively from the HttpOnly cookie.
 *
 * Flow:
 *   1. Read gensis_cart_id cookie
 *   2. Call commerce.getCart() — returns UNAVAILABLE / NOT_FOUND / PROVIDER_ERROR if needed
 *   3. Verify cart contains at least one line
 *   4. Extract checkoutUrl from the authoritative Shopify response
 *   5. Validate URL against the exact SHOPIFY_STORE_DOMAIN allowlist
 *   6. Return CommerceResult<string> — validated URL on success
 *
 * Security:
 *   - No client-supplied arguments; no open-redirect risk.
 *   - checkoutUrl validated server-side before reaching the client.
 *   - SHOPIFY_STOREFRONT_PRIVATE_TOKEN never leaves the server.
 */

import { cookies } from "next/headers";
import { commerce } from "@/lib/commerce";
import { getShopifyStoreDomain } from "@/lib/commerce/providers/shopify/config";
import type { CommerceResult } from "@/lib/commerce/types";
import { validateCheckoutUrl } from "./checkout";

const CART_COOKIE_NAME = "gensis_cart_id";

/**
 * Server Action: Validates and returns the Shopify checkout URL for the active cart.
 *
 * Returns CommerceResult<string> where the string is the validated checkout URL.
 * commerce.getCart() handles the UNAVAILABLE case when credentials are missing —
 * no redundant isCommerceConfigured() guard is needed here.
 */
export async function checkoutAction(): Promise<CommerceResult<string>> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "No active Bag session found." },
    };
  }

  // commerce.getCart returns:
  //   UNAVAILABLE  — if Shopify credentials are not configured
  //   NOT_FOUND    — if the cart has expired or ID is invalid
  //   PROVIDER_ERROR — on API / network failure
  const result = await commerce.getCart(cartId);

  if (!result.ok) {
    return result;
  }

  const cart = result.data;

  if (cart.lines.length === 0) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Your Bag is empty." },
    };
  }

  const checkoutUrl = cart.checkoutUrl;

  if (!checkoutUrl) {
    return {
      ok: false,
      error: { code: "PROVIDER_ERROR", message: "Checkout URL is unavailable." },
    };
  }

  const storeDomain = getShopifyStoreDomain();

  if (!validateCheckoutUrl(checkoutUrl, storeDomain)) {
    console.error(
      "[GENSIS Checkout] Rejected invalid checkoutUrl from Shopify provider:",
      checkoutUrl
    );
    return {
      ok: false,
      error: { code: "PROVIDER_ERROR", message: "Checkout destination is invalid." },
    };
  }

  return { ok: true, data: checkoutUrl };
}
