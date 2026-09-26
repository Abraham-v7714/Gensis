/**
 * CMS Types — Public Entry Point
 *
 * Re-exports all provider-neutral CMS domain types.
 *
 * Import from this entry point in application code:
 *   import type { JournalArticle, MediaAsset } from "@/types/cms";
 *
 * Do NOT import directly from sub-modules unless you specifically need
 * to avoid importing the full barrel (e.g., inside types/cms/* itself
 * to prevent circular dependencies).
 */

// Content primitives
export type {
  ContentStatus,
  ContentIdentity,
  SeoMetadata,
  MediaAsset,
} from "./content";

// Structured editorial blocks
export type {
  EditorialBlock,
  RichTextBlock,
  HeadingBlock,
  ImageBlock,
  PullQuoteBlock,
  DividerBlock,
  SplitBlock,
  GalleryBlock,
} from "./blocks";

// Taxonomy
export type { Category, Tag } from "./taxonomy";

// Contributors
export type { Contributor } from "./contributor";

// Cross-content references
export type {
  ProductReference,
  CollectionReference,
  JournalReference,
  LookbookReference,
  CampaignReference,
} from "./references";

// Content models
export type { JournalArticle, JournalArticleSummary } from "./journal";
export type { Lookbook, LookbookItem, LookbookSummary } from "./lookbook";
export type { AboutPage } from "./about";
export type { Campaign, CampaignSummary } from "./campaign";
