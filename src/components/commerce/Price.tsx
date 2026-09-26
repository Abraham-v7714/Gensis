import * as React from "react";
import type { Money } from "@/types/common";

export interface PriceProps {
  money: Money;
  className?: string;
}

export const Price = ({ money, className = "" }: PriceProps) => {
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: Number.isInteger(money.amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(money.amount);

  return (
    <span
      className={`font-sans text-[length:var(--text-small)] leading-[var(--leading-small)] tracking-[var(--tracking-small)] text-[var(--color-fg-secondary)] ${className}`}
    >
      {formatted}
    </span>
  );
};
