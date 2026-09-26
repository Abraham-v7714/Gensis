import * as React from "react";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className = "", children, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`flex flex-col gap-[var(--spacing-4)] ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Stack.displayName = "Stack";
