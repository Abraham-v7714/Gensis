import { describe, it, expect } from "vitest";
import { SanityCmsClient } from "@/lib/cms/providers/sanity";

describe("SanityCmsClient", () => {
  it("returns empty array / null gracefully when Sanity is not configured in environment", async () => {
    const client = new SanityCmsClient();

    const articles = await client.getJournalArticles();
    expect(articles).toEqual([]);

    const article = await client.getJournalArticleBySlug("test-slug");
    expect(article).toBeNull();

    const lookbooks = await client.getLookbooks();
    expect(lookbooks).toEqual([]);

    const lookbook = await client.getLookbookBySlug("test-slug");
    expect(lookbook).toBeNull();

    const about = await client.getAbout();
    expect(about).toBeNull();

    const campaigns = await client.getCampaigns();
    expect(campaigns).toEqual([]);

    const campaign = await client.getCampaignBySlug("test-slug");
    expect(campaign).toBeNull();
  });
});
