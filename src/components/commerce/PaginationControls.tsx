import * as React from "react";
import Link from "next/link";
import type { PageInfo } from "@/lib/commerce/types";

export interface PaginationControlsProps {
  pageInfo: PageInfo;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
  className?: string;
}

export const PaginationControls = ({
  pageInfo,
  baseUrl,
  searchParams = {},
  className = "",
}: PaginationControlsProps) => {
  const { hasNextPage, hasPreviousPage, endCursor } = pageInfo;

  if (!hasNextPage && !hasPreviousPage) {
    return null;
  }

  const buildUrl = (cursor?: string) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined && key !== "after") {
        params.set(key, val);
      }
    });
    if (cursor) {
      params.set("after", cursor);
    }
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-between pt-[var(--spacing-8)] border-t border-[var(--color-border-subtle)] ${className}`}
    >
      <div>
        {hasPreviousPage ? (
          <Link
            href={buildUrl(undefined)}
            className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 transition-colors duration-[var(--duration-fast)]"
          >
            ← Previous
          </Link>
        ) : (
          <span className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] opacity-50 select-none cursor-not-allowed">
            ← Previous
          </span>
        )}
      </div>

      <div>
        {hasNextPage && endCursor ? (
          <Link
            href={buildUrl(endCursor)}
            className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 transition-colors duration-[var(--duration-fast)]"
          >
            Next →
          </Link>
        ) : (
          <span className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] opacity-50 select-none cursor-not-allowed">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
};
