/**
 * CMS Content References
 *
 * Lightweight provider-neutral reference types used to link between
 * content entities without duplicating full objects or creating circular imports.
 *
 * Rules:
 * - References contain only stable application-level identifiers (id, slug, title).
 * - References must NEVER contain full nested objects.
 * - References must NEVER contain provider-specific IDs or SDK types.
 * - Resolve full objects at the data-fetching layer, not inside reference types.
 *
 * Dependency order (no circular imports):
 *   references.ts imports nothing from other cms/* files.
 *   Other cms/* files may import from references.ts.
 */

// ------------------------------------------------------------------
// PRODUCT REFERENCE
// ------------------------------------------------------------------

/**
 * A lightweight reference to a product in the commerce domain.
 * Use this in editorial content to link to products without coupling
 * the CMS layer to the full Product type.
 */
export type ProductReference = {
  id: string;
  slug: string;
  title: string;
};

// ------------------------------------------------------------------
// COLLECTION REFERENCE
// ------------------------------------------------------------------

/**
 * A lightweight reference to a collection in the commerce domain.
 */
export type CollectionReference = {
  id: string;
  slug: string;
  title: string;
};

// ------------------------------------------------------------------
// JOURNAL REFERENCE
// ------------------------------------------------------------------

/**
 * A lightweight reference to a journal article.
 * Used by campaigns or lookbooks to cross-link editorial content.
 */
export type JournalReference = {
  id: string;
  slug: string;
  title: string;
};

// ------------------------------------------------------------------
// LOOKBOOK REFERENCE
// ------------------------------------------------------------------

/**
 * A lightweight reference to a lookbook.
 */
export type LookbookReference = {
  id: string;
  slug: string;
  title: string;
};

// ------------------------------------------------------------------
// CAMPAIGN REFERENCE
// ------------------------------------------------------------------

/**
 * A lightweight reference to an editorial campaign or story.
 */
export type CampaignReference = {
  id: string;
  slug: string;
  title: string;
};
