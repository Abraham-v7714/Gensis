import * as React from "react";

export type PullQuoteProps = {
  quote: string;
  attribution?: string;
  align?: "left" | "center" | "right";
  className?: string;
};

export const PullQuote = ({
  quote,
  attribution,
  align = "center",
  className = "",
}: PullQuoteProps) => {
  const alignClass = 
    align === "left" ? "text-left" :
    align === "right" ? "text-right" :
    "text-center mx-auto";

  return (
    <figure className={`flex flex-col gap-[var(--spacing-6)] my-[var(--spacing-12)] md:my-[var(--spacing-16)] max-w-4xl ${alignClass} ${className}`}>
      <blockquote className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-[var(--color-fg-primary)]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {attribution && (
        <figcaption className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)] text-[var(--color-fg-secondary)] uppercase">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
};
