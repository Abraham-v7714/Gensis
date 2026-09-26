/**
 * Lookbook Content Model
 *
 * Provider-neutral model for GENSIS Lookbook entries.
 * A lookbook is an editorial sequence of curated imagery and storytelling,
 * optionally linked to a seasonal collection.
 */

import type { ContentIdentity, MediaAsset, SeoMetadata } from "./content";
import type { CollectionReference } from "./references";

/**
 * An individual item within a lookbook.
 * Each item represents a single editorial image with optional styling notes.
 */
export type LookbookItem = {
  /** Stable identifier for this lookbook item. */
  id: string;
  /** Editorial image for this lookbook slot. */
  media: MediaAsset;
  /** Optional editorial caption or styling note. */
  caption?: string;
  /** Optional display order override. Defaults to array index if absent. */
  order?: number;
};

/**
 * A GENSIS Lookbook.
 *
 * Extends ContentIdentity for lifecycle management.
 * Items are ordered and must be rendered in sequence.
 */
export type Lookbook = ContentIdentity & {
  /** Cover image shown on listing pages and as the hero. */
  coverMedia: MediaAsset;
  /**
   * Ordered list of lookbook items.
   * Presentation layer is responsible for layout (e.g., full-bleed grid, sequence).
   */
  items: LookbookItem[];
  /**
   * Optional season label (e.g., "Autumn 2026", "Resort 2027").
   * Free-form string — not an enum — to allow editorial flexibility.
   */
  season?: string;
  /**
   * Optional reference to the collection this lookbook is associated with.
   * Uses a lightweight reference to avoid coupling to the full Collection type.
   */
  collection?: CollectionReference;
  /** SEO metadata for this lookbook's page. */
  seo: SeoMetadata;
};

/**
 * Minimal lookbook summary for listing pages.
 */
export type LookbookSummary = Pick<
  Lookbook,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "coverMedia"
  | "season"
  | "collection"
  | "publishedAt"
  | "status"
>;
