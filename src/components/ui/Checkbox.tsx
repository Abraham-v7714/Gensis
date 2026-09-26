import * as React from "react";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 shrink-0 accent-[var(--color-gensis-black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-[var(--color-fg-primary)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)] ${className}`}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
