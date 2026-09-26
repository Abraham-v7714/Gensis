/**
 * OIDC Discovery Endpoint Resolver — Stage 4.11
 *
 * Dynamically resolves OpenID Connect / Customer Account API endpoints from Shopify
 * well-known discovery documents rather than hardcoding OAuth URLs.
 *
 * Security:
 * - Validates all returned endpoint URLs (must be HTTPS and match trusted Shopify hosts).
 * - Rejects arbitrary external endpoints to prevent OAuth URL injection.
 */

import type { OidcConfiguration } from "./types";

function isValidShopifyEndpoint(urlStr: string, storeDomain: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    const domain = storeDomain.toLowerCase().trim();

    // Trusted host check: must match store domain, customer.shopify.com, or *.shopify.com
    return (
      host === domain ||
      host === `checkout.${domain}` ||
      host === "customer.shopify.com" ||
      host.endsWith(".shopify.com")
    );
  } catch {
    return false;
  }
}

export async function fetchOidcConfiguration(storeDomain: string): Promise<OidcConfiguration> {
  if (!storeDomain || typeof storeDomain !== "string") {
    throw new Error("[GENSIS OIDC Discovery] Invalid store domain provided.");
  }

  const cleanDomain = storeDomain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const discoveryUrl = `https://${cleanDomain}/.well-known/openid-configuration`;

  try {
    const res = await fetch(discoveryUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // Cache discovery for 24h
    });

    if (!res.ok) {
      throw new Error(`OIDC Discovery returned HTTP status ${res.status}`);
    }

    const data = await res.json();

    const authEndpoint = data.authorization_endpoint;
    const tokenEndpoint = data.token_endpoint;
    const endSessionEndpoint = data.end_session_endpoint;
    const userinfoEndpoint = data.userinfo_endpoint;

    if (
      !authEndpoint ||
      !tokenEndpoint ||
      !isValidShopifyEndpoint(authEndpoint, cleanDomain) ||
      !isValidShopifyEndpoint(tokenEndpoint, cleanDomain)
    ) {
      throw new Error("Discovery returned invalid or untrusted endpoints.");
    }

    return {
      authorization_endpoint: authEndpoint,
      token_endpoint: tokenEndpoint,
      end_session_endpoint:
        endSessionEndpoint && isValidShopifyEndpoint(endSessionEndpoint, cleanDomain)
          ? endSessionEndpoint
          : undefined,
      userinfo_endpoint:
        userinfoEndpoint && isValidShopifyEndpoint(userinfoEndpoint, cleanDomain)
          ? userinfoEndpoint
          : undefined,
    };
  } catch (error) {
    // Fallback to standard Shopify Customer Account endpoints if discovery fetch fails in dev
    const fallbackAuth = `https://${cleanDomain}/auth/oauth/authorize`;
    const fallbackToken = `https://${cleanDomain}/auth/oauth/token`;
    const fallbackLogout = `https://${cleanDomain}/auth/logout`;

    if (
      isValidShopifyEndpoint(fallbackAuth, cleanDomain) &&
      isValidShopifyEndpoint(fallbackToken, cleanDomain)
    ) {
      return {
        authorization_endpoint: fallbackAuth,
        token_endpoint: fallbackToken,
        end_session_endpoint: fallbackLogout,
      };
    }

    throw new Error(
      `[GENSIS OIDC Discovery] Failed to resolve OIDC discovery endpoints: ${(error as Error).message}`
    );
  }
}
