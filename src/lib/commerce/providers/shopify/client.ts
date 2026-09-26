/**
 * Shopify Storefront API Fetch Client — Stage 4.6
 *
 * Executes GraphQL queries against Shopify Storefront API.
 *
 * Rules:
 * - Server-side execution only.
 * - Uses native fetch with server-side `Shopify-Storefront-Private-Token` header.
 * - Handles HTTP and GraphQL error arrays gracefully without leaking private tokens.
 */

import { shopifyConfig, getShopifyStoreDomain, isShopifyConfigured } from "./config";

export type ShopifyFetchOptions = {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  revalidate?: number;
};

export type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown[]; path?: unknown[] }>;
};

export async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  revalidate,
}: ShopifyFetchOptions): Promise<ShopifyGraphQLResponse<T>> {
  if (!isShopifyConfigured()) {
    console.warn("[GENSIS Commerce: Shopify] Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_PRIVATE_TOKEN.");
    return {};
  }

  const domain = getShopifyStoreDomain();
  const endpoint = `https://${domain}/api/${shopifyConfig.apiVersion}/graphql.json`;

  try {
    const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": shopifyConfig.privateToken,
      },
      body: JSON.stringify({ query, variables }),
      cache,
    };

    if (typeof revalidate === "number") {
      fetchOptions.next = { revalidate };
    }

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      console.error(`[GENSIS Commerce: Shopify] HTTP Error ${response.status}: ${response.statusText}`);
      return {};
    }

    const json = (await response.json()) as ShopifyGraphQLResponse<T>;

    if (json.errors && json.errors.length > 0) {
      console.error(
        "[GENSIS Commerce: Shopify] GraphQL Error(s):",
        json.errors.map((e) => e.message).join("; ")
      );
    }

    return json;
  } catch (err) {
    console.error("[GENSIS Commerce: Shopify] Fetch Exception:", err);
    return {};
  }
}
