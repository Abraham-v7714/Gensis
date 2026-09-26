/**
 * CMS Taxonomy Types
 *
 * Provider-neutral models for content categorization.
 * These must not reference any CMS provider SDK or internal identifiers.
 */

// ------------------------------------------------------------------
// CATEGORY
// ------------------------------------------------------------------

/**
 * A top-level content category.
 * Used to group journal articles, campaigns, and other content.
 */
export type Category = {
  /** Stable application-level identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** URL-safe slug used for filtered listing pages. */
  slug: string;
  /** Optional short description of the category. */
  description?: string;
};

// ------------------------------------------------------------------
// TAG
// ------------------------------------------------------------------

/**
 * A lightweight content tag for cross-category labeling.
 */
export type Tag = {
  /** Stable application-level identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** URL-safe slug used for filtered listing pages. */
  slug: string;
};
