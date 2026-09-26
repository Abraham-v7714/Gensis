import { describe, it, expect, beforeEach, afterEach } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("Robots & Sitemap Generation (Stage 4.17)", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://gensis.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("generates correct robots.txt rules allowing public paths and blocking private paths", () => {
    const robotsConfig = robots();

    expect(robotsConfig.sitemap).toBe("https://gensis.com/sitemap.xml");

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules[0]
      : robotsConfig.rules;

    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toEqual(
      expect.arrayContaining(["/", "/shop", "/collections", "/journal", "/about"])
    );
    expect(rules.disallow).toEqual(
      expect.arrayContaining(["/account", "/bag", "/search", "/api/", "/studio"])
    );
  });

  it("generates sitemap including core static public routes", async () => {
    const entries = await sitemap();

    const urls = entries.map((entry) => entry.url);

    // Core static routes must be present
    expect(urls).toContain("https://gensis.com/");
    expect(urls).toContain("https://gensis.com/shop");
    expect(urls).toContain("https://gensis.com/collections");
    expect(urls).toContain("https://gensis.com/journal");
    expect(urls).toContain("https://gensis.com/lookbook");
    expect(urls).toContain("https://gensis.com/about");

    // Private routes must NOT be in sitemap
    expect(urls).not.toContain("https://gensis.com/account");
    expect(urls).not.toContain("https://gensis.com/bag");
    expect(urls).not.toContain("https://gensis.com/search");
    expect(urls).not.toContain("https://gensis.com/studio");
  });
});
