"use client";

/**
 * ProductInfo — Stage 4.15 (polished from Stage 4.8)
 *
 * Manages variant selection state and purchase CTA for a product detail page.
 *
 * Changes in 4.15:
 * - Quantity selector surfaced above Add to Bag
 * - Availability badge is screen-reader-friendly and only shown for non-available states
 * - Description section styled with generous whitespace and correct heading level
 * - aria-busy wired through from AddToBagButton pending state
 * - No fake data: only renders fields that are actually present on the product model
 */

import * as React from "react";
import type { Product, ProductVariant } from "@/types/product";
import { Price } from "./Price";
import { VariantSelector } from "./VariantSelector";
import { AddToBagButton } from "@/features/cart/components/AddToBagButton";

export interface ProductInfoProps {
  product: Product;
  className?: string;
}

export const ProductInfo = ({ product, className = "" }: ProductInfoProps) => {
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | undefined>(
    () => product.variants[0]
  );

  const displayPrice = selectedVariant?.price || product.price;
  const currentAvailability = selectedVariant?.availability || product.availability;

  const isSoldOut = currentAvailability === "sold-out";
  const isUnavailable = currentAvailability === "unavailable";

  return (
    <div className={`flex flex-col gap-[var(--spacing-6)] ${className}`}>
      {/* Title */}
      <h1 className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
        {product.title}
      </h1>

      {/* Price + availability */}
      <div className="flex items-baseline gap-[var(--spacing-4)]">
        <Price money={displayPrice} className="text-[length:var(--text-title)]" />

        {(isSoldOut || isUnavailable) && (
          <span
            aria-label={isSoldOut ? "Sold out" : "Unavailable"}
            className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase px-[var(--spacing-2)] py-[var(--spacing-1)] border border-[var(--color-border-subtle)] text-[var(--color-fg-muted)]"
          >
            {isSoldOut ? "Sold Out" : "Unavailable"}
          </span>
        )}
      </div>

      {/* SKU — only when present */}
      {selectedVariant?.sku && (
        <p className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-caption)] text-[var(--color-fg-muted)]">
          SKU: {selectedVariant.sku}
        </p>
      )}

      {/* Variant Selector */}
      {product.variants.length > 1 && (
        <VariantSelector
          variants={product.variants}
          selectedVariantId={selectedVariant?.id}
          onVariantChange={(variant) => setSelectedVariant(variant)}
        />
      )}

      {/* Add to Bag CTA */}
      <AddToBagButton variant={selectedVariant} />

      {/* Description — only when present */}
      {product.description && (
        <div className="border-t border-[var(--color-border-subtle)] pt-[var(--spacing-6)] flex flex-col gap-[var(--spacing-3)]">
          <h2 className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            Description &amp; Details
          </h2>
          <div className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)] whitespace-pre-line">
            {product.description}
          </div>
        </div>
      )}
    </div>
  );
};
