/**
 * CMS Contributor / Author Types
 *
 * Provider-neutral model for content contributors.
 * Does not include authentication, authorization, or author management.
 */

import type { MediaAsset } from "./content";

/**
 * A person who authors or contributes to CMS content.
 * Used on journal articles and editorial campaigns.
 */
export type Contributor = {
  /** Stable application-level identifier. */
  id: string;
  /** Full display name. */
  name: string;
  /** Optional role or title (e.g., "Creative Director", "Staff Writer"). */
  role?: string;
  /** Optional short biography. */
  bio?: string;
  /** Optional headshot or avatar image. */
  avatar?: MediaAsset;
};
