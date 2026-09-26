import * as React from "react";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  eyebrow?: string;
  description?: string;
  align?: "left" | "center" | "right";
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ title, eyebrow, description, align = "left", as: HeadingComponent = "h2", className = "", ...props }, ref) => {
    const alignmentClasses = {
      left: "text-left",
      center: "text-center mx-auto items-center",
      right: "text-right ml-auto items-end",
    };

    const alignClass = alignmentClasses[align];

    return (
      <div ref={ref} className={`flex flex-col gap-[var(--spacing-4)] ${alignClass} ${className}`} {...props}>
        {eyebrow && (
          <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            {eyebrow}
          </span>
        )}
        <HeadingComponent className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
          {title}
        </HeadingComponent>
        {description && (
          <p className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)] max-w-2xl">
            {description}
          </p>
        )}
      </div>
    );
  }
);

SectionHeading.displayName = "SectionHeading";
