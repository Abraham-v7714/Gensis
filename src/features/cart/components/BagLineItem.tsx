"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CartLine } from "@/types/cart";
import { GensisImage } from "@/components/shared/GensisImage";
import { Price } from "@/components/commerce/Price";
import { QuantitySelector } from "./QuantitySelector";
import { updateQuantityAction, removeItemAction } from "../actions";

export interface BagLineItemProps {
  line: CartLine;
  className?: string;
}

export const BagLineItem = ({ line, className = "" }: BagLineItemProps) => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const title = line.productTitle || line.variant.title;
  const href = line.productSlug ? `/products/${line.productSlug}` : null;

  const handleUpdateQuantity = (newQuantity: number) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateQuantityAction({ lineId: line.id, quantity: newQuantity });
      if (res.ok) {
        router.refresh();
      } else {
        setErrorMsg(res.error.message);
      }
    });
  };

  const handleRemove = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await removeItemAction({ lineId: line.id });
      if (res.ok) {
        router.refresh();
      } else {
        setErrorMsg(res.error.message);
      }
    });
  };

  return (
    <article
      className={`py-[var(--spacing-6)] border-b border-[var(--color-border-subtle)] ${className}`}
    >
      <div className="grid grid-cols-12 gap-[var(--spacing-4)] items-center">
        {/* Thumbnail Image */}
        <div className="col-span-3 sm:col-span-2">
          {href ? (
            <Link href={href} className="block overflow-hidden aspect-[4/5] bg-[var(--color-bg-secondary)]">
              {line.image ? (
                <GensisImage src={line.image.url} alt={line.image.alt || title} aspectRatio="4/5" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-fg-muted)]">
                  <span className="font-sans text-[length:var(--text-caption)] uppercase">GENSIS</span>
                </div>
              )}
            </Link>
          ) : (
            <div className="aspect-[4/5] bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-fg-muted)]">
              {line.image ? (
                <GensisImage src={line.image.url} alt={line.image.alt || title} aspectRatio="4/5" />
              ) : (
                <span className="font-sans text-[length:var(--text-caption)] uppercase">GENSIS</span>
              )}
            </div>
          )}
        </div>

        {/* Product Details & Variant */}
        <div className="col-span-9 sm:col-span-5 flex flex-col gap-[var(--spacing-1)]">
          {href ? (
            <Link
              href={href}
              className="font-serif text-[length:var(--text-title)] text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
            >
              {title}
            </Link>
          ) : (
            <h3 className="font-serif text-[length:var(--text-title)] text-[var(--color-fg-primary)]">
              {title}
            </h3>
          )}

          {/* Option summary */}
          {line.variant.options.length > 0 && (
            <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
              {line.variant.options.map((opt) => `${opt.name}: ${opt.value}`).join(" / ")}
            </p>
          )}

          {/* Unit Price */}
          <Price money={line.variant.price} className="text-[length:var(--text-small)] text-[var(--color-fg-muted)]" />

          {/* Remove Button for mobile */}
          <div className="mt-[var(--spacing-2)] sm:hidden">
            <button
              type="button"
              disabled={isPending}
              onClick={handleRemove}
              aria-label={`Remove ${title} from Bag`}
              className="font-sans text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] underline disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="col-span-7 sm:col-span-3 flex justify-start sm:justify-center">
          <QuantitySelector
            quantity={line.quantity}
            disabled={isPending}
            onUpdate={handleUpdateQuantity}
            ariaLabelPrefix={title}
          />
        </div>

        {/* Total Price & Remove Button for desktop */}
        <div className="col-span-5 sm:col-span-2 flex flex-col items-end gap-[var(--spacing-2)]">
          <Price money={line.cost.totalAmount} className="text-[length:var(--text-body)] font-medium" />

          <button
            type="button"
            disabled={isPending}
            onClick={handleRemove}
            aria-label={`Remove ${title} from Bag`}
            className="hidden sm:inline-block font-sans text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] underline disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
          >
            Remove
          </button>
        </div>
      </div>

      {errorMsg && (
        <p className="font-sans text-[length:var(--text-caption)] text-red-700 mt-[var(--spacing-2)]" role="alert">
          {errorMsg}
        </p>
      )}
    </article>
  );
};
