/**
 * EditorialRenderer Tests
 *
 * Verifies observable rendering behavior for all 7 block types.
 * Tests focus on semantic output and component delegation,
 * not internal implementation details.
 */

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EditorialRenderer } from "@/components/editorial/EditorialRenderer";
import type { EditorialBlock } from "@/types/cms/blocks";
import type { MediaAsset } from "@/types/cms/content";

// ---------------------------------------------------------------------------
// Test fixtures — minimal, clearly placeholder values
// ---------------------------------------------------------------------------

const testAsset: MediaAsset = {
  id: "asset_test_1",
  url: "https://example.com/test-image.jpg",
  alt: "Test editorial image",
  width: 800,
  height: 1000,
};

const testAsset2: MediaAsset = {
  id: "asset_test_2",
  url: "https://example.com/test-image-2.jpg",
  alt: "Second test image",
};

// ---------------------------------------------------------------------------
// Empty block array
// ---------------------------------------------------------------------------

describe("EditorialRenderer — empty blocks", () => {
  it("renders nothing when blocks array is empty", () => {
    const { container } = render(<EditorialRenderer blocks={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// RichTextBlock
// ---------------------------------------------------------------------------

describe("EditorialRenderer — richtext block", () => {
  it("renders text content from sanitized html", () => {
    const blocks: EditorialBlock[] = [
      { type: "richtext", html: "<p>The art of restraint defines great fashion.</p>" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByText("The art of restraint defines great fashion.")).toBeInTheDocument();
  });

  it("renders multiple paragraph segments", () => {
    const blocks: EditorialBlock[] = [
      { type: "richtext", html: "<p>First paragraph.</p><p>Second paragraph.</p>" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
  });

  it("does not render raw html tags as text", () => {
    const blocks: EditorialBlock[] = [
      { type: "richtext", html: "<p>Clean content.</p>" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    // Should not see "<p>" as visible text content
    expect(screen.queryByText(/<p>/)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// HeadingBlock
// ---------------------------------------------------------------------------

describe("EditorialRenderer — heading block", () => {
  it("renders h1 with correct text", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 1, text: "The Collection" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("heading", { level: 1, name: "The Collection" })).toBeInTheDocument();
  });

  it("renders h2 with correct text", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 2, text: "Section Title" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("heading", { level: 2, name: "Section Title" })).toBeInTheDocument();
  });

  it("renders h3 with correct text", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 3, text: "Subsection" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("heading", { level: 3, name: "Subsection" })).toBeInTheDocument();
  });

  it("renders h4 with correct text", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 4, text: "Detail" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("heading", { level: 4, name: "Detail" })).toBeInTheDocument();
  });

  it("renders h5 semantically", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 5, text: "Fine Print" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("heading", { level: 5, name: "Fine Print" })).toBeInTheDocument();
  });

  it("renders h6 semantically", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 6, text: "Footnote" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("heading", { level: 6, name: "Footnote" })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ImageBlock
// ---------------------------------------------------------------------------

describe("EditorialRenderer — image block", () => {
  it("renders an image with the correct alt text", () => {
    const blocks: EditorialBlock[] = [
      { type: "image", asset: testAsset },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("img", { name: "Test editorial image" })).toBeInTheDocument();
  });

  it("renders the block-level caption when provided", () => {
    const blocks: EditorialBlock[] = [
      { type: "image", asset: testAsset, caption: "Campaign Autumn 2026" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByText("Campaign Autumn 2026")).toBeInTheDocument();
  });

  it("falls back to asset.caption when block caption is absent", () => {
    const assetWithCaption: MediaAsset = { ...testAsset, caption: "Asset level caption" };
    const blocks: EditorialBlock[] = [
      { type: "image", asset: assetWithCaption },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByText("Asset level caption")).toBeInTheDocument();
  });

  it("renders the image inside a figure element", () => {
    const blocks: EditorialBlock[] = [
      { type: "image", asset: testAsset },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    const figure = document.querySelector("figure");
    expect(figure).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PullQuoteBlock → PullQuote
// ---------------------------------------------------------------------------

describe("EditorialRenderer — pullquote block", () => {
  it("renders the pull quote text", () => {
    const blocks: EditorialBlock[] = [
      { type: "pullquote", quote: "Style is a language without words." },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("figure")).toBeInTheDocument();
    const blockquote = document.querySelector("blockquote");
    expect(blockquote?.textContent).toContain("Style is a language without words.");
  });

  it("renders attribution when provided", () => {
    const blocks: EditorialBlock[] = [
      { type: "pullquote", quote: "A quote.", attribution: "Creative Director" },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByText(/Creative Director/i)).toBeInTheDocument();
  });

  it("omits figcaption when attribution is absent", () => {
    const blocks: EditorialBlock[] = [
      { type: "pullquote", quote: "A quote." },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(document.querySelector("figcaption")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DividerBlock
// ---------------------------------------------------------------------------

describe("EditorialRenderer — divider block", () => {
  it("renders a semantic hr element", () => {
    const blocks: EditorialBlock[] = [{ type: "divider" }];
    render(<EditorialRenderer blocks={blocks} />);
    const hr = document.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });

  it("marks the hr as aria-hidden", () => {
    const blocks: EditorialBlock[] = [{ type: "divider" }];
    render(<EditorialRenderer blocks={blocks} />);
    const hr = document.querySelector("hr");
    expect(hr).toHaveAttribute("aria-hidden", "true");
  });
});

// ---------------------------------------------------------------------------
// SplitBlock → EditorialSplit + EditorialImage
// ---------------------------------------------------------------------------

describe("EditorialRenderer — split block", () => {
  it("renders the split image with correct alt text", () => {
    const blocks: EditorialBlock[] = [
      { type: "split", image: testAsset, text: "A side-by-side story." },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("img", { name: "Test editorial image" })).toBeInTheDocument();
  });

  it("renders the split text content", () => {
    const blocks: EditorialBlock[] = [
      { type: "split", image: testAsset, text: "A side-by-side story." },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByText("A side-by-side story.")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// GalleryBlock → EditorialGrid + EditorialImage
// ---------------------------------------------------------------------------

describe("EditorialRenderer — gallery block", () => {
  it("renders all images in the gallery", () => {
    const blocks: EditorialBlock[] = [
      { type: "gallery", assets: [testAsset, testAsset2] },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    expect(screen.getByRole("img", { name: "Test editorial image" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Second test image" })).toBeInTheDocument();
  });

  it("renders the correct number of images", () => {
    const blocks: EditorialBlock[] = [
      { type: "gallery", assets: [testAsset, testAsset2] },
    ];
    render(<EditorialRenderer blocks={blocks} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Block ordering
// ---------------------------------------------------------------------------

describe("EditorialRenderer — block ordering", () => {
  it("renders blocks in the order they are provided", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 2, text: "First Heading" },
      { type: "richtext", html: "<p>First rich text block.</p>" },
      { type: "pullquote", quote: "Middle pullquote." },
    ];
    render(<EditorialRenderer blocks={blocks} />);

    const heading = screen.getByRole("heading", { name: "First Heading" });
    const text = screen.getByText("First rich text block.");
    const blockquote = document.querySelector("blockquote");

    // All three should be present
    expect(heading).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(blockquote?.textContent).toContain("Middle pullquote.");

    // DOM order: heading should appear before text in the DOM
    expect(
      heading.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Mixed block array
// ---------------------------------------------------------------------------

describe("EditorialRenderer — mixed block array", () => {
  it("renders all 7 block types in a single pass without crashing", () => {
    const blocks: EditorialBlock[] = [
      { type: "heading", level: 2, text: "Test Heading" },
      { type: "richtext", html: "<p>Test paragraph.</p>" },
      { type: "image", asset: testAsset },
      { type: "pullquote", quote: "Test quote." },
      { type: "divider" },
      { type: "split", image: testAsset2, text: "Test split text." },
      { type: "gallery", assets: [testAsset] },
    ];

    render(<EditorialRenderer blocks={blocks} />);

    expect(screen.getByRole("heading", { name: "Test Heading" })).toBeInTheDocument();
    expect(screen.getByText("Test paragraph.")).toBeInTheDocument();
    // Two images: one from image block and one from gallery (split uses testAsset2)
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(2);
    const blockquote = document.querySelector("blockquote");
    expect(blockquote?.textContent).toContain("Test quote.");
    expect(document.querySelector("hr")).toBeInTheDocument();
    expect(screen.getByText("Test split text.")).toBeInTheDocument();
  });
});
