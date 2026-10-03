/**
 * Root Sanity CLI Configuration
 *
 * Configures project identity, studio base path, and deployed app ID for Sanity CLI commands.
 */
import { defineCliConfig } from "sanity/cli";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "a0flud3z";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    appId: "ghgeslf8lkzxs0iqsmin9va8",
  },
});
