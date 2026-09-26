import * as React from "react";
import type { AboutPage as AboutPageModel } from "@/types/cms";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditorialRenderer } from "@/components/editorial/EditorialRenderer";
import { EditorialImage } from "@/components/editorial/EditorialImage";

export type AboutPageProps = {
  /** Normalized GENSIS AboutPage content model. */
  page: AboutPageModel;
  /** Optional container className override. */
  className?: string;
};

/**
 * AboutPage
 *
 * Provider-neutral page-composition component for the GENSIS About page.
 * Receives normalized AboutPage domain model and renders brand introduction & narrative.
 */
export function AboutPage({ page, className = "" }: AboutPageProps) {
  return (
    <PageContainer className={className}>
      <article className="py-[var(--spacing-8)] md:py-[var(--spacing-12)] flex flex-col gap-[var(--spacing-12)] md:gap-[var(--spacing-16)]">
        {/* Header Section */}
        <header className="max-w-4xl mx-auto flex flex-col gap-[var(--spacing-4)] text-center">
          <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            About GENSIS
          </span>

          <h1 className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-[var(--color-fg-primary)]">
            {page.title}
          </h1>

          {page.intro && (
            <p className="font-serif text-[length:var(--text-title)] leading-[var(--leading-title)] text-[var(--color-fg-secondary)] max-w-3xl mx-auto">
              {page.intro}
            </p>
          )}
        </header>

        {/* Featured Media */}
        {page.media && (
          <figure className="max-w-5xl mx-auto w-full">
            <EditorialImage
              src={page.media.url}
              alt={page.media.alt}
            />
            {(page.media.caption || page.media.credit) && (
              <figcaption className="font-sans text-[length:var(--text-caption)] leading-[var(--leading-caption)] text-[var(--color-fg-muted)] mt-[var(--spacing-2)] text-center">
                {page.media.caption}
                {page.media.credit && (
                  <span className="ml-[var(--spacing-2)] opacity-70">
                    © {page.media.credit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {/* Structured Body Content */}
        {page.body && page.body.length > 0 && (
          <div className="max-w-3xl mx-auto w-full">
            <EditorialRenderer blocks={page.body} />
          </div>
        )}
      </article>
    </PageContainer>
  );
}
