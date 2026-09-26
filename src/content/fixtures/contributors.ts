/**
 * CMS Contributor Fixtures (Development/Test Only)
 *
 * Provider-neutral contributor fixtures for local development and testing.
 */

import type { Contributor } from "@/types/cms";
import { mediaFixtures } from "./media";

export const contributorFixtures: Contributor[] = [
  {
    id: "fixture-contrib-1",
    name: "Alex Vance (Fixture)",
    role: "Senior Editorial Writer",
    bio: "Fictional author profile for development testing of GENSIS Journal articles.",
    avatar: mediaFixtures.avatar,
  },
  {
    id: "fixture-contrib-2",
    name: "Elena Rostova (Fixture)",
    role: "Creative Director & Stylist",
    bio: "Fictional creative director profile used to test contributor attribution.",
    avatar: mediaFixtures.avatar,
  },
];
