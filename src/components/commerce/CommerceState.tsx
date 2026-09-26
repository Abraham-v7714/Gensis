import * as React from "react";

export interface CommerceStateProps {
  type: "unavailable" | "error" | "empty";
  title?: string;
  message?: string;
  className?: string;
}

export const CommerceState = ({
  type,
  title,
  message,
  className = "",
}: CommerceStateProps) => {
  const defaults = {
    unavailable: {
      title: "Commerce Unavailable",
      message: "Storefront credentials are not currently configured.",
    },
    error: {
      title: "Service Error",
      message: "An unexpected error occurred while loading commerce data.",
    },
    empty: {
      title: "No Results Found",
      message: "No products matched your search or collection criteria.",
    },
  }[type];

  const headingText = title || defaults.title;
  const bodyText = message || defaults.message;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`py-[var(--spacing-12)] text-center ${className}`}
    >
      <h2 className="font-serif text-[length:var(--text-title)] leading-[var(--leading-title)] text-[var(--color-fg-primary)] mb-[var(--spacing-2)]">
        {headingText}
      </h2>
      <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)] max-w-md mx-auto">
        {bodyText}
      </p>
    </div>
  );
};
