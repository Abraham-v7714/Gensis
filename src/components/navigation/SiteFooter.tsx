import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footerNavGroups } from "@/config/footer";

/**
 * SiteFooter — Stage 4.14
 *
 * Brand-aligned editorial footer with structured navigation groups,
 * brand signature, and copyright.
 *
 * Architecture:
 * - Server Component (no "use client" needed)
 * - Reads from footer config, not from CMS or commerce
 * - Semantic HTML landmarks: <footer>, <nav>, accessible headings
 * - Responsive: stacked on mobile, 4-column grid on desktop
 * - Uses GENSIS design tokens exclusively
 */
export const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]"
    >
      {/* Main Footer Content */}
      <div className="w-full max-w-[var(--layout-wide-width)] mx-auto px-[var(--layout-gutter-mobile)] md:px-[var(--layout-gutter-tablet)] lg:px-[var(--layout-gutter-desktop)] py-[var(--spacing-16)] md:py-[var(--spacing-20)] lg:py-[var(--spacing-24)]">
        {/* Top Section: Brand + Nav Groups */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-[var(--spacing-10)] md:gap-[var(--spacing-8)]">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-[var(--spacing-4)] mb-[var(--spacing-4)] md:mb-0">
            <Link
              href="/"
              className="font-serif text-[length:var(--text-title)] tracking-[var(--tracking-title)] text-[var(--color-fg-primary)] uppercase self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
              aria-label="GENSIS Home"
            >
              {siteConfig.name}
            </Link>
            <p className="font-sans text-[length:var(--text-small)] leading-[var(--leading-small)] text-[var(--color-fg-muted)] max-w-[16rem]">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Navigation Groups */}
          {footerNavGroups.map((group) => (
            <nav
              key={group.heading}
              aria-label={`${group.heading} footer navigation`}
              className="flex flex-col gap-[var(--spacing-4)]"
            >
              <h2 className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)]">
                {group.heading}
              </h2>
              <ul className="flex flex-col gap-[var(--spacing-3)]" role="list">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-sans text-[length:var(--text-small)] leading-[var(--leading-small)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] focus-visible:outline-none focus-visible:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar: Copyright + Brand Mark */}
        <div className="mt-[var(--spacing-16)] pt-[var(--spacing-8)] border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-[var(--spacing-4)]">
          <p className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-caption)] text-[var(--color-fg-muted)]">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            A New Generation of Fashion
          </p>
        </div>
      </div>
    </footer>
  );
};
