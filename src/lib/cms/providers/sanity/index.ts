/**
 * Sanity CMS Provider Entry Point
 *
 * Re-exports the SanityCmsClient, SanityPreviewCmsClient, and configuration.
 *
 * Stage 4.4 additions:
 *   SanityPreviewCmsClient — draft-aware CmsClient for Next.js Draft Mode preview
 *   getSanityPreviewClient — draft-aware Sanity client (server-only)
 */

export { SanityCmsClient } from "./SanityCmsClient";
export { SanityPreviewCmsClient } from "./SanityPreviewCmsClient";
export { sanityConfig, isSanityConfigured } from "./config";
