import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/seo";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { getPreviewCms } from "@/lib/cms";
import { Section } from "@/components/layout/Section";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { GensisImage } from "@/components/shared/GensisImage";
import { JsonLd } from "@/components/shared/JsonLd";
import { getOrganizationJsonLd, getWebSiteJsonLd } from "@/lib/seo/jsonLd";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "GENSIS — A New Generation of Fashion",
  fallbackDescription:
    "Discover the GENSIS collection. Architectural garments, seasonal editorials, and enduring style.",
  canonical: "/",
});

/**
 * Homepage — Stage 4.14 / 4.15
 *
 * Editorial composition:
 *   1. Hero
 *   2. Brand Statement
 *   3. Featured Products
 *   4. Lookbook / Editorial Feature
 *   5. Journal Preview
 *   6. Closing Brand Statement
 *
 * Architecture:
 * - Server Component — no client JS unless delegated to child components.
 * - Commerce data via: commerce.getProducts / commerce.getCollections
 * - CMS data via: getPreviewCms() (draft-mode aware)
 * - Graceful empty states for all dynamic sections.
 * - No invented data, no fake products, no fake articles.
 */
export default async function Home() {
  // ----------------------------------------------------------------
  // Data fetching — parallel, server-side, provider-neutral
  // ----------------------------------------------------------------
  const cmsClient = await getPreviewCms();

  const [featuredProductsResult, journalArticles, lookbooks] =
    await Promise.all([
      isCommerceConfigured()
        ? commerce.getProducts({ first: 4 })
        : Promise.resolve({ items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, error: false }),
      cmsClient.getJournalArticles({ limit: 3 }),
      cmsClient.getLookbooks({ limit: 1 }),
    ]);

  const featuredProducts = featuredProductsResult.items;
  const featuredLookbook = lookbooks[0] ?? null;

  return (
    <div className="flex flex-col">
      <JsonLd data={[getOrganizationJsonLd(), getWebSiteJsonLd()]} />

      {/* ================================================================
          1. HERO
          Full-viewport editorial hero. Typography + brand identity first.
          ================================================================ */}
      <section
        aria-label="GENSIS hero"
        className="relative min-h-[90svh] flex flex-col items-center justify-center text-center bg-[var(--color-bg-primary)] px-[var(--layout-gutter-mobile)] md:px-[var(--layout-gutter-tablet)] lg:px-[var(--layout-gutter-desktop)]"
      >
        {/* Eyebrow label */}
        <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] mb-[var(--spacing-6)]">
          A New Generation of Fashion
        </p>

        {/* Brand wordmark as editorial heading */}
        <h1 className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-[var(--color-fg-primary)]">
          {siteConfig.name}
        </h1>

        {/* Minimal descriptor */}
        <p className="mt-[var(--spacing-8)] font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-muted)] max-w-sm mx-auto">
          Architectural garments. Enduring design. A contemporary identity.
        </p>

        {/* Primary CTA */}
        <div className="mt-[var(--spacing-10)] flex flex-col sm:flex-row items-center gap-[var(--spacing-4)]">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-[var(--spacing-12)] px-[var(--spacing-10)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-semibold bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-gensis-charcoal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none"
          >
            Explore Shop
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center h-[var(--spacing-12)] px-[var(--spacing-10)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-semibold border border-[var(--color-gensis-black)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2 transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none"
          >
            Collections
          </Link>
        </div>

        {/* Scroll indicator — decorative, hidden from screen readers */}
        <div
          aria-hidden="true"
          className="absolute bottom-[var(--spacing-8)] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[var(--spacing-2)]"
        >
          <div className="w-px h-[var(--spacing-8)] bg-[var(--color-gensis-stone)]" />
        </div>
      </section>

      {/* ================================================================
          2. BRAND STATEMENT
          Editorial typographic statement — no marketing copy.
          ================================================================ */}
      <Section className="border-t border-[var(--color-border-subtle)] py-[var(--spacing-24)] lg:py-[var(--spacing-32)]">
        <div className="max-w-[var(--layout-narrow-width)] mx-auto text-center flex flex-col gap-[var(--spacing-6)]">
          <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            The Concept
          </p>
          <h2 className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
            Fashion is a form of creation.
          </h2>
          <p className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)]">
            GENSIS explores the intersection of origin and innovation — garments that carry intention and endure beyond trends.
          </p>
        </div>
      </Section>

      {/* ================================================================
          3. FEATURED PRODUCTS
          Live commerce data. Graceful empty state if unavailable.
          ================================================================ */}
      {featuredProducts.length > 0 && (
        <Section className="border-t border-[var(--color-border-subtle)] py-[var(--spacing-16)] lg:py-[var(--spacing-20)]">
          <div className="flex flex-col gap-[var(--spacing-10)]">
            {/* Section header */}
            <div className="flex items-end justify-between gap-[var(--spacing-6)]">
              <div className="flex flex-col gap-[var(--spacing-2)]">
                <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                  Current Collection
                </p>
                <h2 className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
                  Selected Garments
                </h2>
              </div>
              <Link
                href="/shop"
                aria-label="View all garments in the shop"
                className="hidden sm:inline-flex font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none focus-visible:outline-none focus-visible:underline shrink-0"
              >
                View All →
              </Link>
            </div>

            <ProductGrid products={featuredProducts} />

            {/* Mobile CTA */}
            <div className="sm:hidden text-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center h-[var(--spacing-12)] px-[var(--spacing-8)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase border border-[var(--color-gensis-black)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none"
              >
                View All
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* ================================================================
          4. LOOKBOOK / EDITORIAL FEATURE
          CMS Lookbook — graceful empty state if no published content.
          ================================================================ */}
      {featuredLookbook ? (
        <Section className="border-t border-[var(--color-border-subtle)] py-[var(--spacing-16)] lg:py-[var(--spacing-20)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-10)] lg:gap-[var(--spacing-16)] items-center">
            {/* Image */}
            <div className="overflow-hidden">
              <GensisImage
                src={featuredLookbook.coverMedia.url}
                alt={featuredLookbook.coverMedia.alt || featuredLookbook.title}
                aspectRatio="4/5"
                className="w-full"
              />
            </div>

            {/* Editorial content */}
            <div className="flex flex-col gap-[var(--spacing-6)]">
              <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                Lookbook
                {featuredLookbook.season ? ` — ${featuredLookbook.season}` : ""}
              </p>
              <h2 className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
                {featuredLookbook.title}
              </h2>
              {featuredLookbook.description && (
                <p className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)]">
                  {featuredLookbook.description}
                </p>
              )}
              <Link
                href={`/lookbook/${featuredLookbook.slug}`}
                className="inline-flex items-center gap-[var(--spacing-2)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:underline transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none self-start"
              >
                View Lookbook →
              </Link>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ================================================================
          5. JOURNAL PREVIEW
          Latest 3 articles from CMS. Graceful empty state.
          ================================================================ */}
      {journalArticles.length > 0 && (
        <Section className="border-t border-[var(--color-border-subtle)] py-[var(--spacing-16)] lg:py-[var(--spacing-20)]">
          <div className="flex flex-col gap-[var(--spacing-10)]">
            {/* Section header */}
            <div className="flex items-end justify-between gap-[var(--spacing-6)]">
              <div className="flex flex-col gap-[var(--spacing-2)]">
                <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                  Editorial
                </p>
                <h2 className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
                  Journal
                </h2>
              </div>
              <Link
                href="/journal"
                aria-label="View all journal articles"
                className="hidden sm:inline-flex font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none focus-visible:outline-none focus-visible:underline shrink-0"
              >
                Read All →
              </Link>
            </div>

            {/* Article cards — 3-column on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-8)]">
              {journalArticles.map((article) => (
                <article key={article.id} className="group flex flex-col gap-[var(--spacing-4)]">
                  <Link
                    href={`/journal/${article.slug}`}
                    className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <GensisImage
                      src={article.featuredMedia.url}
                      alt={article.featuredMedia.alt || article.title}
                      aspectRatio="4/5"
                      className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </Link>

                  <div className="flex flex-col gap-[var(--spacing-2)]">
                    <p className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                      {article.category.name}
                    </p>
                    <h3 className="font-serif text-[length:var(--text-title)] leading-[var(--leading-title)] tracking-[var(--tracking-title)] text-[var(--color-fg-primary)]">
                      <Link
                        href={`/journal/${article.slug}`}
                        className="hover:underline decoration-[var(--color-gensis-stone)] underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    {article.excerpt && (
                      <p className="font-sans text-[length:var(--text-small)] leading-[var(--leading-small)] text-[var(--color-fg-muted)] line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    <Link
                      href={`/journal/${article.slug}`}
                      className="mt-[var(--spacing-2)] font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none focus-visible:outline-none focus-visible:underline self-start"
                    >
                      Read →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="sm:hidden text-center">
              <Link
                href="/journal"
                className="inline-flex items-center justify-center h-[var(--spacing-12)] px-[var(--spacing-8)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase border border-[var(--color-gensis-black)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none"
              >
                Read Journal
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* ================================================================
          6. CLOSING BRAND STATEMENT
          Editorial signature. Minimal. Premium.
          ================================================================ */}
      <Section className="border-t border-[var(--color-border-subtle)] py-[var(--spacing-32)] lg:py-[var(--spacing-40)] text-center">
        <div className="max-w-[var(--layout-narrow-width)] mx-auto flex flex-col items-center gap-[var(--spacing-8)]">
          <h2 className="font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]">
            Fashion evolves.
            <br />
            Great style endures.
          </h2>
          <Link
            href="/about"
            className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:underline transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none"
          >
            About GENSIS →
          </Link>
        </div>
      </Section>
    </div>
  );
}
