import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";

/**
 * Global Not Found Boundary (App Router)
 *
 * Provider-neutral 404 boundary rendered when a route calls `notFound()`.
 */
export default function NotFound() {
  return (
    <PageContainer>
      <Section className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] mb-[var(--spacing-2)]">
          404 Error
        </span>
        <h1 className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] text-[var(--color-fg-primary)] mb-[var(--spacing-4)]">
          Page Not Found
        </h1>
        <p className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)] max-w-md mb-[var(--spacing-8)]">
          The requested page or editorial resource could not be found. It may have been moved or is currently unavailable.
        </p>
        <Link
          href="/"
          className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase px-[var(--spacing-6)] py-[var(--spacing-3)] bg-[var(--color-bg-inverse)] text-[var(--color-fg-inverse)] rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity"
        >
          Return to Home
        </Link>
      </Section>
    </PageContainer>
  );
}
