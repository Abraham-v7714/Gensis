import * as React from "react";

// Button variants consume semantic design tokens defined in globals.css.
// Arbitrary color values are intentionally avoided here.

const buttonVariants = {
  primary:
    "bg-[var(--color-bg-inverse)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-fg-secondary)] transition-colors",
  secondary:
    "bg-[var(--color-bg-primary)] text-[var(--color-fg-primary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-secondary)] transition-colors",
  ghost:
    "bg-transparent text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors",
};

const buttonSizes = {
  sm: "h-9 px-4 text-[length:var(--text-small)]",
  md: "h-11 px-6 text-[length:var(--text-body)]",
  lg: "h-14 px-8 text-[length:var(--text-title)]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading = false, disabled,
     // Default type to "button" to prevent accidental form submission.
     // Callers can override with type="submit" or type="reset" as needed.
     type = "button",
     children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans tracking-[var(--tracking-label)] uppercase " +
      "duration-[var(--duration-normal)] focus-visible:outline-none focus-visible:ring-2 " +
      "focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 " +
      "disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span className="sr-only">Loading…</span>
          </>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
