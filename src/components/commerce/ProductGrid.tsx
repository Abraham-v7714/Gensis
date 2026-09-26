import * as React from "react";
import type { Product } from "@/types/product";
import { Grid } from "@/components/layout/Grid";
import { ProductCard } from "./ProductCard";

export interface ProductGridProps {
  products: Product[];
  className?: string;
}

export const ProductGrid = ({ products, className = "" }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)]">
        No products available.
      </p>
    );
  }

  return (
    <Grid className={`md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  );
};
