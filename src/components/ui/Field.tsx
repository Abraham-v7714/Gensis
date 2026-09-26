import * as React from "react";

export type FieldProps = {
  label: string;
  /**
   * Must match the `id` of the form control rendered as `children`.
   * This is required for a proper label→control association.
   */
  htmlFor?: string;
  description?: React.ReactNode;
  message?: React.ReactNode;
  messageType?: "error" | "success" | "info";
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export const Field = ({
  label,
  htmlFor,
  description,
  message,
  messageType = "info",
  required = false,
  children,
  className = "",
}: FieldProps) => {
  return (
    <div className={`flex flex-col gap-[var(--spacing-2)] ${className}`}>
      <label
        htmlFor={htmlFor}
        className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)]"
      >
        {label}
        {required && (
          <>
            {/* Visual asterisk, hidden from screen readers */}
            <span className="ml-[var(--spacing-1)]" aria-hidden="true">*</span>
            {/* Screen-reader announcement of required state */}
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      {description && (
        <div className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
          {description}
        </div>
      )}

      <div>{children}</div>

      {message && (
        <div
          role={messageType === "error" ? "alert" : undefined}
          className={`font-sans text-[length:var(--text-small)] ${
            messageType === "error"
              ? "font-semibold text-[var(--color-fg-primary)] border-l-2 border-[var(--color-fg-primary)] pl-[var(--spacing-2)]"
              : "text-[var(--color-fg-secondary)]"
          }`}
        >
          {messageType === "error" && <span className="sr-only">Error: </span>}
          {messageType === "success" && <span className="sr-only">Success: </span>}
          {message}
        </div>
      )}
    </div>
  );
};
