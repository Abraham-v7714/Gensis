import * as React from "react";
import type { Lookbook } from "@/types/cms";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditorialGrid } from "@/components/editorial/EditorialGrid";
import { EditorialImage } from "@/components/editorial/EditorialImage";

export type LookbookPageProps = {
  /** Normalized GENSIS Lookbook content model. */
  lookbook: Lookbook;
  /** Optional container className override. */
  className?: string;
};

/**
 * LookbookPage
 *
 * Provider-neutral page-composition component for GENSIS Lookbooks.
 * Receives normalized Lookbook domain model and renders sequence of editorial imagery.
 */
export function LookbookPage({ lookbook, className = "" }: LookbookPageProps) {
  const sortedItems = [...(lookbook.items ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <PageContainer className={className}>
      <article className="py-[var(--spacing-8)] md:py-[var(--spacing-12)] flex flex-col gap-[var(--spacing-12)] md:gap-[var(--spacing-16)]">
        {/* Header Section */}
        <header className="max-w-4xl flex flex-col gap-[var(--spacing-4)]">
          {lookbook.season && (
            <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
              {lookbook.season}
            </span>
          )}

          <h1 className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-[var(--color-fg-primary)]">
            {lookbook.title}
          </h1>

          {lookbook.collection && (
            <div className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)] flex items-center gap-[var(--spacing-2)]">
              <span>Collection:</span>
              <span className="text-[var(--color-fg-primary)] font-medium">
                {lookbook.collection.title}
              </span>
            </div>
          )}

          {lookbook.description && (
            <p className="font-sans text-[length:var(--text-title)] leading-[var(--leading-title)] text-[var(--color-fg-secondary)] max-w-2xl mt-[var(--spacing-2)]">
              {lookbook.description}
            </p>
          )}
        </header>

        {/* Cover / Hero Media */}
        {lookbook.coverMedia && (
          <figure className="w-full">
            <EditorialImage
              src={lookbook.coverMedia.url}
              alt={lookbook.coverMedia.alt}
            />
            {(lookbook.coverMedia.caption || lookbook.coverMedia.credit) && (
              <figcaption className="font-sans text-[length:var(--text-caption)] leading-[var(--leading-caption)] text-[var(--color-fg-muted)] mt-[var(--spacing-2)]">
                {lookbook.coverMedia.caption}
                {lookbook.coverMedia.credit && (
                  <span className="ml-[var(--spacing-2)] opacity-70">
                    © {lookbook.coverMedia.credit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {/* Ordered Lookbook Grid Sequence */}
        {sortedItems.length > 0 && (
          <section aria-label="Lookbook items">
            <EditorialGrid columns={2}>
              {sortedItems.map((item) => (
                <figure key={item.id} className="flex flex-col gap-[var(--spacing-2)]">
                  <EditorialImage
                    src={item.media.url}
                    alt={item.media.alt}
                    aspectRatio="portrait"
                  />
                  {item.caption && (
                    <figcaption className="font-sans text-[length:var(--text-caption)] leading-[var(--leading-caption)] text-[var(--color-fg-muted)]">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </EditorialGrid>
          </section>
        )}
      </article>
    </PageContainer>
  );
}
