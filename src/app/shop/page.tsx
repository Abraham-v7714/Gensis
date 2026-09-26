import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { PaginationControls } from "@/components/commerce/PaginationControls";
import { CommerceState } from "@/components/commerce/CommerceState";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { constructMetadata } from "@/lib/seo";

type ShopPageProps = {
  searchParams: Promise<{ after?: string }>;
};

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Shop",
  fallbackDescription: "Explore the GENSIS collection of architectural garments and enduring style.",
  canonical: "/shop",
});

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { after } = await searchParams;

  if (!isCommerceConfigured()) {
    return (
      <PageContainer>
        <Section className="py-[var(--spacing-8)]">
          <SectionHeading title="Shop" eyebrow="Architectural Garments & Tailored Silence" as="h1" />
          <CommerceState type="unavailable" />
        </Section>
      </PageContainer>
    );
  }

  const result = await commerce.getProducts({ first: 20, after });

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-8)]">
        <SectionHeading title="Shop" eyebrow="Architectural Garments & Tailored Silence" as="h1" />

        <div className="mt-[var(--spacing-8)]">
          {result.error ? (
            <CommerceState type="error" />
          ) : result.items.length === 0 ? (
            <CommerceState type="empty" message="No products are currently available in the catalog." />
          ) : (
            <div className="flex flex-col gap-[var(--spacing-8)]">
              <ProductGrid products={result.items} />
              <PaginationControls
                pageInfo={result.pageInfo}
                baseUrl="/shop"
                searchParams={{ after }}
              />
            </div>
          )}
        </div>
      </Section>
    </PageContainer>
  );
}
