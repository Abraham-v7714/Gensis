/**
 * Journal / Article Content Model
 *
 * Provider-neutral model for GENSIS Journal articles.
 * The body is represented as structured editorial blocks rather than
 * a single HTML string, allowing the presentation layer to render
 * each block with the appropriate component.
 */

import type { ContentIdentity, MediaAsset, SeoMetadata } from "./content";
import type { EditorialBlock } from "./blocks";
import type { Contributor } from "./contributor";
import type { Category, Tag } from "./taxonomy";

/**
 * A GENSIS Journal article.
 *
 * Extends ContentIdentity for lifecycle management.
 * The `body` field is an ordered list of structured editorial blocks.
 */
export type JournalArticle = ContentIdentity & {
  /** Short excerpt or summary displayed on listing pages. */
  excerpt: string;
  /** Hero / featured image for the article. */
  featuredMedia: MediaAsset;
  /**
   * Ordered list of structured editorial content blocks.
   * The presentation layer maps each block to the appropriate component.
   */
  body: EditorialBlock[];
  /** Primary author or contributor. */
  author: Contributor;
  /** Optional additional contributors. */
  contributors?: Contributor[];
  /** Primary category for navigation and filtering. */
  category: Category;
  /** Optional content tags for cross-cutting labeling. */
  tags?: Tag[];
  /** SEO metadata for this article's page. */
  seo: SeoMetadata;
};

/**
 * Minimal journal article summary used in listing contexts.
 * Avoids fetching the full body when only card-level data is needed.
 */
export type JournalArticleSummary = Pick<
  JournalArticle,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "featuredMedia"
  | "author"
  | "category"
  | "tags"
  | "publishedAt"
  | "status"
>;
