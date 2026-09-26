import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Journal",
  fallbackDescription: "GENSIS Journal: Essays on material study, spatial silhouettes, and design philosophy.",
});

export default function JournalPage() {
  return (
    <PageContainer>
      <Section>
        <SectionHeading title="Journal" eyebrow="Material Studies, Design Philosophy & Atelier Essays" as="h1" />
        <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)] mt-[var(--spacing-4)]">
          Journal listing boundary. Articles will be listed here when CMS provider is wired.
        </p>
      </Section>
    </PageContainer>
  );
}
