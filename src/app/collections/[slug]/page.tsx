import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { PaginationControls } from "@/components/commerce/PaginationControls";
import { CommerceState } from "@/components/commerce/CommerceState";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { constructMetadata } from "@/lib/seo";

type CollectionRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ after?: string; first?: string }>;
};

export async function generateMetadata({
  params,
}: CollectionRouteProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isCommerceConfigured()) {
    return constructMetadata({
      fallbackTitle: `Collection — ${slug}`,
      fallbackDescription: "Curated seasonal collection by GENSIS.",
    });
  }

  const collection = await commerce.getCollectionBySlug(slug);
  if (!collection) {
    return constructMetadata({
      fallbackTitle: "Collection Not Found",
      fallbackDescription: "The requested GENSIS collection could not be found.",
    });
  }

  return constructMetadata({
    fallbackTitle: collection.title,
    fallbackDescription: collection.description || "Curated seasonal collection by GENSIS.",
    canonical: `/collections/${slug}`,
  });
}

export default async function CollectionDetailRoute({
  params,
  searchParams,
}: CollectionRouteProps) {
  const { slug } = await params;
  const { after } = await searchParams;

  if (!isCommerceConfigured()) {
    return (
      <PageContainer>
        <Section>
          <CommerceState type="unavailable" />
        </Section>
      </PageContainer>
    );
  }

  const collection = await commerce.getCollectionBySlug(slug);
  if (!collection) {
    notFound();
  }

  const result = await commerce.getProducts({
    collectionSlug: slug,
    first: 20,
    after,
  });

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-8)]">
        <SectionHeading
          title={collection.title}
          eyebrow="Collection"
          as="h1"
          description={collection.description}
        />

        <div className="mt-[var(--spacing-8)]">
          {result.error ? (
            <CommerceState type="error" />
          ) : result.items.length === 0 ? (
            <CommerceState
              type="empty"
              message="No products currently available in this collection."
            />
          ) : (
            <div className="flex flex-col gap-[var(--spacing-8)]">
              <ProductGrid products={result.items} />
              <PaginationControls
                pageInfo={result.pageInfo}
                baseUrl={`/collections/${slug}`}
                searchParams={{ after }}
              />
            </div>
          )}
        </div>
      </Section>
    </PageContainer>
  );
}
