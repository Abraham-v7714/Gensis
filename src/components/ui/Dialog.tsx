"use client";

import * as React from "react";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export const Dialog = ({ open, onClose, title, children, className = "" }: DialogProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);
  // Stable unique IDs — safe across concurrent renders, no Math.random()
  const titleId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
      previouslyFocusedElementRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle Escape key via the native cancel event
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  // Handle clicking on the backdrop (the <dialog> element itself)
  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={`bg-[var(--color-bg-primary)] p-[var(--spacing-6)] md:p-[var(--spacing-8)] border border-[var(--color-border-subtle)] m-auto max-w-lg w-full max-h-[90vh] overflow-y-auto backdrop:bg-black/40 backdrop:backdrop-blur-sm ${className}`}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
    >
      <div className="flex flex-col gap-[var(--spacing-6)]">
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-sans text-[length:var(--text-title)] leading-[var(--leading-title)] tracking-[var(--tracking-title)] text-[var(--color-fg-primary)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] p-[var(--spacing-2)] -mr-[var(--spacing-2)]"
          >
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </dialog>
  );
};
