/**
 * Shopify Response Mapper — Stage 4.6
 *
 * Maps raw Shopify Storefront API GraphQL responses into GENSIS provider-neutral
 * domain models (Product, ProductVariant, Collection, Money, etc.).
 *
 * Rules:
 * - Pure functions only.
 * - No Shopify GraphQL response types leak beyond this module.
 * - Handle missing or partial fields gracefully with fallbacks.
 * - Maintain strict typing without using `any`.
 */

import type { Money } from "@/types/common";
import type {
  Product,
  ProductVariant,
  ProductOption,
  ProductImage,
  ProductAvailability,
} from "@/types/product";
import type { Collection } from "@/types/collection";
import type { Cart, CartLine } from "@/types/cart";

// Internal types representing raw Shopify Storefront API GraphQL shapes
export type RawShopifyMoneyV2 = {
  amount?: string | number;
  currencyCode?: string;
};

export type RawShopifyImage = {
  id?: string;
  url?: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type RawShopifySelectedOption = {
  name?: string;
  value?: string;
};

export type RawShopifyVariant = {
  id?: string;
  title?: string;
  sku?: string | null;
  availableForSale?: boolean;
  quantityAvailable?: number | null;
  price?: RawShopifyMoneyV2;
  selectedOptions?: RawShopifySelectedOption[];
};

export type RawShopifyOption = {
  id?: string;
  name?: string;
  values?: string[];
};

export type RawShopifyProductNode = {
  id?: string;
  handle?: string;
  title?: string;
  description?: string;
  availableForSale?: boolean;
  priceRange?: {
    minVariantPrice?: RawShopifyMoneyV2;
  };
  images?: {
    edges?: Array<{ node?: RawShopifyImage }>;
  };
  options?: RawShopifyOption[];
  variants?: {
    edges?: Array<{ node?: RawShopifyVariant }>;
  };
};

export type RawShopifyCollectionNode = {
  id?: string;
  handle?: string;
  title?: string;
  description?: string;
  image?: RawShopifyImage;
  products?: {
    edges?: Array<{ node?: RawShopifyProductNode }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
};

export type RawShopifyCartLineNode = {
  id?: string;
  quantity?: number;
  cost?: {
    totalAmount?: RawShopifyMoneyV2;
  };
  merchandise?: (RawShopifyVariant & {
    product?: {
      id?: string;
      handle?: string;
      title?: string;
      featuredImage?: RawShopifyImage;
    };
  }) | null;
};

export type RawShopifyCartNode = {
  id?: string;
  checkoutUrl?: string;
  totalQuantity?: number;
  cost?: {
    totalAmount?: RawShopifyMoneyV2;
    subtotalAmount?: RawShopifyMoneyV2;
  };
  lines?: {
    edges?: Array<{ node?: RawShopifyCartLineNode }>;
  };
};

export type RawShopifyUserError = {
  field?: string[];
  message?: string;
  code?: string;
};

export type RawShopifyWarning = {
  target?: string;
  message?: string;
  code?: string;
};

/**
 * Maps raw Shopify MoneyV2 object to GENSIS Money domain model.
 */
export function mapShopifyMoney(raw?: RawShopifyMoneyV2 | null): Money {
  const amountStr = String(raw?.amount ?? "0");
  const parsed = parseFloat(amountStr);
  const amount = Number.isNaN(parsed) ? 0 : parsed;
  const currency = raw?.currencyCode?.trim() || "USD";

  return {
    amount,
    currency,
  };
}

/**
 * Maps Shopify availability boolean & inventory to GENSIS ProductAvailability.
 */
export function mapShopifyAvailability(
  availableForSale?: boolean | null,
  quantityAvailable?: number | null
): ProductAvailability {
  // If explicit inventory count indicates zero, treat as sold-out regardless of sale flag.
  if (quantityAvailable === 0) {
    return "sold-out";
  }
  // If the sale flag is false, it's sold-out.
  if (availableForSale === false) {
    return "sold-out";
  }
  // If the sale flag is true and we have inventory (or inventory not zero), it's available.
  if (availableForSale === true) {
    return "available";
  }
  // Fallback when both flags missing: treat as unavailable.
  return "unavailable";
}

/**
 * Maps raw Shopify Image node to GENSIS ProductImage domain model.
 */
export function mapShopifyImage(raw?: RawShopifyImage | null): ProductImage | null {
  if (!raw || !raw.url) return null;

  return {
    id: raw.id || raw.url,
    url: raw.url,
    alt: raw.altText || "",
    width: raw.width ?? undefined,
    height: raw.height ?? undefined,
  };
}

/**
 * Maps raw Shopify ProductVariant node to GENSIS ProductVariant domain model.
 */
export function mapShopifyVariant(raw?: RawShopifyVariant | null): ProductVariant | null {
  if (!raw || !raw.id) return null;

  const options: ProductOption[] = (raw.selectedOptions || [])
    .filter((opt): opt is { name: string; value: string } => Boolean(opt.name && opt.value))
    .map((opt) => ({ name: opt.name, value: opt.value }));

  return {
    id: raw.id,
    title: raw.title || "Default Variant",
    sku: raw.sku || undefined,
    price: mapShopifyMoney(raw.price),
    availability: mapShopifyAvailability(raw.availableForSale, raw.quantityAvailable),
    options,
  };
}

/**
 * Maps raw Shopify Product node to GENSIS Product domain model.
 */
export function mapShopifyProduct(raw?: RawShopifyProductNode | null): Product | null {
  if (!raw || !raw.id || !raw.handle) return null;

  const images: ProductImage[] = (raw.images?.edges || [])
    .map((e) => mapShopifyImage(e.node))
    .filter((img): img is ProductImage => img !== null);

  const variants: ProductVariant[] = (raw.variants?.edges || [])
    .map((e) => mapShopifyVariant(e.node))
    .filter((v): v is ProductVariant => v !== null);

  const firstVariantPrice = variants[0]?.price;
  const price = firstVariantPrice || mapShopifyMoney(raw.priceRange?.minVariantPrice);

  return {
    id: raw.id,
    slug: raw.handle,
    title: raw.title || raw.handle,
    description: raw.description || "",
    images,
    price,
    variants,
    availability: mapShopifyAvailability(raw.availableForSale),
  };
}

/**
 * Maps raw Shopify Collection node to GENSIS Collection domain model.
 */
export function mapShopifyCollection(raw?: RawShopifyCollectionNode | null): Collection | null {
  if (!raw || !raw.id || !raw.handle) return null;

  const imageObj = mapShopifyImage(raw.image);

  return {
    id: raw.id,
    slug: raw.handle,
    title: raw.title || raw.handle,
    description: raw.description || undefined,
    image: imageObj?.url || undefined,
  };
}

/**
 * Maps raw Shopify CartLine node to GENSIS CartLine domain model.
 */
export function mapShopifyCartLine(raw?: RawShopifyCartLineNode | null): CartLine | null {
  if (!raw || !raw.id || !raw.merchandise) return null;

  const variant = mapShopifyVariant(raw.merchandise);
  if (!variant) return null;

  const productTitle = raw.merchandise.product?.title || undefined;
  const productSlug = raw.merchandise.product?.handle || undefined;
  const image = mapShopifyImage(raw.merchandise.product?.featuredImage);

  return {
    id: raw.id,
    variant,
    productTitle,
    productSlug,
    image: image || undefined,
    quantity: raw.quantity ?? 1,
    cost: {
      totalAmount: mapShopifyMoney(raw.cost?.totalAmount),
    },
  };
}

/**
 * Maps raw Shopify Cart node to GENSIS Cart domain model.
 */
export function mapShopifyCart(raw?: RawShopifyCartNode | null): Cart | null {
  if (!raw || !raw.id) return null;

  const lineEdges = raw.lines?.edges || [];
  const lines = lineEdges
    .map((e) => mapShopifyCartLine(e.node))
    .filter((l): l is CartLine => l !== null);

  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl || undefined,
    lines,
    totalQuantity: raw.totalQuantity ?? 0,
    cost: {
      totalAmount: mapShopifyMoney(raw.cost?.totalAmount),
      subtotalAmount: mapShopifyMoney(raw.cost?.subtotalAmount),
    },
  };
}
