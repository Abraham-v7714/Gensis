/**
 * CMS About Page Fixture (Development/Test Only)
 *
 * Provider-neutral AboutPage fixture for local development and testing.
 */

import type { AboutPage } from "@/types/cms";
import { mediaFixtures } from "./media";
import {
  headingFixture,
  richtextFixture,
  splitFixture,
  pullquoteFixture,
} from "./editorial";

export const aboutFixture: AboutPage = {
  id: "fixture-about-singleton",
  slug: "about",
  title: "About GENSIS (Development Fixture)",
  description: "Fictional about page fixture introducing atelier principles and design philosophy.",
  intro: "GENSIS is a fictional architectural garment laboratory established to test provider-neutral CMS renderers.",
  status: "published",
  publishedAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-09-01T12:00:00Z",
  media: mediaFixtures.hero,
  body: [
    headingFixture,
    richtextFixture,
    pullquoteFixture,
    splitFixture,
  ],
  seo: {
    title: "About GENSIS (Fixture)",
    description: "Development About page fixture SEO metadata.",
    canonicalUrl: "https://gensis.example.com/about",
  },
};
