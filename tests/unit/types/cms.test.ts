/**
 * CMS Type Architecture Tests
 *
 * These tests verify that the provider-neutral CMS content architecture
 * behaves correctly at the type and structural level.
 *
 * They focus on:
 * - ContentStatus union completeness
 * - EditorialBlock discriminated union narrowing
 * - ContentIdentity structural requirements
 * - JournalArticle normalized structure (no provider coupling)
 * - Reference type isolation
 */

import { describe, it, expect } from "vitest";
import type { ContentStatus, ContentIdentity, MediaAsset, SeoMetadata } from "@/types/cms/content";
import type { EditorialBlock } from "@/types/cms/blocks";
import type { JournalArticle, JournalArticleSummary } from "@/types/cms/journal";

import type { Campaign } from "@/types/cms/campaign";
import type { Category, Tag } from "@/types/cms/taxonomy";
import type { Contributor } from "@/types/cms/contributor";
import type {
  ProductReference,
  CollectionReference,
  JournalReference,
  LookbookReference,
  CampaignReference,
} from "@/types/cms/references";

// ------------------------------------------------------------------
// ContentStatus
// ------------------------------------------------------------------

describe("ContentStatus", () => {
  it("accepts all valid status values", () => {
    const statuses: ContentStatus[] = ["draft", "published", "archived"];
    expect(statuses).toHaveLength(3);
    expect(statuses).toContain("draft");
    expect(statuses).toContain("published");
    expect(statuses).toContain("archived");
  });
});

// ------------------------------------------------------------------
// ContentIdentity
// ------------------------------------------------------------------

describe("ContentIdentity", () => {
  it("can be constructed with all required fields", () => {
    const identity: ContentIdentity = {
      id: "ci_001",
      slug: "test-article",
      title: "Test Article",
      status: "published",
      publishedAt: "2026-09-11T00:00:00Z",
      updatedAt: "2026-09-11T12:00:00Z",
    };
    expect(identity.id).toBe("ci_001");
    expect(identity.slug).toBe("test-article");
    expect(identity.status).toBe("published");
  });

  it("accepts optional description", () => {
    const identity: ContentIdentity = {
      id: "ci_002",
      slug: "test-with-desc",
      title: "Test With Description",
      description: "A short description.",
      status: "draft",
      publishedAt: null,
      updatedAt: "2026-09-11T12:00:00Z",
    };
    expect(identity.description).toBe("A short description.");
    expect(identity.publishedAt).toBeNull();
  });
});

// ------------------------------------------------------------------
// SeoMetadata
// ------------------------------------------------------------------

describe("SeoMetadata", () => {
  it("can be constructed with only required-like fields (all optional)", () => {
    const seo: SeoMetadata = {};
    expect(seo).toBeDefined();
  });

  it("accepts all fields", () => {
    const seo: SeoMetadata = {
      title: "SEO Title",
      description: "SEO Description",
      canonicalUrl: "https://gensis.com/journal/test",
      noIndex: false,
    };
    expect(seo.title).toBe("SEO Title");
    expect(seo.noIndex).toBe(false);
  });
});

// ------------------------------------------------------------------
// MediaAsset
// ------------------------------------------------------------------

describe("MediaAsset", () => {
  it("can be constructed with required fields", () => {
    const asset: MediaAsset = {
      id: "media_001",
      url: "https://cdn.gensis.com/image.jpg",
      alt: "Model wearing GENSIS coat",
    };
    expect(asset.id).toBe("media_001");
    expect(asset.alt).toBe("Model wearing GENSIS coat");
  });

  it("accepts optional fields", () => {
    const asset: MediaAsset = {
      id: "media_002",
      url: "https://cdn.gensis.com/image.jpg",
      alt: "GENSIS Lookbook",
      width: 1200,
      height: 1600,
      caption: "GENSIS Autumn 2026",
      credit: "Photographer Name",
    };
    expect(asset.caption).toBe("GENSIS Autumn 2026");
    expect(asset.credit).toBe("Photographer Name");
  });
});

// ------------------------------------------------------------------
// EditorialBlock — discriminated union narrowing
// ------------------------------------------------------------------

