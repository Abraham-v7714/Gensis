import * as React from "react";

export type FormMessageProps = {
  children: React.ReactNode;
  type?: "error" | "success" | "info";
  id?: string;
  className?: string;
};

export const FormMessage = ({
  children,
  type = "info",
  id,
  className = "",
}: FormMessageProps) => {
  const typeStyles =
    type === "error"
      ? "font-semibold text-[var(--color-fg-primary)] border-l-2 border-[var(--color-fg-primary)] pl-[var(--spacing-2)]"
      : "text-[var(--color-fg-secondary)]";

  return (
    <div
      id={id}
      // role="alert" causes the message to be announced immediately by screen readers
      // when it appears dynamically. Only appropriate for error messages.
      role={type === "error" ? "alert" : undefined}
      className={`font-sans text-[length:var(--text-small)] ${typeStyles} ${className}`}
    >
      {type === "error" && <span className="sr-only">Error: </span>}
      {type === "success" && <span className="sr-only">Success: </span>}
      {children}
    </div>
  );
};
