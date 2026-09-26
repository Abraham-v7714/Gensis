/**
 * Commerce Client Interface — Stage 4.6
 *
 * Defines the provider-neutral interface contract for all commerce operations
 * (product catalog, collection discovery, search) in GENSIS.
 *
 * Principles:
 * - Defined strictly around GENSIS business domain models.
 * - No Shopify, GraphQL, or provider-specific types exposed.
 * - Interface remains provider-agnostic to support future providers if necessary.
 */

import type { Product } from "@/types/product";
import type { Collection } from "@/types/collection";
import type { Cart } from "@/types/cart";

/** Pagination cursor info returned by Storefront API */
export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
};

/** Generic container for paginated results */
export type PaginatedResult<T> = {
  items: T[];
  pageInfo: PageInfo;
  error?: boolean;
};

export type CommerceErrorCode =
  | "UNAVAILABLE"
  | "NOT_FOUND"
  | "USER_ERROR"
  | "VALIDATION_ERROR"
  | "PROVIDER_ERROR";

export type CommerceError = {
  code: CommerceErrorCode;
  message: string;
  userErrors?: string[];
  warnings?: string[];
};

export type CommerceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CommerceError };

export type CartLineInput = {
  variantId: string;
  quantity: number;
};

export type CartLineUpdateInput = {
  id: string;
  quantity: number;
};

export type ProductQueryOptions = {
  first?: number;
  after?: string;
  collectionSlug?: string;
};

export type CollectionQueryOptions = {
  first?: number;
  after?: string;
};

export interface CommerceClient {
  /**
   * Fetches a list of products.
   */
  getProducts(options?: ProductQueryOptions): Promise<PaginatedResult<Product>>;

  /**
   * Fetches a single product by its handle/slug.
   */
  getProductBySlug(slug: string): Promise<Product | null>;

  /**
   * Fetches a list of collections.
   */
  getCollections(options?: CollectionQueryOptions): Promise<PaginatedResult<Collection>>;

  /**
   * Fetches a single collection by its handle/slug.
   */
  getCollectionBySlug(slug: string): Promise<Collection | null>;

  /**
   * Searches products by search term.
   */
  searchProducts(query: string, options?: { first?: number; after?: string }): Promise<PaginatedResult<Product>>;

  /**
   * Retrieves a cart by its ID.
   */
  getCart(cartId: string): Promise<CommerceResult<Cart>>;

  /**
   * Creates a new cart with optional initial lines.
   */
  createCart(lines?: CartLineInput[]): Promise<CommerceResult<Cart>>;

  /**
   * Adds lines to an existing cart.
   */
  addCartLines(cartId: string, lines: CartLineInput[]): Promise<CommerceResult<Cart>>;

  /**
   * Updates line quantities in an existing cart.
   */
  updateCartLines(cartId: string, lines: CartLineUpdateInput[]): Promise<CommerceResult<Cart>>;

  /**
   * Removes line items from an existing cart.
   */
  removeCartLines(cartId: string, lineIds: string[]): Promise<CommerceResult<Cart>>;

  /**
   * Updates buyer identity on an existing cart using the customer's access token.
   */
  updateCartBuyerIdentity(cartId: string, customerAccessToken: string): Promise<CommerceResult<Cart>>;
}
