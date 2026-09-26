/**
 * Sanity Provider Configuration
 *
 * Provider-neutral environment and client settings for Sanity CMS integration.
 * Public parameters (projectId, dataset, apiVersion) use NEXT_PUBLIC_ prefixes.
 * Private tokens (token) must remain server-side only without NEXT_PUBLIC_ prefix.
 */

export const sanityConfig = {
  projectId:
    process.env.SANITY_PROJECT_ID ??
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
    "",
  dataset:
    process.env.SANITY_DATASET ??
    process.env.NEXT_PUBLIC_SANITY_DATASET ??
    "production",
  apiVersion:
    process.env.SANITY_API_VERSION ??
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ??
    "2026-09-12",
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_READ_TOKEN,
};

export function isSanityConfigured(): boolean {
  return Boolean(sanityConfig.projectId && sanityConfig.dataset);
}
