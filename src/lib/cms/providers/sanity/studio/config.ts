/**
 * Sanity Studio Configuration — Stage 4.2 / Updated Stage 4.4
 *
 * Provider-specific Studio configuration for GENSIS.
 * Strictly inside: src/lib/cms/providers/sanity/
 *
 * This file exports a ready-to-use Sanity Studio config created via
 * `defineConfig()` from the `sanity` package. It is imported only by
 * the /studio route's page component — never by storefront code.
 *
 * Environment Variables:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID — intentionally public (Studio browser requirement)
 *   NEXT_PUBLIC_SANITY_DATASET    — intentionally public (Studio browser requirement)
 *   NEXT_PUBLIC_SITE_URL          — storefront origin for Presentation Tool preview URLs
 *   SANITY_API_READ_TOKEN         — server-only, NEVER exposed to client
 *
 * Why NEXT_PUBLIC_ for Studio?
 *   Sanity Studio is a browser-side SPA. It needs the project ID and dataset
 *   in the client bundle to connect to Sanity Content Lake. These are
 *   non-secret identifiers (equivalent to a database name), not credentials.
 *   The read token (used for GROQ queries in the application) remains
 *   server-only and is never included here.
 *
 * Presentation Tool (Stage 4.4):
 *   presentationTool() enables the Presentation side-panel in Studio.
 *   Editors can click a "Preview" button on any document to see it
 *   rendered in the live storefront with Draft Mode enabled.
 *   The previewUrl.previewMode.enable URL points to:
 *     /api/draft-mode/enable
 *   This route validates a short-lived Sanity preview secret before
 *   enabling Next.js Draft Mode — no unauthenticated access possible.
 *
 * About singleton:
 *   The aboutPage document type is surfaced as a singleton via the
 *   Structure Builder in structure.ts. The __experimental_actions pattern
 *   for fully hiding the "Create new" button requires Sanity Studio v3 plugin
 *   support and is deferred to Stage 4.3+. The current implementation
 *   uses custom structure navigation to make the singleton ergonomic.
 *
 * Intentionally deferred:
 *   - Webhooks / on-demand cache invalidation
 *   - Shopify / Tapstitch commerce references
 *   - Visual Editing Draft Mode Live Preview (server-sent events)
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "../schemas";
import { gensisStructure } from "./structure";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ??
  process.env.SANITY_API_VERSION ??
  "2026-09-12";

/**
 * Storefront origin for Presentation Tool preview URL resolution.
 * Falls back to localhost for local development.
 */
const storefront =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * GENSIS Sanity Studio configuration.
 * Consumed by NextStudio in src/app/studio/[[...tool]]/page.tsx.
 */
export const gensisStudioConfig = defineConfig({
  name: "gensis-studio",
  title: "GENSIS Editorial Studio",

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: gensisStructure,
    }),

    /**
     * Presentation Tool — Stage 4.4
     *
     * Adds a Presentation side-panel to Sanity Studio allowing editors to
     * preview storefront content alongside their edits in real-time.
     *
     * Security: All preview activations are validated through
     * /api/draft-mode/enable which uses @sanity/preview-url-secret.
     */
    presentationTool({
      name: "presentation",
      title: "Preview",
      previewUrl: {
        origin: storefront,
        previewMode: {
          enable: `${storefront}/api/draft-mode/enable`,
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Ensure the aboutPage singleton is always surfaced via structure,
    // not via a generic "New document" flow.
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        // Suppress aboutPage from the global "New document" menu
        return prev.filter((item) => item.templateId !== "aboutPage");
      }
      return prev;
    },
  },
});

/**
 * @deprecated Use `gensisStudioConfig` (the defineConfig result) directly.
 * Retained for backward compatibility with Stage 4.1 references.
 */
export function createStudioConfig() {
  return {
    name: "gensis-studio",
    title: "GENSIS Editorial Studio",
    projectId,
    dataset,
    apiVersion,
    basePath: "/studio",
    schema: { types: schemaTypes },
  };
}
