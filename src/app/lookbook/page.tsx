import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Lookbook",
  fallbackDescription: "GENSIS Lookbooks: Visual narratives and curated editorial imagery.",
});

export default function LookbookListingPage() {
  return (
    <PageContainer>
      <Section>
        <SectionHeading title="Lookbook" eyebrow="Visual Imagery & Curated Editorial Narratives" as="h1" />
        <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)] mt-[var(--spacing-4)]">
          Lookbook listing boundary. Lookbooks will be listed here when CMS provider is wired.
        </p>
      </Section>
    </PageContainer>
  );
}
