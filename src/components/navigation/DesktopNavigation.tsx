import Link from "next/link";
import * as React from "react";
import { primaryNavigation } from "@/config/navigation";

export const DesktopNavigation = () => {
  return (
    <nav aria-label="Primary Desktop Navigation" className="hidden md:flex items-center gap-[var(--spacing-6)]">
      {primaryNavigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] focus-visible:outline-none focus-visible:underline"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
