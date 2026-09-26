/**
 * Sanity Studio Page — Stage 4.2
 *
 * Catch-all route for /studio and all sub-paths (/studio/desk/*, etc.).
 * Sanity Studio v3 uses client-side routing internally — the catch-all
 * pattern ensures all Studio navigation paths are handled by Next.js
 * without 404 errors.
 *
 * "use client" is required because NextStudio renders the Studio SPA,
 * which is a fully client-side React application.
 *
 * Provider boundary:
 *   This file imports ONLY from the Sanity provider boundary:
 *     @/lib/cms/providers/sanity/studio/config
 *
 *   It does NOT import from @/types/cms, @/components, or any storefront code.
 *
 * Security:
 *   - SANITY_API_READ_TOKEN is NOT imported here.
 *   - gensisStudioConfig only contains public project/dataset identifiers
 *     (NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET).
 *   - No private credentials are serialized to the client bundle.
 *
 * Authentication:
 *   Sanity Studio handles authentication using its own session system.
 *   Editors must sign in with their Sanity account to access Studio features.
 */

"use client";

import { NextStudio } from "next-sanity/studio";
import { gensisStudioConfig } from "@/lib/cms/providers/sanity/studio/config";

export default function StudioPage() {
  return <NextStudio config={gensisStudioConfig} />;
}
