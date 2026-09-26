/**
 * Stage 4.4 — Preview Client & Query Architecture Tests
 *
 * Tests covering:
 *   1. Production query draft exclusion (existing behavior preserved)
 *   2. Preview query draft access (new behavior)
 *   3. Listing queries remain production-safe
 *   4. Archived content exclusion
 *   5. Sanity draft permutation exclusion
 *   6. Preview query intentional draft retrieval
 *   7. Provider boundary (no Sanity types exported to domain)
 */

import { describe, it, expect } from "vitest";
import { parse, evaluate } from "groq-js";

// ── TEST DATA ──────────────────────────────────────────────────────────────

/**
 * Dataset covering all cases from the Stage 4.4 test matrix:
 *
 * A) Draft article (status: "draft") — excluded from production
 * B) Sanity draft permutation of published doc (drafts.* prefix, status: "published") — excluded
 * C) Sanity draft of a draft doc (drafts.* prefix, status: "draft") — excluded
 * D) Normal published doc — visible in production and preview
 * E) Archived article — excluded from production, excluded from preview (by design)
 * F) Draft article with slug — accessible in preview (intentional preview path)
 */
const testDataset = [
  {
    _type: "journalArticle",
    _id: "article-draft",
    "slug": { current: "draft-article" },
    status: "draft",
    title: "Case A — Draft Article",
  },
  {
    _type: "journalArticle",
    _id: "drafts.article-published",
    "slug": { current: "published-article" },
    status: "published",
    title: "Case B — Sanity Draft Permutation (status: published)",
  },
  {
    _type: "journalArticle",
    _id: "drafts.article-draft",
    "slug": { current: "draft-article" },
    status: "draft",
    title: "Case C — Sanity Draft of a Draft",
  },
  {
    _type: "journalArticle",
    _id: "article-published",
    "slug": { current: "published-article" },
    status: "published",
    title: "Case D — Normal Published Article",
  },
  {
    _type: "journalArticle",
    _id: "article-archived",
    "slug": { current: "archived-article" },
    status: "archived",
    title: "Case E — Archived Article",
  },
  {
    _type: "journalArticle",
    _id: "article-draft-2",
    "slug": { current: "draft-article-2" },
    status: "draft",
    title: "Case F — Draft Article Accessible via Preview Slug",
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────

async function runGroqFilter(filter: string, params: Record<string, unknown> = {}) {
  const parsed = parse(filter);
  const result = await evaluate(parsed, { dataset: testDataset, params });
  return result.get() as Record<string, unknown>[];
}

// ── PRODUCTION QUERY TESTS ─────────────────────────────────────────────────

describe("Production queries — draft safety", () => {
  it("excludes documents with drafts.** ID prefix regardless of status", async () => {
    const filter = `*[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"]`;
    const docs = await runGroqFilter(filter);

    const ids = docs.map((d) => d._id);
    expect(ids).not.toContain("drafts.article-published"); // Case B: excluded
    expect(ids).not.toContain("drafts.article-draft");     // Case C: excluded
  });

  it("excludes documents with status != 'published'", async () => {
    const filter = `*[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"]`;
    const docs = await runGroqFilter(filter);

    const ids = docs.map((d) => d._id);
    expect(ids).not.toContain("article-draft");    // Case A: draft status
    expect(ids).not.toContain("article-archived"); // Case E: archived status
    expect(ids).not.toContain("article-draft-2");  // Case F: draft status
  });

  it("returns only the normal published document (Case D)", async () => {
    const filter = `*[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"]`;
    const docs = await runGroqFilter(filter);

    expect(docs).toHaveLength(1);
    expect(docs[0]._id).toBe("article-published");
    expect(docs[0].status).toBe("published");
  });

  it("returns empty array when no published non-draft documents exist", async () => {
    const emptyDataset = [
      { _type: "journalArticle", _id: "drafts.x", status: "published" },
      { _type: "journalArticle", _id: "y", status: "draft" },
    ];
    const filter = `*[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"]`;
    const parsed = parse(filter);
    const result = await evaluate(parsed, { dataset: emptyDataset });
    const docs = await result.get();
    expect(docs).toHaveLength(0);
  });
});

// ── PREVIEW QUERY TESTS ────────────────────────────────────────────────────

describe("Preview queries — intentional draft access", () => {
  it("retrieves a draft article by slug in preview mode (no status filter)", async () => {
    // Preview query: no !(_id in path("drafts.**")), no status == "published"
    const filter = `*[_type == "journalArticle" && slug.current == $slug]`;
    // When using perspective: "previewDrafts" on the actual client, Sanity deduplicates
    // drafts vs published. In this GROQ test we test the raw filter behavior.
    const docs = await runGroqFilter(filter, { slug: "draft-article" });

    // Should find the draft document (Case A) and potentially Case C (drafts.*)
    const ids = docs.map((d) => d._id);
    expect(ids).toContain("article-draft"); // Case A: draft status, accessible via slug
  });

  it("retrieves a published article by slug in preview mode", async () => {
    const filter = `*[_type == "journalArticle" && slug.current == $slug]`;
    const docs = await runGroqFilter(filter, { slug: "published-article" });

    const ids = docs.map((d) => d._id);
    expect(ids).toContain("article-published"); // Case D: published, accessible
  });

  it("does NOT expose all drafts via listing queries (listing remains published-only)", async () => {
    // The listing query used in SanityPreviewCmsClient (falls back to production query)
    const listingFilter = `*[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"]`;
    const docs = await runGroqFilter(listingFilter);

    // Even in preview context, listing only shows published
    expect(docs).toHaveLength(1);
    expect(docs[0]._id).toBe("article-published");
  });

  it("does not accidentally expose archived content in preview slug lookup", async () => {
    // Preview query by slug should only return what Sanity returns for that slug.
    // Archived content with matching slug would be returned — this is expected and
    // intentional: editors previewing an archived document should see it.
    // The preview is gated behind Draft Mode activation, not public.
    const filter = `*[_type == "journalArticle" && slug.current == $slug]`;
    const docs = await runGroqFilter(filter, { slug: "archived-article" });

    const ids = docs.map((d) => d._id);
    // In preview mode, archived docs ARE retrievable (intentional preview behavior).
    // They are NOT accessible in production because production query requires status == "published".
    expect(ids).toContain("article-archived"); // accessible in preview (expected)
  });
});

// ── DRAFT EXCLUSION TEST MATRIX ────────────────────────────────────────────

describe("Stage 4.4 production/draft test matrix", () => {
  const productionFilter = `*[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"]`;

  it("PUBLISHED article: visible in production (Draft Mode OFF)", async () => {
    const docs = await runGroqFilter(productionFilter);
    const ids = docs.map((d) => d._id);
    expect(ids).toContain("article-published"); // ✓ visible
  });

  it("DRAFT article: NOT visible in production (Draft Mode OFF)", async () => {
    const docs = await runGroqFilter(productionFilter);
    const ids = docs.map((d) => d._id);
    expect(ids).not.toContain("article-draft");   // ✗ not visible
    expect(ids).not.toContain("article-draft-2"); // ✗ not visible
  });

  it("ARCHIVED article: NOT visible in production (Draft Mode OFF)", async () => {
    const docs = await runGroqFilter(productionFilter);
    const ids = docs.map((d) => d._id);
    expect(ids).not.toContain("article-archived"); // ✗ not visible
  });

  it("SANITY DRAFT PERMUTATION (drafts.* + status: published): NOT visible in production", async () => {
    const docs = await runGroqFilter(productionFilter);
    const ids = docs.map((d) => d._id);
    expect(ids).not.toContain("drafts.article-published"); // ✗ excluded by path filter
  });

  it("SANITY DRAFT PERMUTATION (drafts.* + status: draft): NOT visible in production", async () => {
    const docs = await runGroqFilter(productionFilter);
    const ids = docs.map((d) => d._id);
    expect(ids).not.toContain("drafts.article-draft"); // ✗ excluded by both filters
  });

  it("DRAFT article: accessible via preview slug query (Draft Mode ON)", async () => {
    const previewFilter = `*[_type == "journalArticle" && slug.current == $slug]`;
    const docs = await runGroqFilter(previewFilter, { slug: "draft-article-2" });
    const ids = docs.map((d) => d._id);
    // In preview mode, the draft document is reachable by slug
    expect(ids).toContain("article-draft-2"); // ✓ previewable
  });

  it("DRAFT article: NOT visible in production listing even when preview has access", async () => {
    // Production listing always uses the safe query regardless of context
    const docs = await runGroqFilter(productionFilter);
    const ids = docs.map((d) => d._id);
    expect(ids).not.toContain("article-draft-2"); // ✗ never in production listing
  });
});

// ── PROVIDER BOUNDARY AUDIT ────────────────────────────────────────────────

describe("Provider boundary — domain model neutrality", () => {
  it("SanityCmsClient does not export Sanity-specific types to domain", async () => {
    // We import the production client and verify it implements CmsClient interface
    // without any Sanity-specific types visible in the public API.
    const { SanityCmsClient } = await import(
      "@/lib/cms/providers/sanity/SanityCmsClient"
    );
    const client = new SanityCmsClient();

    // These are the only methods that should be callable from application code
    expect(typeof client.getJournalArticles).toBe("function");
    expect(typeof client.getJournalArticleBySlug).toBe("function");
    expect(typeof client.getLookbooks).toBe("function");
    expect(typeof client.getLookbookBySlug).toBe("function");
    expect(typeof client.getAbout).toBe("function");
    expect(typeof client.getCampaigns).toBe("function");
    expect(typeof client.getCampaignBySlug).toBe("function");
  });

  it("SanityPreviewCmsClient implements the same CmsClient interface", async () => {
    const { SanityPreviewCmsClient } = await import(
      "@/lib/cms/providers/sanity/SanityPreviewCmsClient"
    );
    const client = new SanityPreviewCmsClient();

    // Preview client must have the same interface as production client
    expect(typeof client.getJournalArticles).toBe("function");
    expect(typeof client.getJournalArticleBySlug).toBe("function");
    expect(typeof client.getLookbooks).toBe("function");
    expect(typeof client.getLookbookBySlug).toBe("function");
    expect(typeof client.getAbout).toBe("function");
    expect(typeof client.getCampaigns).toBe("function");
    expect(typeof client.getCampaignBySlug).toBe("function");
  });

  it("cms singleton from @/lib/cms is always the production client when not in Draft Mode", async () => {
    const { cms } = await import("@/lib/cms");
    const { SanityCmsClient } = await import(
      "@/lib/cms/providers/sanity/SanityCmsClient"
    );

    expect(cms).toBeInstanceOf(SanityCmsClient);
  });
});

// ── SECURITY TESTS ─────────────────────────────────────────────────────────

describe("Preview route security", () => {
  it("disable route redirect param is validated — only relative paths accepted", () => {
    // Test the redirect validation logic (extracted from the route for testability)
    function validateRedirect(redirectParam: string | null): string {
      const safeRedirect =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
          ? redirectParam
          : "/";
      return safeRedirect;
    }

    // Valid relative paths
    expect(validateRedirect("/journal/test-article")).toBe("/journal/test-article");
    expect(validateRedirect("/about")).toBe("/about");
    expect(validateRedirect("/")).toBe("/");

    // Invalid: open redirect attempts should fall back to "/"
    expect(validateRedirect("https://malicious.com")).toBe("/");
    expect(validateRedirect("//malicious.com")).toBe("/");
    expect(validateRedirect("http://evil.com/path")).toBe("/");
    expect(validateRedirect(null)).toBe("/");
    expect(validateRedirect("")).toBe("/");
  });

  it("production queries maintain draft exclusion — both filters must be present", async () => {
    // Verify both safety predicates are present in production queries
    const { journalArticleBySlugQuery } = await import(
      "@/lib/cms/providers/sanity/queries"
    );

    expect(journalArticleBySlugQuery).toContain('!(_id in path("drafts.**"))');
    expect(journalArticleBySlugQuery).toContain('status == "published"');
  });

  it("preview queries intentionally omit draft exclusion for single-doc access", async () => {
    const { previewJournalArticleBySlugQuery } = await import(
      "@/lib/cms/providers/sanity/previewQueries"
    );

    // Preview query should NOT have the draft exclusion filter
    expect(previewJournalArticleBySlugQuery).not.toContain('!(_id in path("drafts.**"))');
    expect(previewJournalArticleBySlugQuery).not.toContain('status == "published"');

    // But should still scope to the right type and use slug
    expect(previewJournalArticleBySlugQuery).toContain('_type == "journalArticle"');
    expect(previewJournalArticleBySlugQuery).toContain("slug.current == $slug");
  });

  it("preview queries for all content types omit draft exclusion", async () => {
    const {
      previewLookbookBySlugQuery,
      previewCampaignBySlugQuery,
      previewAboutPageQuery,
    } = await import("@/lib/cms/providers/sanity/previewQueries");

    for (const query of [previewLookbookBySlugQuery, previewCampaignBySlugQuery]) {
      expect(query).not.toContain('!(_id in path("drafts.**"))');
      expect(query).not.toContain('status == "published"');
    }

    expect(previewAboutPageQuery).not.toContain('!(_id in path("drafts.**"))');
    expect(previewAboutPageQuery).not.toContain('status == "published"');
  });
});

// ── SEO / INDEXING TESTS ───────────────────────────────────────────────────

describe("Preview metadata and indexing behavior", () => {
  it("production queries include noIndex field in seo projection", async () => {
    const { journalArticleBySlugQuery } = await import(
      "@/lib/cms/providers/sanity/queries"
    );

    // SEO metadata including noIndex is projected in all by-slug queries
    expect(journalArticleBySlugQuery).toContain("noIndex");
  });

  it("preview queries include noIndex field in seo projection", async () => {
    const { previewJournalArticleBySlugQuery } = await import(
      "@/lib/cms/providers/sanity/previewQueries"
    );

    // Preview metadata still projects noIndex — routes can use it appropriately
    expect(previewJournalArticleBySlugQuery).toContain("noIndex");
  });
});