describe("EditorialBlock discriminated union", () => {
  it("narrows correctly to RichTextBlock", () => {
    const block: EditorialBlock = { type: "richtext", html: "<p>Hello</p>" };
    if (block.type === "richtext") {
      expect(block.html).toBe("<p>Hello</p>");
    } else {
      throw new Error("Expected richtext block");
    }
  });

  it("narrows correctly to PullQuoteBlock", () => {
    const block: EditorialBlock = {
      type: "pullquote",
      quote: "Style is a way to say who you are without having to speak.",
      attribution: "GENSIS",
    };
    if (block.type === "pullquote") {
      expect(block.quote).toContain("Style is");
      expect(block.attribution).toBe("GENSIS");
    } else {
      throw new Error("Expected pullquote block");
    }
  });

  it("narrows correctly to ImageBlock", () => {
    const block: EditorialBlock = {
      type: "image",
      asset: { id: "m1", url: "https://cdn.gensis.com/img.jpg", alt: "Test" },
    };
    if (block.type === "image") {
      expect(block.asset.id).toBe("m1");
    } else {
      throw new Error("Expected image block");
    }
  });

  it("narrows correctly to GalleryBlock", () => {
    const block: EditorialBlock = {
      type: "gallery",
      assets: [
        { id: "m1", url: "https://cdn.gensis.com/1.jpg", alt: "One" },
        { id: "m2", url: "https://cdn.gensis.com/2.jpg", alt: "Two" },
      ],
      columns: 2,
    };
    if (block.type === "gallery") {
      expect(block.assets).toHaveLength(2);
      expect(block.columns).toBe(2);
    } else {
      throw new Error("Expected gallery block");
    }
  });

  it("supports all seven block types in a body array", () => {
    const body: EditorialBlock[] = [
      { type: "heading", level: 2, text: "Chapter One" },
      { type: "richtext", html: "<p>Text.</p>" },
      { type: "image", asset: { id: "m1", url: "https://cdn.gensis.com/img.jpg", alt: "Img" } },
      { type: "pullquote", quote: "A quote." },
      { type: "divider" },
      { type: "split", image: { id: "m2", url: "https://cdn.gensis.com/split.jpg", alt: "Split" }, text: "Text" },
      { type: "gallery", assets: [{ id: "m3", url: "https://cdn.gensis.com/g.jpg", alt: "G" }] },
    ];
    expect(body).toHaveLength(7);
    const types = body.map((b) => b.type);
    expect(types).toContain("heading");
    expect(types).toContain("richtext");
    expect(types).toContain("image");
    expect(types).toContain("pullquote");
    expect(types).toContain("divider");
    expect(types).toContain("split");
    expect(types).toContain("gallery");
  });
});

// ------------------------------------------------------------------
// Taxonomy
// ------------------------------------------------------------------

describe("Category", () => {
  it("can be constructed", () => {
    const cat: Category = { id: "cat_1", name: "Culture", slug: "culture" };
    expect(cat.slug).toBe("culture");
  });
});

describe("Tag", () => {
  it("can be constructed", () => {
    const tag: Tag = { id: "tag_1", name: "Minimal", slug: "minimal" };
    expect(tag.slug).toBe("minimal");
  });
});

// ------------------------------------------------------------------
// Contributor
// ------------------------------------------------------------------

describe("Contributor", () => {
  it("can be constructed with required fields", () => {
    const contributor: Contributor = { id: "contrib_1", name: "Jane Doe" };
    expect(contributor.name).toBe("Jane Doe");
  });

  it("accepts optional fields", () => {
    const contributor: Contributor = {
      id: "contrib_2",
      name: "John Smith",
      role: "Creative Director",
      bio: "A brief bio.",
      avatar: { id: "m1", url: "https://cdn.gensis.com/avatar.jpg", alt: "John Smith" },
    };
    expect(contributor.role).toBe("Creative Director");
    expect(contributor.avatar?.id).toBe("m1");
  });
});

// ------------------------------------------------------------------
// Reference types — domain isolation
// ------------------------------------------------------------------

