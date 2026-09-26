import { describe, it, expect } from "vitest";
import {
  getOrganizationJsonLd,
  getWebSiteJsonLd,
  getProductJsonLd,
  getArticleJsonLd,
  getBreadcrumbJsonLd,
  safeJsonLd,
} from "@/lib/seo/jsonLd";
import type { Product } from "@/types/product";
import type { JournalArticle } from "@/types/cms";

describe("JSON-LD Structured Data Utilities (Stage 4.17)", () => {
  it("generates Organization schema", () => {
    const org = getOrganizationJsonLd();
    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("GENSIS");
  });

  it("generates WebSite schema with SearchAction", () => {
    const website = getWebSiteJsonLd();
    expect(website["@context"]).toBe("https://schema.org");
    expect(website["@type"]).toBe("WebSite");
    expect(website.potentialAction["@type"]).toBe("SearchAction");
  });

  it("generates Product schema with real price, currency, and availability", () => {
    const mockProduct: Product = {
      id: "prod-1",
      slug: "wool-overcoat",
      title: "Wool Overcoat",
      description: "Architectural structured coat.",
      price: { amount: 650, currency: "USD" },
      availability: "available",
      images: [{ id: "img-1", url: "/images/coat.jpg", alt: "Coat" }],
      variants: [
        {
          id: "v1",
          sku: "COAT-BLK-S",
          title: "Small",
          price: { amount: 650, currency: "USD" },
          availability: "available",
          options: [{ name: "Size", value: "S" }],
        },
      ],
    };

    const productLd = getProductJsonLd(mockProduct, "/products/wool-overcoat");
    expect(productLd["@type"]).toBe("Product");
    expect(productLd.name).toBe("Wool Overcoat");
    expect(productLd.sku).toBe("COAT-BLK-S");
    expect(productLd.offers.price).toBe(650);
    expect(productLd.offers.priceCurrency).toBe("USD");
    expect(productLd.offers.availability).toBe("https://schema.org/InStock");
  });

  it("generates Article schema for Journal articles", () => {
    const mockArticle: JournalArticle = {
      id: "art-1",
      title: "The Architecture of Wool",
      slug: "architecture-of-wool",
      publishedAt: "2026-09-15T10:00:00Z",
      status: "published",
      excerpt: "An exploration into material tactile density.",
      category: { id: "c1", name: "Materiality", slug: "materiality" },
      featuredMedia: {
        url: "https://cdn.sanity.io/art.jpg",
        alt: "Wool fabric",
      },
      contributor: {
        id: "con-1",
        name: "Elena Rostova",
        slug: "elena-rostova",
      },
      body: [],
    };

    const articleLd = getArticleJsonLd(mockArticle, "/journal/architecture-of-wool");
    expect(articleLd["@type"]).toBe("Article");
    expect(articleLd.headline).toBe("The Architecture of Wool");
    expect(articleLd.author.name).toBe("Elena Rostova");
    expect(articleLd.datePublished).toBe("2026-09-15T10:00:00Z");
  });

  it("generates BreadcrumbList schema", () => {
    const breadcrumbs = getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: "Outerwear", url: "/collections/outerwear" },
    ]);

    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement).toHaveLength(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);
    expect(breadcrumbs.itemListElement[2].name).toBe("Outerwear");
  });

  it("safely escapes HTML tags in JSON-LD output", () => {
    const malicious = {
      name: "</script><script>alert('xss')</script>",
      description: "<!-- comment --> test & value",
    };

    const serialized = safeJsonLd(malicious);
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u0026");
  });
});
