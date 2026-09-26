/**
 * SanityPreviewCmsClient — Stage 4.4
 *
 * Implements the GENSIS CmsClient interface using the Sanity PREVIEW client
 * and draft-aware GROQ queries. Used exclusively when Next.js Draft Mode is
 * actively enabled by an authenticated editor via the Presentation Tool.
 *
 * Key differences from SanityCmsClient (production):
 *   - Uses getSanityPreviewClient() → draft-aware, stega-encoded, CDN-bypassed
 *   - Uses preview GROQ queries → no draft exclusion, no status filter
 *   - Single-document methods (getBySlug, getAbout) are fully draft-aware
 *   - Listing methods (getJournalArticles, getLookbooks, getCampaigns) fall back
 *     to published queries intentionally — drafts must not bulk-appear in listings
 *
 * Security contract:
 *   - This class must NEVER be instantiated outside of a server-side context
 *     where draftMode().isEnabled has been confirmed.
 *   - The preview client token (SANITY_API_READ_TOKEN) remains server-side.
 *   - Raw Sanity responses still pass through the same mapper as production.
 *   - Domain models (JournalArticle, Lookbook, etc.) remain provider-neutral.
 *
 * Architecture:
 *   getPreviewCms() → SanityPreviewCmsClient → preview Sanity client
 *                                             → preview GROQ queries
 *                                             → same mapper boundary
 *                                             → GENSIS domain models
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
import { isSanityConfigured } from "./config";
import { getSanityPreviewClient } from "./previewClient";
import { getSanityClient } from "./client";
import {
  // Production queries — used for listing methods to keep them published-only
  journalArticlesQuery,
  lookbooksQuery,
  campaignsQuery,
} from "./queries";
import {
  // Preview queries — used for single-document preview methods
  previewJournalArticleBySlugQuery,
  previewLookbookBySlugQuery,
  previewCampaignBySlugQuery,
  previewAboutPageQuery,
} from "./previewQueries";
import {
  mapSanityJournalArticle,
  mapSanityJournalArticleSummary,
  mapSanityLookbook,
  mapSanityLookbookSummary,
  mapSanityAboutPage,
  mapSanityCampaign,
  mapSanityCampaignSummary,
} from "./mapper";

export class SanityPreviewCmsClient implements CmsClient {
  private previewClient: ReturnType<typeof getSanityPreviewClient> | null = null;
  private productionClient: ReturnType<typeof getSanityClient> | null = null;

  /**
   * Returns the draft-aware preview client for single-document preview queries.
   */
  private getPreviewClient() {
    if (!isSanityConfigured()) {
      return null;
    }
    if (!this.previewClient) {
      try {
        this.previewClient = getSanityPreviewClient();
      } catch {
        // If preview client fails (e.g. missing token), fall back gracefully.
        return null;
      }
    }
    return this.previewClient;
  }

  /**
   * Returns the production client for listing queries.
   * Listing methods intentionally remain published-only — drafts must not
   * bulk-appear in public listing pages even when Draft Mode is enabled.
   */
  private getProductionClient() {
    if (!isSanityConfigured()) {
      return null;
    }
    if (!this.productionClient) {
      this.productionClient = getSanityClient();
    }
    return this.productionClient;
  }

  // ── JOURNAL ──────────────────────────────────────────────────────────────

  /**
   * Listing remains published-only intentionally.
   * Only individual articles are previewable in draft mode.
   */
  async getJournalArticles(options?: JournalQueryOptions): Promise<JournalArticleSummary[]> {
    const client = this.getProductionClient();
    if (!client) return [];

    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const raw = await client.fetch(journalArticlesQuery, { offset, limit });
      if (!Array.isArray(raw)) return [];
      return raw.map(mapSanityJournalArticleSummary);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity Preview] Error fetching journal articles:", err);
      return [];
    }
  }

  /**
   * Draft-aware: returns the document regardless of status (draft, published, archived).
   * With perspective: "previewDrafts" on the client, Sanity returns the draft
   * version when available, falling back to published.
   */
  async getJournalArticleBySlug(slug: string): Promise<JournalArticle | null> {
    const client = this.getPreviewClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        previewJournalArticleBySlugQuery,
        { slug },
        { next: { revalidate: 0 } }
      );
      return mapSanityJournalArticle(raw);
    } catch (err) {
      console.error(`[GENSIS CMS: Sanity Preview] Error fetching preview journal article '${slug}':`, err);
      return null;
    }
  }

  // ── LOOKBOOKS ─────────────────────────────────────────────────────────────

  /**
   * Listing remains published-only intentionally.
   */
  async getLookbooks(options?: LookbookQueryOptions): Promise<LookbookSummary[]> {
    const client = this.getProductionClient();
    if (!client) return [];

    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const raw = await client.fetch(lookbooksQuery, { offset, limit });
      if (!Array.isArray(raw)) return [];
      return raw.map(mapSanityLookbookSummary);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity Preview] Error fetching lookbooks:", err);
      return [];
    }
  }

  /**
   * Draft-aware: returns the lookbook regardless of status.
   */
  async getLookbookBySlug(slug: string): Promise<Lookbook | null> {
    const client = this.getPreviewClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        previewLookbookBySlugQuery,
        { slug },
        { next: { revalidate: 0 } }
      );
      return mapSanityLookbook(raw);
    } catch (err) {
      console.error(`[GENSIS CMS: Sanity Preview] Error fetching preview lookbook '${slug}':`, err);
      return null;
    }
  }

  // ── ABOUT ─────────────────────────────────────────────────────────────────

  /**
   * Draft-aware: returns the About singleton regardless of status.
   */
  async getAbout(): Promise<AboutPage | null> {
    const client = this.getPreviewClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        previewAboutPageQuery,
        {},
        { next: { revalidate: 0 } }
      );
      return mapSanityAboutPage(raw);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity Preview] Error fetching preview About page:", err);
      return null;
    }
  }

  // ── CAMPAIGNS ─────────────────────────────────────────────────────────────

  /**
   * Listing remains published-only intentionally.
   */
  async getCampaigns(options?: CampaignQueryOptions): Promise<CampaignSummary[]> {
    const client = this.getProductionClient();
    if (!client) return [];

    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const raw = await client.fetch(campaignsQuery, { offset, limit });
      if (!Array.isArray(raw)) return [];
      return raw.map(mapSanityCampaignSummary);
    } catch (err) {
      console.error("[GENSIS CMS: Sanity Preview] Error fetching campaigns:", err);
      return [];
    }
  }

  /**
   * Draft-aware: returns the campaign regardless of status.
   */
  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    const client = this.getPreviewClient();
    if (!client) return null;

    try {
      const raw = await client.fetch(
        previewCampaignBySlugQuery,
        { slug },
        { next: { revalidate: 0 } }
      );
      return mapSanityCampaign(raw);
    } catch (err) {
      console.error(`[GENSIS CMS: Sanity Preview] Error fetching preview campaign '${slug}':`, err);
      return null;
    }
  }
}
