import * as React from "react";
import type { JournalArticle } from "@/types/cms";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditorialRenderer } from "@/components/editorial/EditorialRenderer";
import { EditorialImage } from "@/components/editorial/EditorialImage";
import { GensisImage } from "@/components/shared/GensisImage";

export type JournalArticlePageProps = {
  /** Normalized GENSIS JournalArticle content model. */
  article: JournalArticle;
  /** Optional container className override. */
  className?: string;
};

/**
 * JournalArticlePage
 *
 * Provider-neutral page-composition component for GENSIS Journal articles.
 * Receives normalized JournalArticle domain model and renders article structure.
 */
export function JournalArticlePage({ article, className = "" }: JournalArticlePageProps) {
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <PageContainer className={className}>
      <article className="py-[var(--spacing-8)] md:py-[var(--spacing-12)]">
        {/* Article Header */}
        <header className="max-w-4xl mx-auto flex flex-col gap-[var(--spacing-4)] mb-[var(--spacing-8)] md:mb-[var(--spacing-12)]">
          {article.category && (
            <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
              {article.category.name}
            </span>
          )}

          <h1 className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-[var(--color-fg-primary)]">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="font-sans text-[length:var(--text-title)] leading-[var(--leading-title)] text-[var(--color-fg-secondary)] max-w-3xl">
              {article.excerpt}
            </p>
          )}

          {/* Contributor & Publication Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-4)] pt-[var(--spacing-4)] border-t border-[var(--color-border-subtle)] font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
            <div className="flex flex-wrap items-center gap-[var(--spacing-4)]">
              {article.author && (
                <div className="flex items-center gap-[var(--spacing-2)]">
                  {article.author.avatar && (
                    <GensisImage
                      src={article.author.avatar.url}
                      alt={article.author.avatar.alt}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span>
                    By <strong className="text-[var(--color-fg-primary)] font-medium">{article.author.name}</strong>
                    {article.author.role && ` — ${article.author.role}`}
                  </span>
                </div>
              )}

              {article.contributors && article.contributors.length > 0 && (
                <div className="flex items-center gap-[var(--spacing-1)]">
                  <span>With contributions from:</span>
                  <span className="text-[var(--color-fg-secondary)]">
                    {article.contributors.map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {publishedDate && (
              <time dateTime={article.publishedAt ?? undefined}>
                {publishedDate}
              </time>
            )}
          </div>
        </header>

        {/* Featured Hero Media */}
        {article.featuredMedia && (
          <figure className="max-w-5xl mx-auto mb-[var(--spacing-12)] md:mb-[var(--spacing-16)]">
            <EditorialImage
              src={article.featuredMedia.url}
              alt={article.featuredMedia.alt}
            />
            {(article.featuredMedia.caption || article.featuredMedia.credit) && (
              <figcaption className="font-sans text-[length:var(--text-caption)] leading-[var(--leading-caption)] text-[var(--color-fg-muted)] mt-[var(--spacing-2)]">
                {article.featuredMedia.caption}
                {article.featuredMedia.credit && (
                  <span className="ml-[var(--spacing-2)] opacity-70">
                    © {article.featuredMedia.credit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Body Content */}
        {article.body && article.body.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <EditorialRenderer blocks={article.body} />
          </div>
        )}

        {/* Footer Tags */}
        {article.tags && article.tags.length > 0 && (
          <footer className="max-w-3xl mx-auto mt-[var(--spacing-12)] pt-[var(--spacing-6)] border-t border-[var(--color-border-subtle)] flex flex-wrap items-center gap-[var(--spacing-2)]">
            <span className="font-sans text-[length:var(--text-label)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] mr-[var(--spacing-2)]">
              Tags:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-secondary)] px-[var(--spacing-3)] py-[var(--spacing-1)] bg-[var(--color-bg-secondary)] rounded-[var(--radius-sm)]"
              >
                {tag.name}
              </span>
            ))}
          </footer>
        )}
      </article>
    </PageContainer>
  );
}
