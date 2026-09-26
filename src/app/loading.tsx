import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";

/**
 * Global Route Loading Boundary (App Router)
 *
 * Minimal, restrained loading boundary aligned with GENSIS design language.
 */
export default function Loading() {
  return (
    <PageContainer>
      <Section className="flex flex-col items-center justify-center text-center min-h-[50vh]">
        <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] animate-pulse">
          Loading...
        </p>
      </Section>
    </PageContainer>
  );
}
