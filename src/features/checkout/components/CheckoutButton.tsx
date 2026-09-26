"use client";

/**
 * CheckoutButton — Stage 4.10
 *
 * Client component that initiates the checkout handoff.
 *
 * On click:
 *   1. Calls checkoutAction() (Server Action) — fetches fresh cart, validates URL server-side.
 *   2. On success: navigates to Shopify-hosted checkout via window.location.assign().
 *   3. On failure: surfaces a user-visible error via aria-live region.
 *
 * Security:
 *   - The client never supplies or constructs the checkout URL.
 *   - window.location.assign() only receives a URL validated by the server.
 *   - Duplicate activation prevented by isPending (useTransition).
 *
 * Accessibility:
 *   - Semantic <button> element.
 *   - aria-busy="true" during pending state.
 *   - aria-live="polite" region announces errors to screen readers.
 *   - Visible focus ring using existing design tokens.
 *   - Reduced-motion: transition-none via motion-reduce: variant.
 */

import * as React from "react";
import { checkoutAction } from "../actions";

export interface CheckoutButtonProps {
  /** Whether the current Bag contains at least one line item. */
  hasLines: boolean;
  className?: string;
}

export const CheckoutButton = ({ hasLines, className = "" }: CheckoutButtonProps) => {
  const [isPending, startTransition] = React.useTransition();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const isDisabled = !hasLines || isPending;

  const buttonLabel = isPending
    ? "Preparing Checkout\u2026"
    : !hasLines
    ? "Bag is Empty"
    : "Proceed to Checkout \u2192";

  const handleCheckout = () => {
    if (isDisabled) return;
    setErrorMsg(null);

    startTransition(async () => {
      const result = await checkoutAction();

      if (result.ok) {
        // Navigate to Shopify-hosted checkout.
        // window.location.assign is used (not router.push) because checkout is an external domain.
        window.location.assign(result.data);
        return;
      }

      // Map provider error codes to user-facing copy.
      const msg =
        result.error.code === "NOT_FOUND"
          ? "Your Bag session has expired. Please add items and try again."
          : result.error.code === "VALIDATION_ERROR"
          ? "Your Bag is empty."
          : "Unable to proceed to checkout. Please try again.";

      setErrorMsg(msg);
    });
  };

  return (
    <div className={`flex flex-col gap-[var(--spacing-2)] ${className}`}>
      <button
        type="button"
        disabled={isDisabled}
        aria-busy={isPending ? "true" : undefined}
        onClick={handleCheckout}
        className={[
          "w-full h-[var(--spacing-12)] px-[var(--spacing-6)]",
          "flex items-center justify-center",
          "font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-semibold",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2",
          isDisabled
            ? "bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)] cursor-not-allowed border border-[var(--color-border-subtle)]"
            : "bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-gensis-charcoal)] active:scale-[0.99]",
        ].join(" ")}
      >
        {buttonLabel}
      </button>

      {/* Accessible error announcement region — always rendered, content changes */}
      <div aria-live="polite" className="min-h-[var(--spacing-4)]">
        {errorMsg && (
          <p
            role="alert"
            className="font-sans text-[length:var(--text-caption)] text-red-700"
          >
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};
