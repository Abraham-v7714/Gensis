/**
 * Sanity Seed Data Tests
 * Stage 4.3 - Real Editorial Data Validation
 */

import { describe, it, expect } from "vitest";
import {
  allSeedDocuments,
  journalArticles,
  lookbooks,
  campaigns,
  aboutSingleton,
  categories,
  tags,
  contributors,
} from "@/../scripts/sanity-seed-data";
import { SANITY_DOCUMENT_TYPES } from "@/lib/cms/providers/sanity/schemas";

describe("Sanity Seed Dataset", () => {
  it("contains deterministic IDs", () => {
    // Exclude about-singleton as it has a specific canonical ID
    const standardDocs = allSeedDocuments.filter((doc) => doc._id !== "about-singleton");
    for (const doc of standardDocs) {
      expect(doc._id).toMatch(/^(seed-|drafts\.seed-)/);
    }
  });

  it("contains 3 published and 1 draft Journal Article", () => {
    const published = journalArticles.filter((a) => a.status === "published");
    const drafts = journalArticles.filter((a) => a.status === "draft");

    expect(journalArticles.length).toBe(4);
    expect(published.length).toBe(3);
    expect(drafts.length).toBe(1);

    expect(drafts[0]._id).toMatch(/^drafts\./);
  });

  it("contains 2 published Lookbooks", () => {
    expect(lookbooks.length).toBe(2);
    for (const lb of lookbooks) {
      expect(lb.status).toBe("published");
      expect(lb._type).toBe(SANITY_DOCUMENT_TYPES.LOOKBOOK);
    }
  });

  it("contains 2 published Campaigns", () => {
    expect(campaigns.length).toBe(2);
    for (const campaign of campaigns) {
      expect(campaign.status).toBe("published");
      expect(campaign._type).toBe(SANITY_DOCUMENT_TYPES.CAMPAIGN);
    }
  });

  it("contains the About singleton", () => {
    expect(aboutSingleton._id).toBe("about-singleton");
    expect(aboutSingleton._type).toBe(SANITY_DOCUMENT_TYPES.ABOUT_PAGE);
    expect(aboutSingleton.status).toBe("published");
  });

  it("contains expected taxonomies and contributors", () => {
    expect(categories.length).toBe(3);
    expect(tags.length).toBe(4);
    expect(contributors.length).toBe(2);
  });
});
