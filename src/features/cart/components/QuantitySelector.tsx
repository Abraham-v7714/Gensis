"use client";

import * as React from "react";

export interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onUpdate: (newQuantity: number) => void;
  ariaLabelPrefix?: string;
  className?: string;
}

export const QuantitySelector = ({
  quantity,
  min = 1,
  max = 99,
  disabled = false,
  onUpdate,
  ariaLabelPrefix = "Item",
  className = "",
}: QuantitySelectorProps) => {
  return (
    <div
      className={`inline-flex items-center border border-[var(--color-border-default)] h-[var(--spacing-10)] ${className}`}
      role="group"
      aria-label={`${ariaLabelPrefix} quantity selector`}
    >
      <button
        type="button"
        disabled={disabled || quantity <= min}
        onClick={() => onUpdate(quantity - 1)}
        aria-label={`Decrease ${ariaLabelPrefix} quantity`}
        className="w-[var(--spacing-8)] h-full flex items-center justify-center font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] transition-colors"
      >
        −
      </button>

      <span
        aria-live="polite"
        className="w-[var(--spacing-10)] text-center font-sans text-[length:var(--text-small)] font-medium text-[var(--color-fg-primary)] select-none"
      >
        {quantity}
      </span>

      <button
        type="button"
        disabled={disabled || quantity >= max}
        onClick={() => onUpdate(quantity + 1)}
        aria-label={`Increase ${ariaLabelPrefix} quantity`}
        className="w-[var(--spacing-8)] h-full flex items-center justify-center font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] transition-colors"
      >
        +
      </button>
    </div>
  );
};
