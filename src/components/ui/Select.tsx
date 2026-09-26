import * as React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`flex w-full appearance-none bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] px-[var(--spacing-4)] py-[var(--spacing-3)] font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--color-fg-primary)] aria-[invalid=true]:border-2 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
