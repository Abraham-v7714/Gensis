import * as React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { utilityNavigation } from "@/config/navigation";

export const SiteHeader = () => {
  const bagItem = utilityNavigation.find((item) => item.label === "Bag");

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] bg-[var(--color-bg-primary)] border-b border-[var(--color-border-subtle)]">
      <div className="flex items-center justify-between h-[var(--spacing-16)] px-[var(--layout-gutter-mobile)] md:px-[var(--layout-gutter-tablet)] lg:px-[var(--layout-gutter-desktop)] mx-auto max-w-[var(--layout-wide-width)]">
        
        {/* Mobile Left: Menu Trigger */}
        <div className="flex-1 md:hidden">
          <MobileNavigation />
        </div>

        {/* Desktop Left: Logo */}
        <div className="hidden md:flex flex-1">
          <Logo />
        </div>

        {/* Center: Logo (Mobile) & Desktop Primary Nav */}
        <div className="flex justify-center flex-none">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden md:block">
            <DesktopNavigation />
          </div>
        </div>

        {/* Right: Utility Nav */}
        <div className="flex flex-1 justify-end items-center gap-[var(--spacing-4)] md:gap-[var(--spacing-6)]">
          {/* Desktop Utility Nav */}
          <nav aria-label="Utility Desktop Navigation" className="hidden md:flex items-center gap-[var(--spacing-6)]">
            {utilityNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] focus-visible:outline-none focus-visible:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Utility Nav (Bag only) */}
          <div className="md:hidden">
            {bagItem && (
              <Link
                href={bagItem.href}
                className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)] text-[var(--color-fg-primary)] p-[var(--spacing-2)] -mr-[var(--spacing-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
              >
                {bagItem.label}
              </Link>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
