import { Money } from "./common";

export type ProductAvailability =
  | "available"
  | "unavailable"
  | "sold-out";

export type ProductOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  sku?: string;
  price: Money;
  availability: ProductAvailability;
  options: ProductOption[];
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: ProductImage[];
  price: Money;
  variants: ProductVariant[];
  availability: ProductAvailability;
};
