"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface SearchFormProps {
  initialQuery?: string;
  className?: string;
}

export const SearchForm = ({
  initialQuery = "",
  className = "",
}: SearchFormProps) => {
  const [query, setQuery] = React.useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex items-center gap-[var(--spacing-3)] max-w-xl ${className}`}
    >
      <label htmlFor="search-input" className="sr-only">
        Search GENSIS catalog
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search garments, outerwear, tailoring..."
        className="flex-1 h-[var(--spacing-12)] px-[var(--spacing-4)] font-sans text-[length:var(--text-body)] bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] text-[var(--color-fg-primary)] placeholder-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
      />
      <button
        type="submit"
        className="h-[var(--spacing-12)] px-[var(--spacing-6)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-gensis-charcoal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 transition-colors duration-[var(--duration-fast)]"
      >
        Search
      </button>
    </form>
  );
};
