import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Grid } from "@/components/layout/Grid";
import { GensisImage } from "@/components/shared/GensisImage";
import { PaginationControls } from "@/components/commerce/PaginationControls";
import { CommerceState } from "@/components/commerce/CommerceState";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { constructMetadata } from "@/lib/seo";

type CollectionsPageProps = {
  searchParams: Promise<{ after?: string }>;
};

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Collections",
  fallbackDescription: "Curated seasonal releases and capsule collections by GENSIS.",
  canonical: "/collections",
});

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { after } = await searchParams;

  if (!isCommerceConfigured()) {
    return (
      <PageContainer>
        <Section>
          <SectionHeading title="Collections" eyebrow="Seasonal Releases & Capsule Series" as="h1" />
          <CommerceState type="unavailable" />
        </Section>
      </PageContainer>
    );
  }

  const result = await commerce.getCollections({ first: 12, after });

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-8)]">
        <SectionHeading
          title="Collections"
          eyebrow="Seasonal Releases & Capsule Series"
          as="h1"
        />

        <div className="mt-[var(--spacing-8)]">
          {result.error ? (
            <CommerceState type="error" />
          ) : result.items.length === 0 ? (
            <CommerceState type="empty" message="No collections are currently published." />
          ) : (
            <div className="flex flex-col gap-[var(--spacing-8)]">
              <Grid className="md:grid-cols-2 lg:grid-cols-3">
                {result.items.map((collection) => (
                  <article key={collection.id} className="group flex flex-col">
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
                    >
                      <figure className="overflow-hidden mb-[var(--spacing-4)] aspect-[16/9] bg-[var(--color-bg-secondary)]">
                        {collection.image ? (
                          <GensisImage
                            src={collection.image}
                            alt={collection.title}
                            aspectRatio="16/9"
                            className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-[1.03] motion-reduce:transition-none"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-fg-muted)]">
                            <span className="font-sans text-[length:var(--text-small)] uppercase tracking-[var(--tracking-label)]">
                              GENSIS
                            </span>
                          </div>
                        )}
                      </figure>
                      <h2 className="font-serif text-[length:var(--text-title)] text-[var(--color-fg-primary)] group-hover:text-[var(--color-fg-muted)] transition-colors">
                        {collection.title}
                      </h2>
                      {collection.description && (
                        <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)] line-clamp-2 mt-[var(--spacing-1)]">
                          {collection.description}
                        </p>
                      )}
                    </Link>
                  </article>
                ))}
              </Grid>

              <PaginationControls
                pageInfo={result.pageInfo}
                baseUrl="/collections"
                searchParams={{ after }}
              />
            </div>
          )}
        </div>
      </Section>
    </PageContainer>
  );
}
