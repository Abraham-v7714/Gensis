import * as React from "react";
import type { Campaign } from "@/types/cms";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditorialRenderer } from "@/components/editorial/EditorialRenderer";
import { EditorialImage } from "@/components/editorial/EditorialImage";

export type CampaignPageProps = {
  /** Normalized GENSIS Campaign content model. */
  campaign: Campaign;
  /** Optional container className override. */
  className?: string;
};

/**
 * CampaignPage
 *
 * Provider-neutral page-composition component for GENSIS Campaign stories.
 * Receives normalized Campaign domain model and renders campaign narrative with lightweight references.
 */
export function CampaignPage({ campaign, className = "" }: CampaignPageProps) {
  const hasProducts = campaign.products && campaign.products.length > 0;
  const hasCollections = campaign.collections && campaign.collections.length > 0;

  return (
    <PageContainer className={className}>
      <article className="py-[var(--spacing-8)] md:py-[var(--spacing-12)] flex flex-col gap-[var(--spacing-12)] md:gap-[var(--spacing-16)]">
        {/* Campaign Hero Media */}
        {campaign.heroMedia && (
          <figure className="w-full">
            <EditorialImage
              src={campaign.heroMedia.url}
              alt={campaign.heroMedia.alt}
            />
            {(campaign.heroMedia.caption || campaign.heroMedia.credit) && (
              <figcaption className="font-sans text-[length:var(--text-caption)] leading-[var(--leading-caption)] text-[var(--color-fg-muted)] mt-[var(--spacing-2)]">
                {campaign.heroMedia.caption}
                {campaign.heroMedia.credit && (
                  <span className="ml-[var(--spacing-2)] opacity-70">
                    © {campaign.heroMedia.credit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {/* Campaign Header */}
        <header className="max-w-4xl flex flex-col gap-[var(--spacing-4)]">
          <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            Editorial Campaign
          </span>

          <h1 className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-[var(--color-fg-primary)]">
            {campaign.title}
          </h1>

          {campaign.description && (
            <p className="font-sans text-[length:var(--text-title)] leading-[var(--leading-title)] text-[var(--color-fg-secondary)] max-w-3xl">
              {campaign.description}
            </p>
          )}
        </header>

        {/* Structured Campaign Body */}
        {campaign.body && campaign.body.length > 0 && (
          <div className="max-w-4xl mx-auto w-full">
            <EditorialRenderer blocks={campaign.body} />
          </div>
        )}

        {/* Lightweight References Section */}
        {(hasProducts || hasCollections) && (
          <aside className="max-w-4xl mx-auto w-full pt-[var(--spacing-8)] border-t border-[var(--color-border-subtle)] flex flex-col gap-[var(--spacing-6)]">
            {hasCollections && (
              <div className="flex flex-col gap-[var(--spacing-2)]">
                <h2 className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                  Featured Collections
                </h2>
                <div className="flex flex-wrap gap-[var(--spacing-3)]">
                  {campaign.collections!.map((col) => (
                    <span
                      key={col.id}
                      className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-primary)] border border-[var(--color-border-default)] px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-sm)]"
                    >
                      {col.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasProducts && (
              <div className="flex flex-col gap-[var(--spacing-2)]">
                <h2 className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
                  Featured Products
                </h2>
                <div className="flex flex-wrap gap-[var(--spacing-3)]">
                  {campaign.products!.map((prod) => (
                    <span
                      key={prod.id}
                      className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-primary)] bg-[var(--color-bg-secondary)] px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-sm)]"
                    >
                      {prod.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </article>
    </PageContainer>
  );
}
