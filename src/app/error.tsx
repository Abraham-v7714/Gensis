"use client";

import * as React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";

/**
 * Global Route Error Boundary (App Router)
 *
 * Catches unhandled runtime errors in page trees and offers a reset option.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log exception for diagnostic reporting
    console.error("Unhandled Route Error:", error);
  }, [error]);

  return (
    <PageContainer>
      <Section className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] mb-[var(--spacing-2)]">
          Application Error
        </span>
        <h1 className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] text-[var(--color-fg-primary)] mb-[var(--spacing-4)]">
          Something went wrong
        </h1>
        <p className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)] max-w-md mb-[var(--spacing-8)]">
          An unexpected error occurred while loading this page. You may try again or return to the main navigation.
        </p>
        <button
          onClick={() => reset()}
          className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase px-[var(--spacing-6)] py-[var(--spacing-3)] bg-[var(--color-bg-inverse)] text-[var(--color-fg-inverse)] rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </Section>
    </PageContainer>
  );
}
