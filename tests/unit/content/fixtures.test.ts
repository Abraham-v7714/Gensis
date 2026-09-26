import { describe, it, expect } from "vitest";
import {
  journalFixtures,
  lookbookFixtures,
  campaignFixtures,
  aboutFixture,
  editorialFixtures,
  taxonomyFixtures,
  contributorFixtures,
  mediaFixtures,
} from "@/content/fixtures";
import type { EditorialBlock } from "@/types/cms";

describe("CMS Development Content Fixtures", () => {
  it("provides non-empty journal fixtures with valid structure", () => {
    expect(journalFixtures.length).toBeGreaterThanOrEqual(2);

    for (const article of journalFixtures) {
      expect(article.id).toBeTruthy();
      expect(article.slug).toBeTruthy();
      expect(article.title).toBeTruthy();
      expect(article.excerpt).toBeTruthy();
      expect(article.featuredMedia?.url).toBeTruthy();
      expect(article.author?.name).toBeTruthy();
      expect(article.category?.name).toBeTruthy();
      expect(article.body.length).toBeGreaterThan(0);
      expect(article.seo).toBeDefined();

      // Provider neutrality check
      expect(article).not.toHaveProperty("_id");
      expect(article).not.toHaveProperty("_type");
      expect(article).not.toHaveProperty("sys");
    }
  });

  it("provides non-empty lookbook fixtures with ordered items", () => {
    expect(lookbookFixtures.length).toBeGreaterThanOrEqual(1);

    for (const lookbook of lookbookFixtures) {
      expect(lookbook.id).toBeTruthy();
      expect(lookbook.slug).toBeTruthy();
      expect(lookbook.coverMedia?.url).toBeTruthy();
      expect(lookbook.items.length).toBeGreaterThan(0);
      expect(lookbook.seo).toBeDefined();

      for (const item of lookbook.items) {
        expect(item.id).toBeTruthy();
        expect(item.media?.url).toBeTruthy();
      }

      // Provider neutrality check
      expect(lookbook).not.toHaveProperty("_id");
      expect(lookbook).not.toHaveProperty("_type");
    }
  });

  it("provides non-empty campaign fixtures with lightweight references", () => {
    expect(campaignFixtures.length).toBeGreaterThanOrEqual(1);

    for (const campaign of campaignFixtures) {
      expect(campaign.id).toBeTruthy();
      expect(campaign.heroMedia?.url).toBeTruthy();
      expect(campaign.body.length).toBeGreaterThan(0);
      expect(campaign.seo).toBeDefined();

      if (campaign.products) {
        for (const prodRef of campaign.products) {
          expect(prodRef.id).toBeTruthy();
          expect(prodRef.slug).toBeTruthy();
          expect(prodRef.title).toBeTruthy();
          // Ensure it's a lightweight reference, not a full commerce product object
          expect(prodRef).not.toHaveProperty("price");
          expect(prodRef).not.toHaveProperty("variants");
        }
      }

      if (campaign.collections) {
        for (const colRef of campaign.collections) {
          expect(colRef.id).toBeTruthy();
          expect(colRef.slug).toBeTruthy();
          expect(colRef.title).toBeTruthy();
        }
      }
    }
  });

  it("provides a valid singleton About page fixture", () => {
    expect(aboutFixture.id).toBeTruthy();
    expect(aboutFixture.slug).toBe("about");
    expect(aboutFixture.intro).toBeTruthy();
    expect(aboutFixture.body.length).toBeGreaterThan(0);
    expect(aboutFixture.seo).toBeDefined();
  });

  it("covers every EditorialBlock variant in editorialFixtures", () => {
    const blockTypes = new Set<EditorialBlock["type"]>(
      editorialFixtures.map((b) => b.type)
    );

    const requiredTypes: EditorialBlock["type"][] = [
      "richtext",
      "heading",
      "image",
      "pullquote",
      "divider",
      "split",
      "gallery",
    ];

    for (const type of requiredTypes) {
      expect(blockTypes.has(type)).toBe(true);
    }
  });

  it("provides valid taxonomy and contributor fixtures", () => {
    expect(taxonomyFixtures.categories.length).toBeGreaterThan(0);
    expect(taxonomyFixtures.tags.length).toBeGreaterThan(0);
    expect(contributorFixtures.length).toBeGreaterThan(0);

    for (const cat of taxonomyFixtures.categories) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.slug).toBeTruthy();
    }

    for (const tag of taxonomyFixtures.tags) {
      expect(tag.id).toBeTruthy();
      expect(tag.name).toBeTruthy();
      expect(tag.slug).toBeTruthy();
    }

    for (const contrib of contributorFixtures) {
      expect(contrib.id).toBeTruthy();
      expect(contrib.name).toBeTruthy();
    }
  });

  it("provides valid media fixtures with local paths", () => {
    expect(mediaFixtures.hero?.url).toBe("/images/placeholder-hero.jpg");
    expect(mediaFixtures.portrait?.url).toBe("/images/placeholder-portrait.jpg");
  });
});
