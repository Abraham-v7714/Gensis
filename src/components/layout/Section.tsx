import * as React from "react";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={`py-[var(--spacing-12)] md:py-[var(--spacing-16)] lg:py-[var(--spacing-24)] ${className}`}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";
