/**
 * Cart Domain Model — Stage 4.6
 *
 * Provider-neutral domain models for storefront cart and cart items.
 */

import type { ProductVariant, ProductImage } from "./product";
import type { Money } from "./common";

export type CartLine = {
  id: string;
  variant: ProductVariant;
  productTitle?: string;
  productSlug?: string;
  image?: ProductImage;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
};

export type Cart = {
  id: string;
  checkoutUrl?: string;
  lines: CartLine[];
  totalQuantity: number;
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
  };
};
