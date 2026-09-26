import * as React from "react";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className = "", children, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`w-full max-w-[var(--layout-content-width)] mx-auto px-[var(--layout-gutter-mobile)] md:px-[var(--layout-gutter-tablet)] lg:px-[var(--layout-gutter-desktop)] ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

PageContainer.displayName = "PageContainer";
