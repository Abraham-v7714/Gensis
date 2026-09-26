import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { constructMetadata } from "@/lib/seo";
import type { SeoMetadata } from "@/types/cms";

describe("Advanced SEO Metadata & Social Sharing (Stage 4.17)", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://gensis.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("resolves absolute URLs for canonical and OpenGraph tags", () => {
    const meta = constructMetadata({
      fallbackTitle: "Minimal Coat",
      fallbackDescription: "Tailored luxury overcoat.",
      canonical: "/products/minimal-coat",
      image: "/images/minimal-coat.jpg",
    });

    expect(meta.title).toBe("Minimal Coat | GENSIS");
    expect(meta.description).toBe("Tailored luxury overcoat.");
    expect(meta.alternates?.canonical).toBe("https://gensis.com/products/minimal-coat");
    expect(meta.openGraph?.url).toBe("https://gensis.com/products/minimal-coat");
    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "https://gensis.com/images/minimal-coat.jpg",
      }),
    ]);
    expect(meta.twitter?.card).toBe("summary_large_image");
    expect(meta.twitter?.images).toEqual(["https://gensis.com/images/minimal-coat.jpg"]);
  });

  it("handles domain SeoMetadata object from CMS", () => {
    const cmsSeo: SeoMetadata = {
      title: "Autumn Editorial 2026",
      description: "An inquiry into structure and form.",
      canonicalUrl: "https://gensis.com/journal/autumn-2026",
      image: {
        url: "https://cdn.sanity.io/images/proj/dataset/editorial.jpg",
        alt: "Autumn Editorial Cover",
        width: 1200,
        height: 630,
      },
    };

    const meta = constructMetadata({
      seo: cmsSeo,
      type: "article",
      publishedTime: "2026-09-20T12:00:00Z",
    });

    expect(meta.title).toBe("Autumn Editorial 2026 | GENSIS");
    expect(meta.openGraph?.type).toBe("article");
    expect(meta.openGraph?.publishedTime).toBe("2026-09-20T12:00:00Z");
    expect(meta.openGraph?.images).toEqual([
      {
        url: "https://cdn.sanity.io/images/proj/dataset/editorial.jpg",
        alt: "Autumn Editorial Cover",
        width: 1200,
        height: 630,
      },
    ]);
  });

  it("generates strict noIndex robots directives for private pages", () => {
    const meta = constructMetadata({
      fallbackTitle: "Account Profile",
      noIndex: true,
    });

    expect(meta.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("omits robots directive for standard indexable public pages", () => {
    const meta = constructMetadata({
      fallbackTitle: "Shop",
      canonical: "/shop",
    });

    expect(meta.robots).toBeUndefined();
  });
});
