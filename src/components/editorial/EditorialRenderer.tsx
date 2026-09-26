/**
 * EditorialRenderer
 *
 * Provider-neutral renderer for normalized EditorialBlock[] content.
 *
 * Architecture:
 *   CMS Provider → Adapter → GENSIS EditorialBlock[] → EditorialRenderer → Editorial Components
 *
 * Rules:
 * - Accepts normalized content only. Never calls CMS methods directly.
 * - Maps each block type to the appropriate existing GENSIS presentation component.
 * - Exhaustive switch ensures TypeScript catches unhandled blocks at compile time.
 * - Remains a Server Component — no "use client" directive.
 * - Does not render raw HTML (no dangerouslySetInnerHTML).
 * - Does not know about any CMS provider.
 */

import * as React from "react";
import type { EditorialBlock } from "@/types/cms/blocks";
import { EditorialImage } from "./EditorialImage";
import { EditorialGrid } from "./EditorialGrid";
import { EditorialSplit } from "./EditorialSplit";
import { PullQuote } from "./PullQuote";

// ------------------------------------------------------------------
// PROPS
// ------------------------------------------------------------------

export type EditorialRendererProps = {
  /** Normalized content blocks from the GENSIS CMS layer. */
  blocks: EditorialBlock[];
  /** Optional className applied to the outer container. */
  className?: string;
};

// ------------------------------------------------------------------
// HEADING — renders levels 1–6 semantically
// ------------------------------------------------------------------

const headingClassByLevel: Record<number, string> = {
  1: "font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-[var(--color-fg-primary)]",
  2: "font-serif text-[length:var(--text-headline)] leading-[var(--leading-headline)] tracking-[var(--tracking-headline)] text-[var(--color-fg-primary)]",
  3: "font-serif text-[length:var(--text-title)] leading-[var(--leading-title)] tracking-[var(--tracking-title)] text-[var(--color-fg-primary)]",
  4: "font-serif text-[length:var(--text-title)] leading-[var(--leading-title)] tracking-[var(--tracking-title)] text-[var(--color-fg-secondary)]",
  5: "font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] text-[var(--color-fg-secondary)] uppercase",
  6: "font-sans text-[length:var(--text-small)] leading-[var(--leading-small)] tracking-[var(--tracking-label)] text-[var(--color-fg-muted)] uppercase",
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

function renderHeading(level: HeadingLevel, text: string): React.ReactElement {
  const className = headingClassByLevel[level];
  // Use createElement to dynamically set semantic heading level without unsafe casting.
  return React.createElement(`h${level}`, { className }, text);
}

// ------------------------------------------------------------------
// RICH TEXT — renders plain text safely, no dangerouslySetInnerHTML
// ------------------------------------------------------------------
//
// Limitation: The current RichTextBlock.html field contains a sanitized
// HTML string from a CMS rich-text editor. Rather than rendering raw HTML
// (which would require dangerouslySetInnerHTML or a third-party parser),
// we display it as styled plain text.
//
// When a provider is wired and a safe rich-text-to-React parser is
// introduced (e.g., using the provider SDK's own renderer or html-react-parser
// with strict allowlist), this block renderer should be updated at that time.
// The EditorialBlock type itself does not need to change.
//
function RichTextRenderer({ html }: { html: string }) {
  // Strip HTML tags to extract text content safely.
  // This preserves whitespace-significant paragraph breaks via <br/> or newlines.
  const plainText = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  // Render each paragraph segment as a <p> element.
  const paragraphs = plainText
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)] max-w-2xl flex flex-col gap-[var(--spacing-4)]">
      {paragraphs.map((para, i) => (
        // Key is derived from index — order is stable at render time.
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
// BLOCK RENDERER — single block → React element
// ------------------------------------------------------------------

function assertNever(value: never): never {
  throw new Error(`Unhandled editorial block type: ${String(value)}`);
}

/**
 * Renders a single EditorialBlock using the appropriate GENSIS component.
 *
 * The switch is intentionally exhaustive: the `assertNever` branch at the end
 * causes a TypeScript compile-time error if a new block type is added
 * to the EditorialBlock union without a corresponding case here.
 */
function renderBlock(block: EditorialBlock, index: number): React.ReactElement | null {
  switch (block.type) {
    case "richtext":
      return (
        <div key={index} role="group" aria-label="Rich text content">
          <RichTextRenderer html={block.html} />
        </div>
      );

    case "heading":
      return (
        <div key={index}>
          {renderHeading(block.level, block.text)}
        </div>
      );

    case "image": {
      const caption = block.caption ?? block.asset.caption;
      return (
        <figure key={index}>
          <EditorialImage
            src={block.asset.url}
            alt={block.asset.alt}
          />
          {caption && (
            <figcaption className="font-sans text-[length:var(--text-caption)] leading-[var(--leading-caption)] tracking-[var(--tracking-caption)] text-[var(--color-fg-muted)] mt-[var(--spacing-2)]">
              {caption}
              {block.asset.credit && (
                <span className="ml-[var(--spacing-2)] opacity-70">
                  © {block.asset.credit}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );
    }

    case "pullquote":
      return (
        <PullQuote
          key={index}
          quote={block.quote}
          attribution={block.attribution}
        />
      );

    case "divider":
      return (
        <hr
          key={index}
          className="border-t border-[var(--color-border-subtle)] my-[var(--spacing-8)]"
          aria-hidden="true"
        />
      );

    case "split":
      return (
        <EditorialSplit
          key={index}
          imagePosition={block.imagePosition ?? "left"}
          image={
            <EditorialImage
              src={block.image.url}
              alt={block.image.alt}
              aspectRatio="portrait"
            />
          }
          content={
            <p className="font-sans text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-fg-secondary)]">
              {block.text}
            </p>
          }
        />
      );

    case "gallery":
      return (
        <EditorialGrid key={index} columns={block.columns ?? 2}>
          {block.assets.map((asset) => (
            <EditorialImage
              key={asset.id}
              src={asset.url}
              alt={asset.alt}
              aspectRatio="portrait"
            />
          ))}
        </EditorialGrid>
      );

    default:
      return assertNever(block);
  }
}

// ------------------------------------------------------------------
// EDITORIAL RENDERER
// ------------------------------------------------------------------

/**
 * EditorialRenderer — renders an ordered list of EditorialBlock[].
 *
 * Usage:
 *   <EditorialRenderer blocks={article.body} />
 *
 * Do not pass CMS-specific data to this component.
 * The renderer only understands normalized GENSIS EditorialBlock[].
 */
export function EditorialRenderer({ blocks, className = "" }: EditorialRendererProps) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-[var(--spacing-8)] ${className}`}
    >
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
