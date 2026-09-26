/**
 * Checkout URL Validation — Stage 4.10
 *
 * Pure utility for validating a Shopify-returned checkoutUrl before navigation.
 * No side effects. No imports from Next.js, React, or commerce modules.
 *
 * Allowlist (both must be HTTPS):
 *   - Exact configured store domain       e.g. gensis.myshopify.com
 *   - Checkout subdomain of store domain  e.g. checkout.gensis.myshopify.com
 *
 * All other hostnames, protocols, and malformed strings are rejected.
 */

/**
 * Returns true only if `url` is a valid HTTPS URL whose hostname matches
 * the exact allowlist derived from the configured Shopify store domain.
 *
 * @param url         - The checkoutUrl string returned by the Shopify Storefront API.
 * @param storeDomain - The normalized store domain from SHOPIFY_STORE_DOMAIN
 *                      (e.g. "gensis.myshopify.com"). Must not be empty.
 */
export function validateCheckoutUrl(url: string, storeDomain: string): boolean {
  if (!url || typeof url !== "string" || !storeDomain || typeof storeDomain !== "string") {
    return false;
  }

  let parsed: URL;
  try {
    // Rejects malformed strings, protocol-relative "//" URLs (new URL throws),
    // and javascript:/data: schemes that would bypass protocol check.
    parsed = new URL(url);
  } catch {
    return false;
  }

  // Only HTTPS — rejects http:, javascript:, data:, and any other scheme.
  if (parsed.protocol !== "https:") {
    return false;
  }

  // Reject userinfo URL attacks (e.g., https://user:pass@gensis.myshopify.com)
  if (parsed.username || parsed.password) {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  const domain = storeDomain.toLowerCase().trim();

  if (!domain) {
    return false;
  }

  // Exact allowlist only. Does NOT accept arbitrary .myshopify.com subdomains.
  // Accepts:
  //   gensis.myshopify.com               (store domain)
  //   checkout.gensis.myshopify.com      (Shopify checkout subdomain for this store)
  return hostname === domain || hostname === `checkout.${domain}`;
}
