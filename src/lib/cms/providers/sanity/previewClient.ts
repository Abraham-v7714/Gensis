/**
 * Sanity Preview Client — Stage 4.4
 *
 * A draft-aware Sanity client used exclusively during Next.js Draft Mode.
 *
 * Differences from the production client (client.ts):
 *   - stega: true   → encodes content source metadata for Visual Editing overlays
 *   - perspective: "previewDrafts" → returns draft versions of documents when available
 *   - useCdn: false → bypasses CDN cache to retrieve fresh draft content
 *   - Requires SANITY_API_READ_TOKEN for authenticated draft access
 *
 * Security contract:
 *   - This file is server-only. Never import from client components.
 *   - SANITY_API_READ_TOKEN must remain server-side. Never use NEXT_PUBLIC_.
 *   - This client must NEVER be used for production rendering.
 *
 * Architecture:
 *   getSanityPreviewClient() → called only from SanityPreviewCmsClient
 *   SanityPreviewCmsClient → CmsClient implementation for preview context
 *   getPreviewCms() in src/lib/cms/index.ts → selects preview vs. production client
 */

import { createClient } from "next-sanity";
import { sanityConfig } from "./config";

/**
 * Returns a draft-aware Sanity client with stega encoding enabled.
 *
 * @throws {Error} If Sanity is not configured (missing projectId).
 * @throws {Error} If SANITY_API_READ_TOKEN is missing (required for draft access).
 */
export function getSanityPreviewClient() {
  if (!sanityConfig.projectId) {
    throw new Error(
      "[GENSIS CMS: Sanity Preview] Missing SANITY_PROJECT_ID environment variable. " +
        "Configure Sanity credentials in .env.local to enable draft preview."
    );
  }

  if (!sanityConfig.token) {
    throw new Error(
      "[GENSIS CMS: Sanity Preview] Missing SANITY_API_READ_TOKEN environment variable. " +
        "A read token is required to access draft content. " +
        "Configure SANITY_API_READ_TOKEN in .env.local (server-only, never NEXT_PUBLIC_)."
    );
  }

  return createClient({
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
    // Draft access requires bypassing the CDN cache entirely.
    useCdn: false,
    // Authenticated read token — required for draft document access.
    // Server-only: never passed as props or to client components.
    token: sanityConfig.token,
    // perspective: "previewDrafts" tells Sanity to return draft versions
    // of documents when they exist, falling back to the published version.
    perspective: "previewDrafts",
    // stega: true encodes content source metadata into string values.
    // This metadata is used by the VisualEditing overlay to know which
    // Sanity document and field a rendered value originates from.
    // Enabled only here (preview client) — not in the production client.
    stega: {
      enabled: true,
      studioUrl: "/studio",
    },
  });
}
