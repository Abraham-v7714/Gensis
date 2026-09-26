/**
 * CMS Journal Article Fixtures (Development/Test Only)
 *
 * Provider-neutral JournalArticle fixtures for local development and testing.
 */

import type { JournalArticle } from "@/types/cms";
import { mediaFixtures } from "./media";
import { taxonomyFixtures } from "./taxonomy";
import { contributorFixtures } from "./contributors";
import {
  headingFixture,
  richtextFixture,
  imageFixture,
  pullquoteFixture,
  dividerFixture,
  splitFixture,
  galleryFixture,
} from "./editorial";

export const journalFixtures: JournalArticle[] = [
  {
    id: "fixture-article-1",
    slug: "fixture-material-study-wool",
    title: "Material Study: Structural Wool (Development Fixture)",
    description: "A fictional development fixture article exploring heavy wool construction.",
    excerpt: "Exploring the tactile weight and structural drape of unbleached architectural wool in fictional garment construction.",
    status: "published",
    publishedAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
    featuredMedia: mediaFixtures.hero,
    author: contributorFixtures[0],
    contributors: [contributorFixtures[1]],
    category: taxonomyFixtures.categories[0],
    tags: [taxonomyFixtures.tags[0], taxonomyFixtures.tags[1]],
    body: [
      headingFixture,
      richtextFixture,
      imageFixture,
      pullquoteFixture,
      dividerFixture,
      splitFixture,
    ],
    seo: {
      title: "Material Study: Structural Wool (Fixture)",
      description: "Development fixture article SEO description for wool material study.",
      canonicalUrl: "https://gensis.example.com/journal/fixture-material-study-wool",
    },
  },
  {
    id: "fixture-article-2",
    slug: "fixture-silhouette-and-space",
    title: "Silhouette & Space (Development Fixture)",
    description: "A fictional development fixture article on spatial form and movement.",
    excerpt: "Examining how negative space shapes modern outerwear silhouettes in atelier environments.",
    status: "published",
    publishedAt: "2026-08-15T14:30:00Z",
    updatedAt: "2026-08-15T14:30:00Z",
    featuredMedia: mediaFixtures.landscape,
    author: contributorFixtures[1],
    category: taxonomyFixtures.categories[1],
    tags: [taxonomyFixtures.tags[2], taxonomyFixtures.tags[3]],
    body: [
      {
        type: "heading",
        level: 2,
        text: "Spatial Volume in Garment Construction (Fixture)",
      },
      {
        type: "richtext",
        html: "<p>Fictional development copy detailing the interplay between body drape and tailored geometry.</p>",
      },
      galleryFixture,
    ],
    seo: {
      title: "Silhouette & Space (Fixture)",
      description: "Development fixture article SEO description for spatial silhouette analysis.",
    },
  },
  {
    id: "fixture-article-3",
    slug: "fixture-archive-retrospective",
    title: "Archive Retrospective: Draft Study (Development Fixture)",
    description: "A fictional development fixture article in draft status.",
    excerpt: "Unpublished draft article fixture reserved for testing status filters and preview modes.",
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-09-10T09:15:00Z",
    featuredMedia: mediaFixtures.portrait,
    author: contributorFixtures[0],
    category: taxonomyFixtures.categories[2],
    tags: [taxonomyFixtures.tags[2]],
    body: [
      {
        type: "richtext",
        html: "<p>Draft fixture content for preview workflow testing.</p>",
      },
    ],
    seo: {
      title: "Archive Retrospective (Draft Fixture)",
      description: "Draft article fixture SEO description.",
      noIndex: true,
    },
  },
];
