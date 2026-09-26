"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductVariant } from "@/types/product";
import { addToBagAction } from "../actions";

export interface AddToBagButtonProps {
  variant?: ProductVariant;
  className?: string;
}

/**
 * AddToBagButton — Stage 4.15 polish
 *
 * Changes:
 * - Success state shows a "View Bag →" link alongside the confirmation message
 *   so users can continue to the Bag without being forced into it.
 * - aria-busy correctly reflects the pending transition state.
 * - Error message uses role="alert" for immediate screen-reader announcement.
 * - Feedback auto-clears when the variant changes (new selection resets state).
 */
export const AddToBagButton = ({ variant, className = "" }: AddToBagButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isSoldOut = variant?.availability === "sold-out";
  const isUnavailable = variant?.availability === "unavailable" || !variant;
  const isDisabled = isPending || isSoldOut || isUnavailable;

  // Clear feedback when variant changes
  const prevVariantId = React.useRef(variant?.id);
  if (prevVariantId.current !== variant?.id) {
    prevVariantId.current = variant?.id;
    if (feedback) setFeedback(null);
  }

  const buttonText = isPending
    ? "Adding…"
    : isSoldOut
    ? "Sold Out"
    : isUnavailable
    ? "Unavailable"
    : "Add to Bag";

  const handleAddToBag = () => {
    if (!variant || isDisabled) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await addToBagAction({ variantId: variant.id, quantity: 1 });
      if (res.ok) {
        setFeedback({ type: "success", message: "Added to Bag" });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.error.message || "Failed to add item to Bag.",
        });
      }
    });
  };

  return (
    <div className={`flex flex-col gap-[var(--spacing-2)] ${className}`}>
      <button
        type="button"
        disabled={isDisabled}
        aria-busy={isPending ? "true" : undefined}
        aria-label={buttonText}
        onClick={handleAddToBag}
        className={[
          "w-full h-[var(--spacing-12)] px-[var(--spacing-6)]",
          "font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-semibold",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2",
          isDisabled && (isSoldOut || isUnavailable)
            ? "bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)] border border-[var(--color-border-subtle)] cursor-not-allowed"
            : isPending
            ? "bg-[var(--color-gensis-charcoal)] text-[var(--color-fg-inverse)] cursor-wait"
            : "bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-gensis-charcoal)] active:scale-[0.99]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {buttonText}
      </button>

      {/* Accessible feedback region — always present in DOM, content changes */}
      <div aria-live="polite" className="min-h-[var(--spacing-6)]">
        {feedback?.type === "success" && (
          <div className="flex items-center gap-[var(--spacing-4)]">
            <p className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-primary)] font-medium">
              {feedback.message}
            </p>
            <Link
              href="/bag"
              className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)] underline hover:text-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
            >
              View Bag →
            </Link>
          </div>
        )}
        {feedback?.type === "error" && (
          <p
            role="alert"
            className="font-sans text-[length:var(--text-caption)] text-red-700"
          >
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  );
};
