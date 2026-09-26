import * as React from "react";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className = "", children, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`grid grid-cols-1 gap-[var(--spacing-6)] md:gap-[var(--spacing-8)] ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Grid.displayName = "Grid";
