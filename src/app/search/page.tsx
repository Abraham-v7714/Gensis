import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { PaginationControls } from "@/components/commerce/PaginationControls";
import { CommerceState } from "@/components/commerce/CommerceState";
import { SearchForm } from "@/components/search/SearchForm";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { constructMetadata } from "@/lib/seo";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; after?: string }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search: "${q}"` : "Search Catalog";
  return constructMetadata({
    fallbackTitle: title,
    fallbackDescription: "Search GENSIS collections and architectural garments catalog.",
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, after } = await searchParams;
  const rawQuery = (q || "").trim();
  const trimmedQuery = rawQuery.slice(0, 100);

  if (!isCommerceConfigured()) {
    return (
      <PageContainer>
        <Section className="py-[var(--spacing-8)]">
          <SectionHeading title="Search" eyebrow="Catalog Search" as="h1" />
          <div className="mt-[var(--spacing-6)]">
            <SearchForm initialQuery={trimmedQuery} />
          </div>
          <CommerceState
            type="unavailable"
            message="Search is currently unavailable because storefront credentials are not configured."
          />
        </Section>
      </PageContainer>
    );
  }

  const result = trimmedQuery
    ? await commerce.searchProducts(trimmedQuery, { first: 20, after })
    : null;

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-8)]">
        <SectionHeading title="Search" eyebrow="Catalog Search" as="h1" />

        <div className="mt-[var(--spacing-6)]">
          <SearchForm initialQuery={trimmedQuery} />
        </div>

        <div className="mt-[var(--spacing-8)]">
          {!trimmedQuery ? (
            <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)] py-[var(--spacing-8)]">
              Enter a search query above to explore garments, outerwear, and accessories.
            </p>
          ) : result?.error ? (
            <CommerceState type="error" />
          ) : result?.items.length === 0 ? (
            <CommerceState
              type="empty"
              message={`No products were found matching "${trimmedQuery}".`}
            />
          ) : result ? (
            <div className="flex flex-col gap-[var(--spacing-8)]">
              <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
                Showing results for <strong className="text-[var(--color-fg-primary)]">&quot;{trimmedQuery}&quot;</strong>
              </p>
              <ProductGrid products={result.items} />
              <PaginationControls
                pageInfo={result.pageInfo}
                baseUrl="/search"
                searchParams={{ q: trimmedQuery, after }}
              />
            </div>
          ) : null}
        </div>
      </Section>
    </PageContainer>
  );
}
