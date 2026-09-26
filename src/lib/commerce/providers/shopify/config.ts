/**
 * Shopify Configuration Boundary — Stage 4.6
 *
 * Server-side configuration for Shopify Storefront API connection.
 *
 * Rules:
 * - Credentials must remain server-side only (never exposed via NEXT_PUBLIC_).
 * - Uses Shopify Storefront Private Access Token (`Shopify-Storefront-Private-Token`)
 *   since all storefront catalog reads are executed server-side.
 * - Storefront API access uses Storefront API credentials only (no Admin API tokens).
 * - Fails safely when unconfigured without crashing build or injecting fake products.
 * - API Version is pinned to the current supported stable release (`2026-07`).
 */

export const shopifyConfig = {
  domain: process.env.SHOPIFY_STORE_DOMAIN || "",
  privateToken: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || "",
  apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-07",
};

/**
 * Normalizes store domain (removes https://, trailing slashes).
 */
export function getShopifyStoreDomain(): string {
  let domain = shopifyConfig.domain.trim();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.replace(/\/+$/, "");
  return domain;
}

/**
 * Returns true if required Shopify credentials are fully configured.
 */
export function isShopifyConfigured(): boolean {
  return Boolean(
    getShopifyStoreDomain() &&
    shopifyConfig.privateToken.trim().length > 0
  );
}
