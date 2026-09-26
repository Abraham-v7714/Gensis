/**
 * Sanity Schema Registry — Stage 4.1
 *
 * Central registry for all GENSIS Sanity document and object schemas.
 * This is the single source of truth for schema registration.
 *
 * Architecture:
 *   - Documents  : content types that create individual records in Content Lake
 *   - Objects    : reusable embedded sub-structures
 *
 * Provider boundary:
 *   This file and all schemas it imports are strictly inside
 *   src/lib/cms/providers/sanity/. Nothing here must be imported
 *   by @/types/cms, @/components, @/features, or src/app routes.
 *
 * GROQ / mapper compatibility:
 *   All schema field names match the GENSIS GROQ queries (queries.ts)
 *   and the Sanity response mapper (mapper.ts). Do not rename fields
 *   without updating queries.ts and mapper.ts accordingly.
 */

// ----------------------------------------------------------------
// Document Schemas
// ----------------------------------------------------------------
export { journalArticleSchema } from "./documents/journalArticle";
export { lookbookSchema } from "./documents/lookbook";
export { campaignSchema } from "./documents/campaign";
export { aboutPageSchema } from "./documents/aboutPage";
export { categorySchema } from "./documents/category";
export { tagSchema } from "./documents/tag";
export { contributorSchema } from "./documents/contributor";

// ----------------------------------------------------------------
// Object Schemas — Reusable Structures
// ----------------------------------------------------------------
export { seoSchema } from "./objects/seo";
export { mediaAssetSchema } from "./objects/mediaAsset";
export { lookbookItemSchema } from "./objects/lookbookItem";
export { productReferenceSchema, collectionReferenceSchema } from "./objects/references";

// ----------------------------------------------------------------
// Editorial Block Object Schemas (7 types)
// ----------------------------------------------------------------
export { blockRichtextSchema } from "./objects/blockRichtext";
export { blockHeadingSchema } from "./objects/blockHeading";
export { blockImageSchema } from "./objects/blockImage";
export { blockPullquoteSchema } from "./objects/blockPullquote";
export { blockDividerSchema } from "./objects/blockDivider";
export { blockSplitSchema } from "./objects/blockSplit";
export { blockGallerySchema } from "./objects/blockGallery";

// ----------------------------------------------------------------
// Schema Type Registry Array
// Used by Sanity Studio config to register all schemas.
// ----------------------------------------------------------------
import { journalArticleSchema } from "./documents/journalArticle";
import { lookbookSchema } from "./documents/lookbook";
import { campaignSchema } from "./documents/campaign";
import { aboutPageSchema } from "./documents/aboutPage";
import { categorySchema } from "./documents/category";
import { tagSchema } from "./documents/tag";
import { contributorSchema } from "./documents/contributor";
import { seoSchema } from "./objects/seo";
import { mediaAssetSchema } from "./objects/mediaAsset";
import { lookbookItemSchema } from "./objects/lookbookItem";
import { productReferenceSchema, collectionReferenceSchema } from "./objects/references";
import { blockRichtextSchema } from "./objects/blockRichtext";
import { blockHeadingSchema } from "./objects/blockHeading";
import { blockImageSchema } from "./objects/blockImage";
import { blockPullquoteSchema } from "./objects/blockPullquote";
import { blockDividerSchema } from "./objects/blockDivider";
import { blockSplitSchema } from "./objects/blockSplit";
import { blockGallerySchema } from "./objects/blockGallery";

/**
 * All schema types registered with Sanity Studio.
 * Pass this array to `schema.types` in the Studio config.
 */
export const schemaTypes = [
  // Documents
  journalArticleSchema,
  lookbookSchema,
  campaignSchema,
  aboutPageSchema,
  categorySchema,
  tagSchema,
  contributorSchema,
  // Reusable Objects
  seoSchema,
  mediaAssetSchema,
  lookbookItemSchema,
  productReferenceSchema,
  collectionReferenceSchema,
  // Editorial Block Objects
  blockRichtextSchema,
  blockHeadingSchema,
  blockImageSchema,
  blockPullquoteSchema,
  blockDividerSchema,
  blockSplitSchema,
  blockGallerySchema,
];

// ----------------------------------------------------------------
// Stable Schema Name Constants (preserved from Stage 4.0)
// Used by GROQ queries and mapper to reference _type strings.
// ----------------------------------------------------------------

/** Sanity document type machine names */
export const SANITY_DOCUMENT_TYPES = {
  JOURNAL_ARTICLE: "journalArticle",
  LOOKBOOK: "lookbook",
  CAMPAIGN: "campaign",
  ABOUT_PAGE: "aboutPage",
  CONTRIBUTOR: "contributor",
  CATEGORY: "category",
  TAG: "tag",
} as const;

/** Sanity editorial block object type machine names */
export const SANITY_BLOCK_TYPES = {
  RICHTEXT: "blockRichtext",
  HEADING: "blockHeading",
  IMAGE: "blockImage",
  PULLQUOTE: "blockPullquote",
  DIVIDER: "blockDivider",
  SPLIT: "blockSplit",
  GALLERY: "blockGallery",
} as const;
