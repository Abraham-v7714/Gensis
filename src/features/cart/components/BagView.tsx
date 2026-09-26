import * as React from "react";
import Link from "next/link";
import type { Cart } from "@/types/cart";
import type { CommerceError } from "@/lib/commerce/types";
import { Price } from "@/components/commerce/Price";
import { CommerceState } from "@/components/commerce/CommerceState";
import { BagLineItem } from "./BagLineItem";
import { CheckoutButton } from "@/features/checkout/components/CheckoutButton";

export interface BagViewProps {
  cart: Cart | null;
  error?: CommerceError;
  className?: string;
}

/**
 * BagView — Stage 4.15 polish
 *
 * Changes:
 * - Empty state is premium, editorial and includes a concise GENSIS CTA.
 * - Summary section layout is cleaner: left/right alignment on desktop.
 * - "Continue shopping" link added below checkout CTA.
 * - Price and subtotal hierarchy is tighter.
 * - No invented content: only authoritative Shopify cart data is rendered.
 */
export const BagView = ({ cart, error, className = "" }: BagViewProps) => {
  if (error?.code === "UNAVAILABLE") {
    return <CommerceState type="unavailable" />;
  }

  if (error && error.code !== "NOT_FOUND") {
    return <CommerceState type="error" message={error.message} />;
  }

  // Premium empty state
  if (!cart || cart.lines.length === 0) {
    return (
      <div
        className={`py-[var(--spacing-24)] flex flex-col items-center gap-[var(--spacing-8)] text-center ${className}`}
      >
        {/* Brand signature */}
        <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
          Your Bag
        </p>

        <h2 className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)] max-w-sm">
          Your bag is empty
        </h2>

        <p className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-muted)] max-w-xs">
          Discover the current GENSIS collection.
        </p>

        <Link
          href="/shop"
          className="inline-flex items-center justify-center h-[var(--spacing-12)] px-[var(--spacing-10)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-semibold bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-gensis-charcoal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  const subtotal = cart.cost.subtotalAmount || cart.cost.totalAmount;

  return (
    <div className={`flex flex-col gap-[var(--spacing-12)] ${className}`}>
      {/* Line items list */}
      <div
        role="list"
        aria-label="Bag items"
        className="flex flex-col border-t border-[var(--color-border-subtle)]"
      >
        {cart.lines.map((line) => (
          <BagLineItem key={line.id} line={line} />
        ))}
      </div>

      {/* Order summary + checkout */}
      <div className="flex flex-col lg:flex-row lg:justify-end gap-[var(--spacing-8)]">
        <div className="w-full lg:max-w-sm flex flex-col gap-[var(--spacing-6)] border border-[var(--color-border-subtle)] p-[var(--spacing-6)]">
          {/* Heading */}
          <h2 className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)]">
            Order Summary
          </h2>

          {/* Subtotal row */}
          <div className="flex items-baseline justify-between border-b border-[var(--color-border-subtle)] pb-[var(--spacing-4)]">
            <span className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)]">
              Subtotal
            </span>
            <Price
              money={subtotal}
              className="text-[length:var(--text-title)] font-semibold"
            />
          </div>

          {/* Tax / shipping notice */}
          <p className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-caption)] text-[var(--color-fg-muted)]">
            Taxes and shipping calculated at checkout.
          </p>

          {/* Checkout CTA */}
          <CheckoutButton hasLines={cart.lines.length > 0} />

          {/* Continue shopping */}
          <Link
            href="/shop"
            className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] text-center transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none focus-visible:outline-none focus-visible:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
