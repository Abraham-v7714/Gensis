import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { getTagsForDocument, CMS_TAGS } from "@/lib/cms/tags";

// Mock next/cache revalidateTag
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { revalidateTag } from "next/cache";
import { POST } from "@/app/api/revalidate/sanity/route";

describe("CMS Cache Tags Strategy & Revalidation", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, SANITY_REVALIDATE_SECRET: "test-secret-123" };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  // ── 1. TAG GENERATION & MAPPING ─────────────────────────────────────────────

  describe("getTagsForDocument Mapper & CMS_TAGS", () => {
    it("returns correct deterministic tag format from CMS_TAGS", () => {
      expect(CMS_TAGS.all()).toBe("cms");
      expect(CMS_TAGS.journalCollection()).toBe("cms:journal");
      expect(CMS_TAGS.journalArticle("test-slug")).toBe("cms:journal:test-slug");
      expect(CMS_TAGS.lookbookCollection()).toBe("cms:lookbooks");
      expect(CMS_TAGS.lookbookItem("test-slug")).toBe("cms:lookbook:test-slug");
      expect(CMS_TAGS.campaignCollection()).toBe("cms:campaigns");
      expect(CMS_TAGS.campaignItem("test-slug")).toBe("cms:campaign:test-slug");
      expect(CMS_TAGS.about()).toBe("cms:about");
    });

    it("generates correct tags for journal articles", () => {
      const tags = getTagsForDocument("journalArticle", "architectural-garment-study");
      expect(tags).toEqual(["cms:journal", "cms:journal:architectural-garment-study"]);
    });

    it("generates correct tags for lookbooks", () => {
      const tags = getTagsForDocument("lookbook", "autumn-winter-2026");
      expect(tags).toEqual(["cms:lookbooks", "cms:lookbook:autumn-winter-2026"]);
    });

    it("generates correct tags for campaigns", () => {
      const tags = getTagsForDocument("campaign", "spatial-silhouettes");
      expect(tags).toEqual(["cms:campaigns", "cms:campaign:spatial-silhouettes"]);
    });

    it("generates correct tags for About page", () => {
      const tags = getTagsForDocument("aboutPage");
      expect(tags).toEqual(["cms:about"]);
    });

    it("generates collection tags for taxonomies", () => {
      const tagsCategory = getTagsForDocument("category");
      expect(tagsCategory).toEqual(["cms:journal", "cms:lookbooks", "cms:campaigns"]);

      const tagsTag = getTagsForDocument("tag");
      expect(tagsTag).toEqual(["cms:journal", "cms:lookbooks", "cms:campaigns"]);

      const tagsContributor = getTagsForDocument("contributor");
      expect(tagsContributor).toEqual(["cms:journal", "cms:lookbooks", "cms:campaigns"]);
    });

    it("fails closed (returns empty array) for unknown document types", () => {
      const tags = getTagsForDocument("unknownType");
      expect(tags).toEqual([]);
    });

    it("handles slug changes by returning both previous and new slug tags", () => {
      const tags = getTagsForDocument(
        "journalArticle",
        "new-article-slug",
        "old-article-slug"
      );
      expect(tags).toEqual([
        "cms:journal",
        "cms:journal:new-article-slug",
        "cms:journal:old-article-slug",
      ]);
    });
  });

  // ── 2. WEBHOOK ENDPOINT AUTHENTICATION ──────────────────────────────────────

  describe("Revalidation Route Authentication", () => {
    it("returns 500 when SANITY_REVALIDATE_SECRET is missing on the server", async () => {
      delete process.env.SANITY_REVALIDATE_SECRET;

      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({ _type: "journalArticle", slug: "test" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe("Revalidation secret not configured");
    });

    it("returns 401 when request secret header is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        body: JSON.stringify({ _type: "journalArticle", slug: "test" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 401 when request secret is invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "wrong-secret" },
        body: JSON.stringify({ _type: "journalArticle", slug: "test" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("authenticates successfully with valid x-sanity-secret header", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({ _type: "aboutPage" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.revalidated).toBe(true);
      expect(json.tags).toEqual(["cms:about"]);
      expect(revalidateTag).toHaveBeenCalledWith("cms:about", { expire: 0 });
    });

    it("authenticates successfully with Bearer token header", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { Authorization: "Bearer test-secret-123" },
        body: JSON.stringify({ _type: "aboutPage" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.revalidated).toBe(true);
    });
  });

  // ── 3. DRAFT EXCLUSION & MUTATION FILTERING ─────────────────────────────────

  describe("Draft Exclusion & Mutation Filtering", () => {
    it("ignores mutations with drafts.* document ID", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({
          _id: "drafts.article-1",
          _type: "journalArticle",
          slug: "draft-article",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.revalidated).toBe(false);
      expect(json.reason).toBe("Draft mutation ignored");
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it("ignores mutations with status: draft", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({
          _id: "article-1",
          _type: "journalArticle",
          status: "draft",
          slug: "draft-article",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.revalidated).toBe(false);
      expect(json.reason).toBe("Draft mutation ignored");
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it("processes published mutations", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({
          _id: "article-1",
          _type: "journalArticle",
          status: "published",
          slug: { current: "material-study" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.revalidated).toBe(true);
      expect(json.tags).toEqual(["cms:journal", "cms:journal:material-study"]);
      expect(revalidateTag).toHaveBeenCalledWith("cms:journal", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("cms:journal:material-study", { expire: 0 });
    });

    it("processes archive/unpublish mutations for published document IDs", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({
          _id: "article-1",
          _type: "journalArticle",
          status: "archived",
          slug: "material-study",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.revalidated).toBe(true);
      expect(revalidateTag).toHaveBeenCalledWith("cms:journal", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("cms:journal:material-study", { expire: 0 });
    });
  });

  // ── 4. MALFORMED REQUEST & SLUG CHANGE HANDLING ─────────────────────────────

  describe("Request Validation & Slug Changes", () => {
    it("returns 400 for malformed JSON body", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: "invalid-json",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON body");
    });

    it("returns 400 for missing document type", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({ slug: "some-slug" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing document type");
    });

    it("invalidates both previous and new slugs when slug changes", async () => {
      const req = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify({
          _type: "lookbook",
          slug: { current: "new-lookbook-slug" },
          slugPrevious: { current: "old-lookbook-slug" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.revalidated).toBe(true);
      expect(json.tags).toEqual([
        "cms:lookbooks",
        "cms:lookbook:new-lookbook-slug",
        "cms:lookbook:old-lookbook-slug",
      ]);
      expect(revalidateTag).toHaveBeenCalledWith("cms:lookbooks", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("cms:lookbook:new-lookbook-slug", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("cms:lookbook:old-lookbook-slug", { expire: 0 });
    });

    it("is idempotent when duplicate webhooks are received", async () => {
      const payload = {
        _type: "campaign",
        slug: "campaign-1",
      };

      const req1 = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify(payload),
      });
      const req2 = new NextRequest("http://localhost:3000/api/revalidate/sanity", {
        method: "POST",
        headers: { "x-sanity-secret": "test-secret-123" },
        body: JSON.stringify(payload),
      });

      const res1 = await POST(req1);
      const res2 = await POST(req2);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      const json1 = await res1.json();
      const json2 = await res2.json();
      expect(json1).toEqual(json2);
    });
  });
});