describe("Reference types", () => {
  it("ProductReference contains only id, slug, title", () => {
    const ref: ProductReference = { id: "prod_1", slug: "cashmere-sweater", title: "Cashmere Sweater" };
    expect(Object.keys(ref)).toEqual(["id", "slug", "title"]);
  });

  it("CollectionReference contains only id, slug, title", () => {
    const ref: CollectionReference = { id: "col_1", slug: "autumn-2026", title: "Autumn 2026" };
    expect(Object.keys(ref)).toEqual(["id", "slug", "title"]);
  });

  it("JournalReference contains only id, slug, title", () => {
    const ref: JournalReference = { id: "j_1", slug: "on-craft", title: "On Craft" };
    expect(Object.keys(ref)).toEqual(["id", "slug", "title"]);
  });

  it("LookbookReference contains only id, slug, title", () => {
    const ref: LookbookReference = { id: "lb_1", slug: "autumn-lookbook", title: "Autumn Lookbook" };
    expect(Object.keys(ref)).toEqual(["id", "slug", "title"]);
  });

  it("CampaignReference contains only id, slug, title", () => {
    const ref: CampaignReference = { id: "cam_1", slug: "new-chapter", title: "New Chapter" };
    expect(Object.keys(ref)).toEqual(["id", "slug", "title"]);
  });
});

// ------------------------------------------------------------------
// JournalArticle — structural integrity
// ------------------------------------------------------------------

describe("JournalArticle", () => {
  it("can be constructed with all required fields", () => {
    const article: JournalArticle = {
      id: "art_001",
      slug: "on-craft-and-restraint",
      title: "On Craft and Restraint",
      status: "published",
      publishedAt: "2026-09-01T09:00:00Z",
      updatedAt: "2026-09-05T12:00:00Z",
      excerpt: "A meditation on restraint in fashion design.",
      featuredMedia: { id: "m1", url: "https://cdn.gensis.com/hero.jpg", alt: "Feature Image" },
      body: [{ type: "richtext", html: "<p>Content here.</p>" }],
      author: { id: "c1", name: "Jane Doe" },
      category: { id: "cat_1", name: "Culture", slug: "culture" },
      seo: { title: "On Craft and Restraint — GENSIS Journal" },
    };
    expect(article.slug).toBe("on-craft-and-restraint");
    expect(article.body).toHaveLength(1);
    expect(article.author.name).toBe("Jane Doe");
    expect(article.category.slug).toBe("culture");
  });
});

// ------------------------------------------------------------------
// JournalArticleSummary — listing shape
// ------------------------------------------------------------------

describe("JournalArticleSummary", () => {
  it("does not require body blocks", () => {
    const summary: JournalArticleSummary = {
      id: "art_001",
      slug: "on-craft",
      title: "On Craft",
      status: "published",
      publishedAt: "2026-09-01T09:00:00Z",
      excerpt: "Short excerpt.",
      featuredMedia: { id: "m1", url: "https://cdn.gensis.com/hero.jpg", alt: "Hero" },
      author: { id: "c1", name: "Jane Doe" },
      category: { id: "cat_1", name: "Culture", slug: "culture" },
    };
    // body is not in the type — TypeScript enforces this
    expect(summary).not.toHaveProperty("body");
  });
});

// ------------------------------------------------------------------
// Campaign — commerce reference isolation
// ------------------------------------------------------------------

describe("Campaign", () => {
  it("references products as lightweight stubs, not full Product objects", () => {
    const campaign: Campaign = {
      id: "cam_001",
      slug: "new-chapter",
      title: "New Chapter",
      status: "published",
      publishedAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
      heroMedia: { id: "m1", url: "https://cdn.gensis.com/hero.jpg", alt: "Campaign Hero" },
      body: [],
      products: [{ id: "prod_1", slug: "cashmere-coat", title: "Cashmere Coat" }],
      collections: [{ id: "col_1", slug: "autumn-2026", title: "Autumn 2026" }],
      seo: {},
    };
    // Products are stubs — only id, slug, title
    expect(campaign.products?.[0]).toEqual({ id: "prod_1", slug: "cashmere-coat", title: "Cashmere Coat" });
    // No full product fields like price, variants, images
    expect(campaign.products?.[0]).not.toHaveProperty("price");
    expect(campaign.products?.[0]).not.toHaveProperty("variants");
  });
});
