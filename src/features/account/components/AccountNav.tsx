"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../actions";

export const AccountNav = () => {
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  const navItems = [
    { href: "/account", label: "Overview" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/addresses", label: "Addresses" },
  ];

  const handleSignOut = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (result.ok) {
        window.location.assign(result.data);
      }
    });
  };

  return (
    <nav
      aria-label="Account navigation"
      className="flex flex-wrap items-center justify-between gap-[var(--spacing-4)] border-b border-[var(--color-border-subtle)] pb-[var(--spacing-4)] mb-[var(--spacing-8)]"
    >
      <div className="flex items-center gap-[var(--spacing-6)] sm:gap-[var(--spacing-8)]">
        {navItems.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-medium transition-colors pb-[var(--spacing-1)] ${
                isActive
                  ? "text-[var(--color-fg-primary)] border-b-2 border-[var(--color-fg-primary)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={handleSignOut}
        className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] disabled:opacity-50"
      >
        {isPending ? "Signing Out\u2026" : "Sign Out"}
      </button>
    </nav>
  );
};
