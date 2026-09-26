import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`flex w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] px-[var(--spacing-4)] py-[var(--spacing-3)] font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--color-fg-primary)] aria-[invalid=true]:border-2 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] min-h-[80px] resize-y ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
