/**
 * SanityCmsClient Implementation
 *
 * Implements the GENSIS CmsClient interface using the Sanity client,
 * GROQ queries, and Sanity response mapper.
 *
 * Rules:
 * - Implements CmsClient contract.
 * - Handles errors gracefully: if Sanity is not configured or queries fail, returns null/empty array.
 * - Returns normalized provider-neutral GENSIS domain models.
 * - Production reads are tagged with deterministic Next.js cache tags for on-demand revalidation.
 */

import type {
  CmsClient,
  JournalQueryOptions,
  LookbookQueryOptions,
  CampaignQueryOptions,
} from "../../types";
import type { JournalArticle, JournalArticleSummary } from "@/types/cms/journal";
import type { Lookbook, LookbookSummary } from "@/types/cms/lookbook";
import type { AboutPage } from "@/types/cms/about";
import type { Campaign, CampaignSummary } from "@/types/cms/campaign";
import { CMS_TAGS } from "../../tags";
import { isSanityConfigured } from "./config";
import { getSanityClient } from "./client";
import {
  journalArticlesQuery,
  journalArticleBySlugQuery,
  lookbooksQuery,
  lookbookBySlugQuery,
  aboutPageQuery,
  campaignsQuery,
  campaignBySlugQuery,
} from "./queries";
import {
  mapSanityJournalArticle,
  mapSanityJournalArticleSummary,
  mapSanityLookbook,
  mapSanityLookbookSummary,
  mapSanityAboutPage,
  mapSanityCampaign,
  mapSanityCampaignSummary,
} from "./mapper";

export class SanityCmsClient implements CmsClient {
  private client: ReturnType<typeof getSanityClient> | null = null;

  private getClient() {
    if (!isSanityConfigured()) {
      return null;
    }
    if (!this.client) {
      this.client = getSanityClient();
    }
    return this.client;
  }

  async getJournalArticles(options?: JournalQueryOptions): Promise<JournalArticleSummary[]> {
    const client = this.getClient();
    if (!client) return [];

    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const raw = await client.fetch(
        journalArticlesQuery,
        { offset, limit },
        { next: { tags: [CMS_TAGS.journalCollection()] } }
      );
      if (!Array.isArray(raw)) return [];
      return raw.map(mapSanityJournalArticleSummary);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity] Error fetching journal articles:", err);
      return [];
    }
  }

  async getJournalArticleBySlug(slug: string): Promise<JournalArticle | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        journalArticleBySlugQuery,
        { slug },
        { next: { tags: [CMS_TAGS.journalCollection(), CMS_TAGS.journalArticle(slug)] } }
      );
      return mapSanityJournalArticle(raw);
    } catch (err) {
      console.error(`[GENSIS CMS: Sanity] Error fetching journal article '${slug}':`, err);
      return null;
    }
  }

  async getLookbooks(options?: LookbookQueryOptions): Promise<LookbookSummary[]> {
    const client = this.getClient();
    if (!client) return [];

    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const raw = await client.fetch(
        lookbooksQuery,
        { offset, limit },
        { next: { tags: [CMS_TAGS.lookbookCollection()] } }
      );
      if (!Array.isArray(raw)) return [];
      return raw.map(mapSanityLookbookSummary);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity] Error fetching lookbooks:", err);
      return [];
    }
  }

  async getLookbookBySlug(slug: string): Promise<Lookbook | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        lookbookBySlugQuery,
        { slug },
        { next: { tags: [CMS_TAGS.lookbookCollection(), CMS_TAGS.lookbookItem(slug)] } }
      );
      return mapSanityLookbook(raw);
    } catch (err) {
      console.error(`[GENSIS CMS: Sanity] Error fetching lookbook '${slug}':`, err);
      return null;
    }
  }

  async getAbout(): Promise<AboutPage | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        aboutPageQuery,
        {},
        { next: { tags: [CMS_TAGS.about()] } }
      );
      return mapSanityAboutPage(raw);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity] Error fetching About page:", err);
      return null;
    }
  }

  async getCampaigns(options?: CampaignQueryOptions): Promise<CampaignSummary[]> {
    const client = this.getClient();
    if (!client) return [];

    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const raw = await client.fetch(
        campaignsQuery,
        { offset, limit },
        { next: { tags: [CMS_TAGS.campaignCollection()] } }
      );
      if (!Array.isArray(raw)) return [];
      return raw.map(mapSanityCampaignSummary);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity] Error fetching campaigns:", err);
      return [];
    }
  }

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        campaignBySlugQuery,
        { slug },
        { next: { tags: [CMS_TAGS.campaignCollection(), CMS_TAGS.campaignItem(slug)] } }
      );
      return mapSanityCampaign(raw);
    } catch (err) {
      console.error(`[GENSIS CMS: Sanity] Error fetching campaign '${slug}':`, err);
      return null;
    }
  }
}
