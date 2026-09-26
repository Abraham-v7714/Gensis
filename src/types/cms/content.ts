/**
 * CMS Content Primitives
 *
 * Provider-neutral core types shared across all GENSIS content models.
 * These types must not reference any CMS provider SDK, Sanity, Contentful,
 * Shopify CMS, or any other third-party content platform.
 */

// ------------------------------------------------------------------
// CONTENT LIFECYCLE
// ------------------------------------------------------------------

/**
 * Publishing lifecycle states for all CMS-managed content.
 * Provider-neutral — do not map directly to provider-specific states.
 */
export type ContentStatus = "draft" | "published" | "archived";

/**
 * Base identity and lifecycle fields shared by all top-level content models.
 * Extend this type rather than duplicating these fields.
 */
export type ContentIdentity = {
  /** Stable application-level identifier. Never expose provider-internal IDs in the UI. */
  id: string;
  /** URL-safe slug used for routing and lookup. */
  slug: string;
  /** Human-readable title of the content. */
  title: string;
  /** Optional short description or excerpt. */
  description?: string;
  /** Publishing lifecycle status. */
  status: ContentStatus;
  /** ISO 8601 datetime string — when the content was first published. */
  publishedAt: string | null;
  /** ISO 8601 datetime string — when the content was last updated. */
  updatedAt: string;
};

// ------------------------------------------------------------------
// SEO METADATA
// ------------------------------------------------------------------

/**
 * Provider-neutral SEO metadata.
 * Consumed by page-level metadata generation — not by UI components directly.
 * Do not implement generateMetadata, sitemap, or Open Graph rendering here.
 */
export type SeoMetadata = {
  /** Override for the page <title> tag. Falls back to content title if absent. */
  title?: string;
  /** Meta description for search engines. */
  description?: string;
  /** Canonical URL override. If absent, the current page URL is canonical. */
  canonicalUrl?: string;
  /** If true, the page should not be indexed by search engines. */
  noIndex?: boolean;
  /** Optional social sharing image override. */
  image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

// ------------------------------------------------------------------
// MEDIA
// ------------------------------------------------------------------

/**
 * Provider-neutral media asset.
 *
 * Intentionally separate from commerce ProductImage:
 * - ProductImage is a commerce domain concept tied to product variants.
 * - MediaAsset is a CMS editorial concept used in articles, lookbooks, and campaigns.
 *
 * Do not merge these two types even if they appear similar.
 */
export type MediaAsset = {
  /** Stable application-level identifier. */
  id: string;
  /** Absolute URL to the media file. */
  url: string;
  /** Descriptive alt text for accessibility. Required. */
  alt: string;
  /** Intrinsic pixel width, if known. */
  width?: number;
  /** Intrinsic pixel height, if known. */
  height?: number;
  /** Optional editorial caption displayed beneath the media. */
  caption?: string;
  /** Optional photographer or rights credit. */
  credit?: string;
};
