"use client";

import * as React from "react";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
};

export const Drawer = ({ open, onClose, title, side = "right", children, className = "" }: DrawerProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);
  // Stable unique ID per Drawer instance — prevents collision when multiple drawers exist
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

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  const sideClass = side === "right" ? "ml-auto mr-0" : "mr-auto ml-0";

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-y-0 ${sideClass} h-full w-full max-w-md max-h-none bg-transparent p-0 border-none m-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm ${className}`}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
    >
      <div className="flex flex-col h-full w-full bg-[var(--color-bg-primary)] border-x border-[var(--color-border-subtle)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-[var(--spacing-6)] border-b border-[var(--color-border-subtle)] shrink-0">
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
        <div className="flex-1 p-[var(--spacing-6)]">
          {children}
        </div>
      </div>
    </dialog>
  );
};
