/**
 * CMS Library — Entry Point
 *
 * This module is the single access point for CMS data in the application.
 *
 * Registered Provider: SANITY (SanityCmsClient / SanityPreviewCmsClient)
 *
 * Architecture:
 *   Sanity CMS → SanityCmsClient → CmsClient interface → Application pages
 *
 * Stage 4.4 additions:
 *   SanityPreviewCmsClient — draft-aware CmsClient for use during Draft Mode
 *   getPreviewCms()        — server-only function: returns the correct client
 *                           based on whether Next.js Draft Mode is active
 *
 * Usage in route/page Server Components:
 *   import { getPreviewCms } from "@/lib/cms";
 *   const client = await getPreviewCms();
 *   const article = await client.getJournalArticleBySlug(slug);
 *
 * The `cms` singleton remains available for non-preview use cases (e.g. listing
 * pages that intentionally never show drafts, or non-dynamic content routes).
 *
 * UI components must never import from CMS provider SDKs directly.
 */

import { SanityCmsClient } from "./providers/sanity";
import { SanityPreviewCmsClient } from "./providers/sanity";
import type { CmsClient } from "./types";

export type {
  CmsClient,
  ListOptions,
  JournalQueryOptions,
  CampaignQueryOptions,
  LookbookQueryOptions,
} from "./types";

export { CMS_TAGS, getTagsForDocument } from "./tags";

/**
 * Active production CMS client instance.
 * Always returns published content only — no drafts, no archived documents.
 */
export const cms: CmsClient = new SanityCmsClient();

/**
 * Returns the appropriate CmsClient based on the current Next.js Draft Mode state.
 *
 * - Draft Mode OFF → returns the production SanityCmsClient (published content only)
 * - Draft Mode ON  → returns SanityPreviewCmsClient (draft-aware, stega-encoded)
 *
 * SERVER-ONLY: This function calls `draftMode()` from `next/headers`, which is
 * only available in Server Components and Server Actions. Do not call this from
 * client components.
 *
 * @example
 * // In a page Server Component:
 * const client = await getPreviewCms();
 * const article = await client.getJournalArticleBySlug(slug);
 */
export async function getPreviewCms(): Promise<CmsClient> {
  // Dynamic import ensures this server-only function is never bundled
  // into client components even if accidentally imported.
  const { draftMode } = await import("next/headers");
  const { isEnabled } = await draftMode();

  if (isEnabled) {
    return new SanityPreviewCmsClient();
  }

  return cms;
}
