/**
 * Sanity Studio Layout — Stage 4.2 / Updated Stage 4.19
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
 * Sanity Dashboard Bridge:
 *   Includes Sanity's recommended preloadModule and async module script
 *   injection for bridge.js. Strictly isolated to the /studio layout only.
 */

import type { Metadata, Viewport } from "next";
import { preloadModule } from "react-dom";
import { NextStudioLayout } from "next-sanity/studio";
import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";

const bridgeScript = "https://core.sanity-cdn.com/bridge.js";

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
  preloadModule(bridgeScript, { as: "script" });

  return (
    <>
      <script src={bridgeScript} async type="module" />
      <NextStudioLayout>{children}</NextStudioLayout>
    </>
  );
}
