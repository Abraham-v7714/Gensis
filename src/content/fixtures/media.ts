/**
 * CMS Media Asset Fixtures (Development/Test Only)
 *
 * Provider-neutral media fixtures for local development and testing.
 * Uses local placeholder paths to avoid external image host dependencies.
 */

import type { MediaAsset } from "@/types/cms";

export const mediaFixtures: Record<string, MediaAsset> = {
  hero: {
    id: "fixture-media-hero",
    url: "/images/placeholder-hero.jpg",
    alt: "Development Fixture: Hero Editorial Image",
    width: 1920,
    height: 1080,
    caption: "Fictional editorial imagery for development testing.",
    credit: "GENSIS Studio Fixtures",
  },
  portrait: {
    id: "fixture-media-portrait",
    url: "/images/placeholder-portrait.jpg",
    alt: "Development Fixture: Portrait Editorial Image",
    width: 800,
    height: 1200,
    caption: "Fictional portrait for development testing.",
    credit: "GENSIS Studio Fixtures",
  },
  landscape: {
    id: "fixture-media-landscape",
    url: "/images/placeholder-landscape.jpg",
    alt: "Development Fixture: Landscape Detail Image",
    width: 1200,
    height: 800,
    caption: "Fictional detail image for development testing.",
    credit: "GENSIS Studio Fixtures",
  },
  square: {
    id: "fixture-media-square",
    url: "/images/placeholder-square.jpg",
    alt: "Development Fixture: Square Grid Image",
    width: 800,
    height: 800,
    caption: "Fictional square detail for development testing.",
    credit: "GENSIS Studio Fixtures",
  },
  avatar: {
    id: "fixture-media-avatar",
    url: "/images/placeholder-avatar.jpg",
    alt: "Development Fixture: Contributor Avatar",
    width: 200,
    height: 200,
  },
};
