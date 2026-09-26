/**
 * Commerce Library — Main Entry Point — Stage 4.6
 *
 * Single access point for commerce catalog and operations in GENSIS.
 *
 * Registered Active Provider: SHOPIFY (ShopifyCommerceClient)
 *
 * Architecture:
 *   Shopify Storefront API → ShopifyCommerceClient → CommerceClient interface → Application
 *
 * Usage:
 *   import { commerce } from "@/lib/commerce";
 *   const products = await commerce.getProducts();
 *   const product = await commerce.getProductBySlug(slug);
 *
 * UI components, features, and route pages MUST NEVER import from Shopify SDKs
 * or GraphQL shapes directly.
 */

import { ShopifyCommerceClient } from "./providers/shopify";
import { isShopifyConfigured } from "./providers/shopify/config";
import type { CommerceClient } from "./types";

export type {
  CommerceClient,
  ProductQueryOptions,
  CollectionQueryOptions,
} from "./types";

/**
 * Returns true if the underlying active commerce provider is configured.
 */
export function isCommerceConfigured(): boolean {
  return isShopifyConfigured();
}

/**
 * Active production commerce client singleton instance.
 */
export const commerce: CommerceClient = new ShopifyCommerceClient();

