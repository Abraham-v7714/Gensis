/**
 * ShopifyCommerceClient Implementation — Stage 4.6
 *
 * Implements GENSIS CommerceClient interface using Shopify Storefront API GraphQL
 * fetch client and response mapper.
 *
 * Rules:
 * - Implements CommerceClient contract.
 * - Graceful error handling: if Shopify is unconfigured or fetch fails, returns null / empty array.
 * - Returns normalized provider-neutral GENSIS domain models (Product, Collection).
 * - No Shopify types leak through this boundary.
 */

import type {
  CommerceClient,
  ProductQueryOptions,
  CollectionQueryOptions,
  PaginatedResult,
  CommerceResult,
  CartLineInput,
  CartLineUpdateInput,
} from "../../types";
import type { Product } from "@/types/product";
import type { Collection } from "@/types/collection";
import type { Cart } from "@/types/cart";
import { isShopifyConfigured } from "./config";
import { shopifyFetch } from "./client";
import {
  productsQuery,
  productByHandleQuery,
  collectionsQuery,
  collectionByHandleQuery,
  searchProductsQuery,
  getCartQuery,
  createCartMutation,
  addCartLinesMutation,
  updateCartLinesMutation,
  removeCartLinesMutation,
  updateCartBuyerIdentityMutation,
} from "./queries";
import {
  mapShopifyProduct,
  mapShopifyCollection,
  mapShopifyCart,
  type RawShopifyProductNode,
  type RawShopifyCollectionNode,
  type RawShopifyCartNode,
  type RawShopifyUserError,
  type RawShopifyWarning,
} from "./mapper";

