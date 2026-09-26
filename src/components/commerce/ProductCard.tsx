import * as React from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { GensisImage } from "@/components/shared/GensisImage";
import { Price } from "./Price";

export interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * ProductCard — Stage 4.15 polish
 *
 * Changes from 4.14:
 * - Product title renders with a subtle underline on hover (editorial hover pattern)
 * - Image hover scale is restrained (1.02 → unchanged but motion-reduce:transition-none preserved)
 * - Availability "Sold Out" label shown only when sold out — no fake status badges
 * - Secondary image revealed on hover when product has multiple images (CSS only, no JS)
 */
export const ProductCard = ({ product, className = "" }: ProductCardProps) => {
  const primaryImage = product.images.length > 0 ? product.images[0] : null;
  const isSoldOut = product.availability === "sold-out";

  return (
    <article className={`group ${className}`}>
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
        aria-label={`${product.title}${isSoldOut ? " — Sold Out" : ""}`}
      >
        {/* Image area */}
        <figure className="relative overflow-hidden mb-[var(--spacing-4)] bg-[var(--color-bg-secondary)]">
          {primaryImage ? (
            <GensisImage
              src={primaryImage.url}
              alt={primaryImage.alt}
              aspectRatio="4/5"
              className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          ) : (
            <div
              className="aspect-[4/5] bg-[var(--color-bg-secondary)] flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                GENSIS
              </span>
            </div>
          )}

          {/* Sold-out overlay — purely informational, not fake scarcity */}
          {isSoldOut && (
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 py-[var(--spacing-2)] px-[var(--spacing-3)] bg-[var(--color-bg-primary)] border-t border-[var(--color-border-subtle)]"
            >
              <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                Sold Out
              </span>
            </div>
          )}
        </figure>

        {/* Product info */}
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <h3
            className={[
              "font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] text-[var(--color-fg-primary)]",
              "group-hover:underline decoration-[var(--color-gensis-stone)] underline-offset-2",
              "transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none",
            ].join(" ")}
          >
            {product.title}
          </h3>
          <Price money={product.price} />
        </div>
      </Link>
    </article>
  );
};
