import * as React from "react";

export type EditorialTextProps = {
  eyebrow?: string;
  title: string;
  body?: React.ReactNode;
  align?: "left" | "center" | "right";
  titleAs?: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

export const EditorialText = ({
  eyebrow,
  title,
  body,
  align = "left",
  titleAs: TitleComponent = "h2",
  className = "",
}: EditorialTextProps) => {
  const alignClass = 
    align === "center" ? "text-center mx-auto" : 
    align === "right" ? "text-right ml-auto" : 
    "text-left";

  return (
    <div className={`flex flex-col gap-[var(--spacing-4)] ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
          {eyebrow}
        </span>
      )}
      <TitleComponent className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
        {title}
      </TitleComponent>
      {body && (
        <div className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)] max-w-2xl">
          {body}
        </div>
      )}
    </div>
  );
};
