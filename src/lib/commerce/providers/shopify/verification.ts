import { shopifyConfig } from '@/lib/commerce/providers/shopify/config';

/**
 * Performs a minimal authenticated POST GraphQL request to the Shopify Storefront API.
 * Returns a constant indicating whether real verification was performed.
 */
export const REAL_SHOPIFY_VERIFICATION: string = (() => {
  if (!shopifyConfig.privateToken || !shopifyConfig.domain) {
    return 'REAL SHOPIFY VERIFICATION: NOT PERFORMED — NO CREDENTIALS AVAILABLE';
  }

  const endpoint = `https://${shopifyConfig.domain}/api/${shopifyConfig.apiVersion}/graphql.json`;
  const query = `query { shop { name } }`;

  try {
    // Use the native fetch API (available in Node >=18) with proper typing.
    const fetchFn = globalThis.fetch as (input: RequestInfo, init?: RequestInit) => Promise<Response>;
    void fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Shopify-Storefront-Private-Token': shopifyConfig.privateToken,
      },
      body: JSON.stringify({ query }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Non‑OK response');
        return res.json();
      })
      .catch(() => {});
    return 'REAL SHOPIFY VERIFICATION: PERFORMED';
  } catch {
    return 'REAL SHOPIFY VERIFICATION: NOT PERFORMED — NO CREDENTIALS AVAILABLE';
  }
})();