export class ShopifyCommerceClient implements CommerceClient {


  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isShopifyConfigured() || !slug) return null;

    try {
      const res = await shopifyFetch<{
        product?: RawShopifyProductNode | null;
      }>({
        query: productByHandleQuery,
        variables: { handle: slug },
      });

      if (!res.data?.product) return null;
      return mapShopifyProduct(res.data.product);
    } catch (err) {
      console.error(`[GENSIS Commerce: Shopify] Error fetching product '${slug}':`, err);
      return null;
    }
  }

  /** Fetch a paginated list of products. Supports optional collection filter. */
  async getProducts(options?: ProductQueryOptions): Promise<PaginatedResult<Product>> {
    if (!isShopifyConfigured()) {
      return { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } };
    }
    const first = options?.first ?? 20;
    const after = options?.after;
    const query = options?.collectionSlug ? `collection:'${options.collectionSlug}'` : undefined;
    try {
      const res = await shopifyFetch<{
        products?: {
          edges?: Array<{ node?: RawShopifyProductNode }>;
          pageInfo?: {
            hasNextPage?: boolean;
            hasPreviousPage?: boolean;
            startCursor?: string;
            endCursor?: string;
          };
        };
      }>({
        query: productsQuery,
        variables: { first, after, query },
      });
      const edges = res.data?.products?.edges || [];
      const items = edges.map((e) => mapShopifyProduct(e.node)).filter((p): p is Product => p !== null);
      const rawPageInfo = res.data?.products?.pageInfo;
      const pageInfo = {
        hasNextPage: Boolean(rawPageInfo?.hasNextPage),
        hasPreviousPage: Boolean(rawPageInfo?.hasPreviousPage),
        startCursor: rawPageInfo?.startCursor,
        endCursor: rawPageInfo?.endCursor,
      };
      const hasError = Boolean(res.errors && res.errors.length > 0);
      return { items, pageInfo, ...(hasError ? { error: true } : {}) };
    } catch (err) {
      console.error(`[GENSIS Commerce: Shopify] Error fetching products:`, err);
      return { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, error: true };
    }
  }

  /** Search products by text query with pagination */
  async searchProducts(query: string, options?: { first?: number; after?: string }): Promise<PaginatedResult<Product>> {
    if (!isShopifyConfigured()) {
      return { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } };
    }
    const first = options?.first ?? 20;
    const after = options?.after;
    try {
      const res = await shopifyFetch<{
        products?: {
          edges?: Array<{ node?: RawShopifyProductNode }>;
          pageInfo?: {
            hasNextPage?: boolean;
            hasPreviousPage?: boolean;
            startCursor?: string;
            endCursor?: string;
          };
        };
      }>({
        query: searchProductsQuery,
        variables: { query, first, after },
      });
      const edges = res.data?.products?.edges || [];
      const items = edges.map((e) => mapShopifyProduct(e.node)).filter((p): p is Product => p !== null);
      const rawPageInfo = res.data?.products?.pageInfo;
      const pageInfo = {
        hasNextPage: Boolean(rawPageInfo?.hasNextPage),
        hasPreviousPage: Boolean(rawPageInfo?.hasPreviousPage),
        startCursor: rawPageInfo?.startCursor,
        endCursor: rawPageInfo?.endCursor,
      };
      const hasError = Boolean(res.errors && res.errors.length > 0);
      return { items, pageInfo, ...(hasError ? { error: true } : {}) };
    } catch (err) {
      console.error(`[GENSIS Commerce: Shopify] Error searching products:`, err);
      return { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, error: true };
    }
  }

  async getCollections(options?: CollectionQueryOptions): Promise<PaginatedResult<Collection>> {
    if (!isShopifyConfigured()) {
      return { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: undefined, endCursor: undefined } };
    }

    const first = options?.first ?? 20;
    const after = options?.after;
    try {
      const res = await shopifyFetch<{
        collections?: {
          edges?: Array<{ node?: RawShopifyCollectionNode }>;
          pageInfo?: {
            hasNextPage?: boolean;
            hasPreviousPage?: boolean;
            startCursor?: string;
            endCursor?: string;
          };
        };
      }>({
        query: collectionsQuery,
        variables: { first, after },
      });
      const edges = res.data?.collections?.edges || [];
      const items = edges
        .map((e) => mapShopifyCollection(e.node))
        .filter((c): c is Collection => c !== null);
      const rawPageInfo = res.data?.collections?.pageInfo;
      const pageInfo = {
        hasNextPage: Boolean(rawPageInfo?.hasNextPage),
        hasPreviousPage: Boolean(rawPageInfo?.hasPreviousPage),
        startCursor: rawPageInfo?.startCursor,
        endCursor: rawPageInfo?.endCursor,
      };
      const hasError = Boolean(res.errors && res.errors.length > 0);
      return { items, pageInfo, ...(hasError ? { error: true } : {}) };
    } catch (err) {
      console.error(`[GENSIS Commerce: Shopify] Error fetching collections:`, err);
      return { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: undefined, endCursor: undefined }, error: true };
    }
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    if (!isShopifyConfigured() || !slug) return null;

    try {
      const res = await shopifyFetch<{
        collection?: RawShopifyCollectionNode | null;
      }>({
        query: collectionByHandleQuery,
        variables: { handle: slug, firstProducts: 20 },
      });

      if (!res.data?.collection) return null;
      return mapShopifyCollection(res.data.collection);
    } catch (err) {
      console.error(`[GENSIS Commerce: Shopify] Error fetching collection '${slug}':`, err);
      return null;
    }
  }



  private async getCollectionWithProducts(
    slug: string,
    limit: number
  ): Promise<{ collection: Collection; products: Product[] } | null> {
    const res = await shopifyFetch<{
      collection?: (RawShopifyCollectionNode & {
        products?: {
          edges?: Array<{ node?: RawShopifyProductNode }>;
        };
      }) | null;
    }>({
      query: collectionByHandleQuery,
      variables: { handle: slug, firstProducts: limit },
    });

    if (!res.data?.collection) return null;

    const collection = mapShopifyCollection(res.data.collection);
    if (!collection) return null;

    const productEdges = res.data.collection.products?.edges || [];
    const products = productEdges
      .map((e) => mapShopifyProduct(e.node))
      .filter((p): p is Product => p !== null);

    return { collection, products };
  }

  async getCart(cartId: string): Promise<CommerceResult<Cart>> {
    if (!isShopifyConfigured()) {
      return { ok: false, error: { code: "UNAVAILABLE", message: "Storefront credentials are not configured." } };
    }
    if (!cartId) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Cart ID is required." } };
    }

    try {
      const res = await shopifyFetch<{ cart?: RawShopifyCartNode | null }>({
        query: getCartQuery,
        variables: { id: cartId },
        cache: "no-store",
      });

      if (res.errors && res.errors.length > 0) {
        return {
          ok: false,
          error: {
            code: "PROVIDER_ERROR",
            message: res.errors.map((e) => e.message).join("; "),
          },
        };
      }

      if (!res.data?.cart) {
        return { ok: false, error: { code: "NOT_FOUND", message: "Cart not found or expired." } };
      }

      const cart = mapShopifyCart(res.data.cart);
      if (!cart) {
        return { ok: false, error: { code: "NOT_FOUND", message: "Invalid cart payload." } };
      }

      return { ok: true, data: cart };
    } catch (err) {
      console.error("[GENSIS Commerce: Shopify] Error getting cart:", err);
      return { ok: false, error: { code: "PROVIDER_ERROR", message: "Failed to communicate with provider." } };
    }
  }

  async createCart(lines?: CartLineInput[]): Promise<CommerceResult<Cart>> {
    if (!isShopifyConfigured()) {
      return { ok: false, error: { code: "UNAVAILABLE", message: "Storefront credentials are not configured." } };
    }

    const formattedLines = (lines || []).map((l) => ({
      merchandiseId: l.variantId,
      quantity: l.quantity,
    }));

    try {
      const res = await shopifyFetch<{
        cartCreate?: {
          cart?: RawShopifyCartNode | null;
          userErrors?: RawShopifyUserError[];
          warnings?: RawShopifyWarning[];
        };
      }>({
        query: createCartMutation,
        variables: { input: { lines: formattedLines } },
        cache: "no-store",
      });

      if (res.errors && res.errors.length > 0) {
        return {
          ok: false,
          error: { code: "PROVIDER_ERROR", message: res.errors.map((e) => e.message).join("; ") },
        };
      }

      const payload = res.data?.cartCreate;
      if (payload?.userErrors && payload.userErrors.length > 0) {
        const messages = payload.userErrors.map((e) => e.message).filter((m): m is string => Boolean(m));
        return {
          ok: false,
          error: {
            code: "USER_ERROR",
            message: messages[0] || "Cart creation failed due to user errors.",
            userErrors: messages,
            warnings: payload.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m)),
          },
        };
      }

      const cart = mapShopifyCart(payload?.cart);
      if (!cart) {
        return { ok: false, error: { code: "PROVIDER_ERROR", message: "Failed to map created cart." } };
      }

      const createWarnings = payload?.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m));
      if (createWarnings && createWarnings.length > 0) {
        console.warn("[GENSIS Commerce: Shopify] cartCreate warnings:", createWarnings);
      }

      return { ok: true, data: cart };
    } catch (err) {
      console.error("[GENSIS Commerce: Shopify] Error creating cart:", err);
      return { ok: false, error: { code: "PROVIDER_ERROR", message: "Failed to communicate with provider." } };
    }
  }

  async addCartLines(cartId: string, lines: CartLineInput[]): Promise<CommerceResult<Cart>> {
    if (!isShopifyConfigured()) {
      return { ok: false, error: { code: "UNAVAILABLE", message: "Storefront credentials are not configured." } };
    }
    if (!cartId) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Cart ID is required." } };
    }

    const formattedLines = lines.map((l) => ({
      merchandiseId: l.variantId,
      quantity: l.quantity,
    }));

    try {
      const res = await shopifyFetch<{
        cartLinesAdd?: {
          cart?: RawShopifyCartNode | null;
          userErrors?: RawShopifyUserError[];
          warnings?: RawShopifyWarning[];
        };
      }>({
        query: addCartLinesMutation,
        variables: { cartId, lines: formattedLines },
        cache: "no-store",
      });

      if (res.errors && res.errors.length > 0) {
        return {
          ok: false,
          error: { code: "PROVIDER_ERROR", message: res.errors.map((e) => e.message).join("; ") },
        };
      }

      const payload = res.data?.cartLinesAdd;
      if (payload?.userErrors && payload.userErrors.length > 0) {
        const messages = payload.userErrors.map((e) => e.message).filter((m): m is string => Boolean(m));
        return {
          ok: false,
          error: {
            code: "USER_ERROR",
            message: messages[0] || "Adding cart line failed due to user errors.",
            userErrors: messages,
            warnings: payload.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m)),
          },
        };
      }

      const cart = mapShopifyCart(payload?.cart);
      if (!cart) {
        return { ok: false, error: { code: "NOT_FOUND", message: "Cart not found or expired." } };
      }

      const addWarnings = payload?.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m));
      if (addWarnings && addWarnings.length > 0) {
        console.warn("[GENSIS Commerce: Shopify] cartLinesAdd warnings:", addWarnings);
      }

      return { ok: true, data: cart };
    } catch (err) {
      console.error("[GENSIS Commerce: Shopify] Error adding cart lines:", err);
      return { ok: false, error: { code: "PROVIDER_ERROR", message: "Failed to communicate with provider." } };
    }
  }

  async updateCartLines(cartId: string, lines: CartLineUpdateInput[]): Promise<CommerceResult<Cart>> {
    if (!isShopifyConfigured()) {
      return { ok: false, error: { code: "UNAVAILABLE", message: "Storefront credentials are not configured." } };
    }
    if (!cartId) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Cart ID is required." } };
    }

    const formattedLines = lines.map((l) => ({
      id: l.id,
      quantity: l.quantity,
    }));

    try {
      const res = await shopifyFetch<{
        cartLinesUpdate?: {
          cart?: RawShopifyCartNode | null;
          userErrors?: RawShopifyUserError[];
          warnings?: RawShopifyWarning[];
        };
      }>({
        query: updateCartLinesMutation,
        variables: { cartId, lines: formattedLines },
        cache: "no-store",
      });

      if (res.errors && res.errors.length > 0) {
        return {
          ok: false,
          error: { code: "PROVIDER_ERROR", message: res.errors.map((e) => e.message).join("; ") },
        };
      }

      const payload = res.data?.cartLinesUpdate;
      if (payload?.userErrors && payload.userErrors.length > 0) {
        const messages = payload.userErrors.map((e) => e.message).filter((m): m is string => Boolean(m));
        return {
          ok: false,
          error: {
            code: "USER_ERROR",
            message: messages[0] || "Updating cart line failed due to user errors.",
            userErrors: messages,
            warnings: payload.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m)),
          },
        };
      }

      const cart = mapShopifyCart(payload?.cart);
      if (!cart) {
        return { ok: false, error: { code: "NOT_FOUND", message: "Cart not found or expired." } };
      }

      const updateWarnings = payload?.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m));
      if (updateWarnings && updateWarnings.length > 0) {
        console.warn("[GENSIS Commerce: Shopify] cartLinesUpdate warnings:", updateWarnings);
      }

      return { ok: true, data: cart };
    } catch (err) {
      console.error("[GENSIS Commerce: Shopify] Error updating cart lines:", err);
      return { ok: false, error: { code: "PROVIDER_ERROR", message: "Failed to communicate with provider." } };
    }
  }

  async removeCartLines(cartId: string, lineIds: string[]): Promise<CommerceResult<Cart>> {
    if (!isShopifyConfigured()) {
      return { ok: false, error: { code: "UNAVAILABLE", message: "Storefront credentials are not configured." } };
    }
    if (!cartId) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Cart ID is required." } };
    }

    try {
      const res = await shopifyFetch<{
        cartLinesRemove?: {
          cart?: RawShopifyCartNode | null;
          userErrors?: RawShopifyUserError[];
          warnings?: RawShopifyWarning[];
        };
      }>({
        query: removeCartLinesMutation,
        variables: { cartId, lineIds },
        cache: "no-store",
      });

      if (res.errors && res.errors.length > 0) {
        return {
          ok: false,
          error: { code: "PROVIDER_ERROR", message: res.errors.map((e) => e.message).join("; ") },
        };
      }

      const payload = res.data?.cartLinesRemove;
      if (payload?.userErrors && payload.userErrors.length > 0) {
        const messages = payload.userErrors.map((e) => e.message).filter((m): m is string => Boolean(m));
        return {
          ok: false,
          error: {
            code: "USER_ERROR",
            message: messages[0] || "Removing cart line failed due to user errors.",
            userErrors: messages,
            warnings: payload.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m)),
          },
        };
      }

      const cart = mapShopifyCart(payload?.cart);
      if (!cart) {
        return { ok: false, error: { code: "NOT_FOUND", message: "Cart not found or expired." } };
      }

      const removeWarnings = payload?.warnings?.map((w) => w.message).filter((m): m is string => Boolean(m));
      if (removeWarnings && removeWarnings.length > 0) {
        console.warn("[GENSIS Commerce: Shopify] cartLinesRemove warnings:", removeWarnings);
      }

      return { ok: true, data: cart };
    } catch (err) {
      console.error("[GENSIS Commerce: Shopify] Error removing cart lines:", err);
      return { ok: false, error: { code: "PROVIDER_ERROR", message: "Failed to communicate with provider." } };
    }
  }

  async updateCartBuyerIdentity(
    cartId: string,
    customerAccessToken: string
  ): Promise<CommerceResult<Cart>> {
    if (!isShopifyConfigured()) {
      return { ok: false, error: { code: "UNAVAILABLE", message: "Storefront credentials are not configured." } };
    }
    if (!cartId || !customerAccessToken) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Cart ID and customer access token are required." } };
    }

    try {
      const res = await shopifyFetch<{
        cartBuyerIdentityUpdate?: {
          cart?: RawShopifyCartNode | null;
          userErrors?: RawShopifyUserError[];
          warnings?: RawShopifyWarning[];
        };
      }>({
        query: updateCartBuyerIdentityMutation,
        variables: {
          cartId,
          buyerIdentity: { customerAccessToken },
        },
        cache: "no-store",
      });

      if (res.errors && res.errors.length > 0) {
        return {
          ok: false,
          error: { code: "PROVIDER_ERROR", message: res.errors.map((e) => e.message).join("; ") },
        };
      }

      const payload = res.data?.cartBuyerIdentityUpdate;
      if (payload?.userErrors && payload.userErrors.length > 0) {
        const messages = payload.userErrors.map((e) => e.message).filter((m): m is string => Boolean(m));
        return {
          ok: false,
          error: {
            code: "USER_ERROR",
            message: messages[0] || "Updating cart buyer identity failed.",
            userErrors: messages,
          },
        };
      }

      const cart = mapShopifyCart(payload?.cart);
      if (!cart) {
        return { ok: false, error: { code: "NOT_FOUND", message: "Cart not found or expired." } };
      }

      return { ok: true, data: cart };
    } catch (err) {
      console.error("[GENSIS Commerce: Shopify] Error updating cart buyer identity:", err);
      return { ok: false, error: { code: "PROVIDER_ERROR", message: "Failed to communicate with provider." } };
    }
  }
}
