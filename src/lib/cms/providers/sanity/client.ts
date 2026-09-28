/**
 * Sanity Client Setup
 *
 * Configures Sanity client instance using next-sanity createClient.
 * This client is used exclusively inside the Sanity provider boundary.
 */

import { createClient } from "next-sanity";
import { sanityConfig } from "./config";

export function getSanityClient() {
  if (!sanityConfig.projectId) {
    throw new Error(
      "[GENSIS CMS: Sanity] Missing SANITY_PROJECT_ID environment variable. " +
        "Configure Sanity credentials in .env.local to query live Sanity CMS data."
    );
  }

  return createClient({
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
    useCdn: sanityConfig.useCdn,
  });
}
