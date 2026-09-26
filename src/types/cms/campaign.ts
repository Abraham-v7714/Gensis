/**
 * Campaign / Editorial Story Content Model
 *
 * Provider-neutral model for GENSIS editorial campaigns and brand stories.
 * A campaign is a long-form editorial narrative that may reference products
 * and collections from the commerce domain.
 *
 * References to commerce entities use lightweight reference types —
 * not full commerce domain objects — to preserve domain separation.
 */

import type { ContentIdentity, MediaAsset, SeoMetadata } from "./content";
import type { EditorialBlock } from "./blocks";
import type { ProductReference, CollectionReference } from "./references";

/**
 * A GENSIS editorial campaign or brand story.
 *
 * Extends ContentIdentity for lifecycle management.
 * The `body` field is an ordered list of structured editorial blocks
 * allowing rich storytelling without coupling to a single HTML string.
 */
export type Campaign = ContentIdentity & {
  /**
   * Hero / cover media — typically a full-bleed campaign image or film still.
   */
  heroMedia: MediaAsset;
  /**
   * Ordered list of structured editorial content blocks composing the campaign narrative.
   */
  body: EditorialBlock[];
  /**
   * Optional product references — products featured in this campaign.
   * Uses lightweight reference to avoid coupling to the full Product type.
   */
  products?: ProductReference[];
  /**
   * Optional collection references — collections featured in this campaign.
   * Uses lightweight reference to avoid coupling to the full Collection type.
   */
  collections?: CollectionReference[];
  /** SEO metadata for this campaign's page. */
  seo: SeoMetadata;
};

/**
 * Minimal campaign summary for listing pages.
 */
export type CampaignSummary = Pick<
  Campaign,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "heroMedia"
  | "publishedAt"
  | "status"
>;
