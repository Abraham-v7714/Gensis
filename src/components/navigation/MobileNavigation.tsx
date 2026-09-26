"use client";

import * as React from "react";
import Link from "next/link";
import { primaryNavigation, utilityNavigation } from "@/config/navigation";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Focus the first focusable element in the menu when it opens.
  React.useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector<HTMLElement>(
        "a, button, [tabindex]:not([tabindex='-1'])"
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Return focus to the trigger when the menu closes.
  const previousIsOpen = React.useRef(false);
  React.useEffect(() => {
    if (previousIsOpen.current && !isOpen) {
      triggerRef.current?.focus();
    }
    previousIsOpen.current = isOpen;
  }, [isOpen]);

  // Escape key closes the menu.
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Scroll lock and background content isolation while menu is open.
  React.useEffect(() => {
    const mainContent =
      document.getElementById("main-content") || document.querySelector("main");

    if (isOpen) {
      document.body.style.overflow = "hidden";
      mainContent?.setAttribute("inert", "");
    } else {
      document.body.style.overflow = "";
      mainContent?.removeAttribute("inert");
    }

    return () => {
      document.body.style.overflow = "";
      mainContent?.removeAttribute("inert");
    };
  }, [isOpen]);

  /**
   * Focus trap for keyboard users.
   *
   * When the menu is open, Tab and Shift+Tab cycle only within the menu.
   * This prevents focus from escaping to background content, which would
   * be confusing since the overlay visually obscures the page.
   */
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !menuRef.current) return;

    const focusableSelectors =
      "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusable = Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => !el.closest("[hidden]"));

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)] text-[var(--color-fg-primary)] p-[var(--spacing-2)] -ml-[var(--spacing-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? "Close" : "Menu"}
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="fixed inset-0 top-[var(--spacing-16)] bg-[var(--color-bg-primary)] z-[var(--z-modal)] flex flex-col p-[var(--layout-gutter-mobile)] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          onKeyDown={handleMenuKeyDown}
        >
          <nav aria-label="Primary Mobile Navigation" className="flex flex-col gap-[var(--spacing-6)] mt-[var(--spacing-4)]">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Utility Mobile Navigation" className="flex flex-col gap-[var(--spacing-4)] mt-auto pt-[var(--spacing-8)] pb-[var(--spacing-8)] border-t border-[var(--color-border-subtle)]">
            {utilityNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-secondary)] focus-visible:outline-none focus-visible:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
