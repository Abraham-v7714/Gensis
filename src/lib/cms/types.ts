/**
 * CMS Client Interface — Port Definition
 *
 * Provider-neutral capability interface for the GENSIS CMS layer.
 *
 * Architecture:
 *   CMS Provider  →  Adapter/Mapper  →  CmsClient implementation  →  Application
 *
 * Rules:
 * - This interface uses GENSIS domain types only.
 * - No CMS provider SDK types appear here.
 * - No provider-specific IDs or response shapes leak into method signatures.
 * - All methods are async and return domain model types.
 *
 * Current status:
 *   NO provider is implemented. This interface defines the contract that
 *   a future provider adapter must fulfill. Attempting to call these methods
 *   will throw NotImplementedError until an implementation is registered.
 *
 * Future implementation pattern:
 *   src/lib/cms/providers/sanity.ts   — implements CmsClient using Sanity SDK
 *   src/lib/cms/providers/contentful.ts — implements CmsClient using Contentful SDK
 *
 * The active provider is selected in src/lib/cms/index.ts without changing
 * any application or UI code.
 */

import type { JournalArticle, JournalArticleSummary } from "@/types/cms/journal";
import type { Lookbook, LookbookSummary } from "@/types/cms/lookbook";
import type { AboutPage } from "@/types/cms/about";
import type { Campaign, CampaignSummary } from "@/types/cms/campaign";

// ------------------------------------------------------------------
// QUERY OPTIONS
// ------------------------------------------------------------------

/** Common pagination options for list queries. */
export type ListOptions = {
  /** Maximum number of items to return. */
  limit?: number;
  /** Offset for pagination. */
  offset?: number;
};

/** Filter options for journal article queries. */
export type JournalQueryOptions = ListOptions & {
  /** Filter by category slug. */
  category?: string;
  /** Filter by tag slug. */
  tag?: string;
};

/** Filter options for campaign queries. */
export type CampaignQueryOptions = ListOptions;

/** Filter options for lookbook queries. */
export type LookbookQueryOptions = ListOptions & {
  /** Filter by season label (e.g., "Autumn 2026"). */
  season?: string;
};

// ------------------------------------------------------------------
// CMS CLIENT INTERFACE
// ------------------------------------------------------------------

/**
 * The provider-neutral CMS client interface.
 *
 * Any CMS provider adapter must implement this interface.
 * Application code depends only on this interface — never on a specific provider.
 */
export interface CmsClient {
  // -- Journal --

  /**
   * Fetch a list of published journal articles.
   * Returns summary objects suitable for listing pages.
   */
  getJournalArticles(options?: JournalQueryOptions): Promise<JournalArticleSummary[]>;

  /**
   * Fetch a single journal article by its slug.
   * Returns the full article including body blocks.
   * Returns null if no published article with that slug exists.
   */
  getJournalArticleBySlug(slug: string): Promise<JournalArticle | null>;

  // -- Lookbooks --

  /**
   * Fetch a list of published lookbooks.
   * Returns summary objects suitable for listing pages.
   */
  getLookbooks(options?: LookbookQueryOptions): Promise<LookbookSummary[]>;

  /**
   * Fetch a single lookbook by its slug.
   * Returns the full lookbook including all items.
   * Returns null if no published lookbook with that slug exists.
   */
  getLookbookBySlug(slug: string): Promise<Lookbook | null>;

  // -- About --

  /**
   * Fetch the singleton About page content.
   * Returns null if the About page has not been published yet.
   */
  getAbout(): Promise<AboutPage | null>;

  // -- Campaigns --

  /**
   * Fetch a list of published editorial campaigns.
   * Returns summary objects suitable for listing pages.
   */
  getCampaigns(options?: CampaignQueryOptions): Promise<CampaignSummary[]>;

  /**
   * Fetch a single campaign by its slug.
   * Returns the full campaign including body blocks and commerce references.
   * Returns null if no published campaign with that slug exists.
   */
  getCampaignBySlug(slug: string): Promise<Campaign | null>;
}
