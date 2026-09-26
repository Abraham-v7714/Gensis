import { describe, it, expect } from "vitest";
import { constructMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

describe("SEO Metadata Utility (constructMetadata)", () => {
  it("uses default siteConfig name and description when no parameters provided", () => {
    const meta = constructMetadata();
    expect(meta.title).toBe(siteConfig.name);
    expect(meta.description).toBe(siteConfig.description);
  });

  it("appends site brand suffix to custom title if absent", () => {
    const meta = constructMetadata({
      seo: { title: "Material Study" },
    });
    expect(meta.title).toBe("Material Study | GENSIS");
  });

  it("does not duplicate site name if title already contains it", () => {
    const meta = constructMetadata({
      seo: { title: "GENSIS Autumn Collection" },
    });
    expect(meta.title).toBe("GENSIS Autumn Collection");
  });

  it("maps canonicalUrl to metadata.alternates.canonical", () => {
    const canonical = "https://gensis.example.com/journal/wool-study";
    const meta = constructMetadata({
      seo: { canonicalUrl: canonical },
    });
    expect(meta.alternates?.canonical).toBe(canonical);
  });

  it("maps noIndex === true to metadata.robots = { index: false, follow: false }", () => {
    const meta = constructMetadata({
      seo: { noIndex: true },
    });
    expect(meta.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("uses fallbackTitle and fallbackDescription when seo object is empty", () => {
    const meta = constructMetadata({
      fallbackTitle: "Shop Overview",
      fallbackDescription: "Architectural garments listing.",
    });
    expect(meta.title).toBe("Shop Overview | GENSIS");
    expect(meta.description).toBe("Architectural garments listing.");
  });
});
