/**
 * About Page Content Model
 *
 * Provider-neutral model for the GENSIS About page content.
 * This is a singleton content model — only one About page exists.
 *
 * Do not hard-code GENSIS About copy into this model.
 * The actual content lives in the CMS and is normalized at the adapter layer.
 */

import type { ContentIdentity, MediaAsset, SeoMetadata } from "./content";
import type { EditorialBlock } from "./blocks";

/**
 * The GENSIS About page content.
 *
 * Singleton — fetched once, not by slug.
 * Extends ContentIdentity for lifecycle management (e.g., draft updates).
 */
export type AboutPage = ContentIdentity & {
  /**
   * Short introductory summary — displayed prominently at the top of the page.
   * Typically 1–3 sentences.
   */
  intro: string;
  /**
   * Ordered list of structured editorial content blocks composing the page body.
   * The presentation layer maps each block to the appropriate React component.
   */
  body: EditorialBlock[];
  /**
   * Optional featured media — e.g., a brand campaign image or atelier photography.
   */
  media?: MediaAsset;
  /** SEO metadata for the About page. */
  seo: SeoMetadata;
};
