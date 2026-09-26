/**
 * Sanity Studio Layout — Stage 4.2
 *
 * Isolated layout for the /studio route subtree.
 * This layout REPLACES the root storefront layout (src/app/layout.tsx)
 * for all routes under /studio/. Next.js App Router uses the nearest
 * layout segment, so the storefront SiteHeader, fonts, and globals.css
 * are NOT loaded on Studio pages.
 *
 * NextStudioLayout provides:
 *   - Proper Studio viewport meta
 *   - Studio-required CSS reset/baseline
 *   - Correct HTML structure for Sanity Studio v3
 *
 * Authentication:
 *   Sanity Studio handles authentication internally using Sanity's own
 *   auth system. Editors sign in with their Sanity account credentials
 *   (or SSO if configured in the Sanity project settings).
 *   No custom auth middleware is implemented at this stage.
 *
 * Access control:
 *   /studio is not protected by application-level middleware.
 *   Sanity Studio's own session-based auth prevents unauthorized content
 *   editing. Route-level middleware protection is deferred to Stage 4.3+.
 */

import type { Metadata, Viewport } from "next";
import { NextStudioLayout } from "next-sanity/studio";
import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";

export const metadata: Metadata = {
  ...studioMetadata,
  title: "GENSIS Editorial Studio",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = studioViewport;

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextStudioLayout>{children}</NextStudioLayout>;
}
