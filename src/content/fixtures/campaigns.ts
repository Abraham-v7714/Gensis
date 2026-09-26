/**
 * CMS Campaign Fixtures (Development/Test Only)
 *
 * Provider-neutral Campaign fixtures for local development and testing.
 */

import type { Campaign } from "@/types/cms";
import { mediaFixtures } from "./media";
import {
  headingFixture,
  richtextFixture,
  splitFixture,
  galleryFixture,
} from "./editorial";

export const campaignFixtures: Campaign[] = [
  {
    id: "fixture-campaign-1",
    slug: "fixture-monolith-and-light",
    title: "Monolith & Light (Development Fixture)",
    description: "A fictional editorial campaign fixture exploring architectural form and shadow.",
    status: "published",
    publishedAt: "2026-07-20T12:00:00Z",
    updatedAt: "2026-07-20T12:00:00Z",
    heroMedia: mediaFixtures.hero,
    body: [
      headingFixture,
      richtextFixture,
      splitFixture,
      galleryFixture,
    ],
    products: [
      {
        id: "fixture-prod-coat-1",
        slug: "structural-wool-coat-fixture",
        title: "Structural Wool Coat (Fixture Product)",
      },
      {
        id: "fixture-prod-pant-1",
        slug: "architectural-trousers-fixture",
        title: "Architectural Trousers (Fixture Product)",
      },
    ],
    collections: [
      {
        id: "fixture-col-monolith",
        slug: "monolith-series-fixture",
        title: "Monolith Series (Fixture Collection)",
      },
    ],
    seo: {
      title: "Monolith & Light Campaign (Fixture)",
      description: "Development campaign fixture SEO description.",
      canonicalUrl: "https://gensis.example.com/campaigns/fixture-monolith-and-light",
    },
  },
  {
    id: "fixture-campaign-2",
    slug: "fixture-tactile-quietude",
    title: "Tactile Quietude (Development Fixture)",
    description: "A fictional editorial narrative exploring minimalist textures.",
    status: "published",
    publishedAt: "2026-06-10T10:00:00Z",
    updatedAt: "2026-06-10T10:00:00Z",
    heroMedia: mediaFixtures.landscape,
    body: [
      {
        type: "heading",
        level: 2,
        text: "The Geometry of Restraint (Fixture)",
      },
      {
        type: "richtext",
        html: "<p>A development campaign narrative exploring heavy textures and understated proportions.</p>",
      },
    ],
    products: [
      {
        id: "fixture-prod-knit-1",
        slug: "gauge-cashmere-sweater-fixture",
        title: "Gauge Cashmere Sweater (Fixture Product)",
      },
    ],
    seo: {
      title: "Tactile Quietude Campaign (Fixture)",
      description: "Development campaign fixture SEO description for tactile story.",
    },
  },
];
