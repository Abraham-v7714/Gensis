/**
 * CMS Lookbook Fixtures (Development/Test Only)
 *
 * Provider-neutral Lookbook fixtures for local development and testing.
 */

import type { Lookbook } from "@/types/cms";
import { mediaFixtures } from "./media";

export const lookbookFixtures: Lookbook[] = [
  {
    id: "fixture-lookbook-1",
    slug: "fixture-autumn-winter-2026-study",
    title: "Autumn / Winter 2026 Lookbook (Development Fixture)",
    description: "A fictional development lookbook fixture showcasing cold-weather tailoring.",
    status: "published",
    publishedAt: "2026-08-01T08:00:00Z",
    updatedAt: "2026-08-01T08:00:00Z",
    coverMedia: mediaFixtures.hero,
    season: "Autumn / Winter 2026 (Fixture)",
    collection: {
      id: "fixture-col-aw26",
      slug: "autumn-winter-2026-fixture",
      title: "Autumn/Winter 2026 Collection (Fixture)",
    },
    items: [
      {
        id: "fixture-look-1",
        media: mediaFixtures.portrait,
        caption: "Look 01: Oversized double-breasted coat in raw wool (Fixture).",
        order: 1,
      },
      {
        id: "fixture-look-2",
        media: mediaFixtures.landscape,
        caption: "Look 02: Structured trousers with asymmetrical lapel jacket (Fixture).",
        order: 2,
      },
      {
        id: "fixture-look-3",
        media: mediaFixtures.square,
        caption: "Look 03: Layered knitwear detail with contrast stitching (Fixture).",
        order: 3,
      },
    ],
    seo: {
      title: "Autumn / Winter 2026 Lookbook (Fixture)",
      description: "Development lookbook fixture SEO description for AW26.",
      canonicalUrl: "https://gensis.example.com/lookbook/fixture-autumn-winter-2026-study",
    },
  },
  {
    id: "fixture-lookbook-2",
    slug: "fixture-resort-capsule-study",
    title: "Resort Capsule Study (Development Fixture)",
    description: "A fictional development lookbook fixture showcasing lightweight linen silhouettes.",
    status: "published",
    publishedAt: "2026-05-15T09:00:00Z",
    updatedAt: "2026-05-15T09:00:00Z",
    coverMedia: mediaFixtures.landscape,
    season: "Resort 2027 (Fixture)",
    items: [
      {
        id: "fixture-look-resort-1",
        media: mediaFixtures.square,
        caption: "Look 01: Unstructured linen blazer and wide-leg trousers (Fixture).",
        order: 1,
      },
      {
        id: "fixture-look-resort-2",
        media: mediaFixtures.portrait,
        caption: "Look 02: Draped tunic in organic cotton gauze (Fixture).",
        order: 2,
      },
    ],
    seo: {
      title: "Resort Capsule Study (Fixture)",
      description: "Development lookbook fixture SEO description for Resort capsule.",
    },
  },
];
