/**
 * Structured Editorial Content Blocks
 *
 * Provider-neutral building blocks for editorial body content.
 * These types describe *content data*, not presentation.
 *
 * Rules:
 * - No Tailwind CSS classes inside block types.
 * - No React component references inside block types.
 * - No CMS provider SDK types.
 *
 * The React editorial components (EditorialImage, EditorialText, etc.)
 * are responsible for rendering these blocks — not the blocks themselves.
 *
 * Intentionally minimal. Do NOT expand into a full page-builder system.
 */

import type { MediaAsset } from "./content";

// ------------------------------------------------------------------
// INDIVIDUAL BLOCK TYPES
// ------------------------------------------------------------------

/**
 * Rich text / long-form paragraph content.
 * The `html` field holds sanitized HTML output from a CMS rich-text editor.
 * Sanitization must happen at the adapter layer before reaching the UI.
 */
export type RichTextBlock = {
  type: "richtext";
  /** Sanitized HTML string. */
  html: string;
};

/**
 * Standalone editorial heading.
 */
export type HeadingBlock = {
  type: "heading";
  /** Heading level — maps to h1–h6 in the presentation layer. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

/**
 * Full-width or inline editorial image.
 */
export type ImageBlock = {
  type: "image";
  asset: MediaAsset;
  /** Optional override caption. Falls back to asset.caption if absent. */
  caption?: string;
};

/**
 * Editorial pull quote with optional attribution.
 * Maps to the PullQuote component at the presentation layer.
 */
export type PullQuoteBlock = {
  type: "pullquote";
  quote: string;
  attribution?: string;
};

/**
 * Visual section divider / spacer.
 */
export type DividerBlock = {
  type: "divider";
};

/**
 * Side-by-side image and text content.
 * Maps to the EditorialSplit component at the presentation layer.
 */
export type SplitBlock = {
  type: "split";
  image: MediaAsset;
  /** Short editorial text accompanying the image. May be plain text or brief HTML. */
  text: string;
  imagePosition?: "left" | "right";
};

/**
 * A grid of editorial images.
 * Maps to the EditorialGrid component at the presentation layer.
 */
export type GalleryBlock = {
  type: "gallery";
  assets: MediaAsset[];
  columns?: 2 | 3 | 4;
};

// ------------------------------------------------------------------
// DISCRIMINATED UNION
// ------------------------------------------------------------------

/**
 * Union of all supported editorial block types.
 * Use the `type` discriminant to narrow at the presentation layer.
 *
 * Example:
 *   switch (block.type) {
 *     case "richtext": return <RichText html={block.html} />;
 *     case "pullquote": return <PullQuote quote={block.quote} />;
 *     ...
 *   }
 */
export type EditorialBlock =
  | RichTextBlock
  | HeadingBlock
  | ImageBlock
  | PullQuoteBlock
  | DividerBlock
  | SplitBlock
  | GalleryBlock;
