import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";

/**
 * Next.js App Router Metadata Route: /robots.txt
 *
 * Rules:
 * - Allows crawling of all public editorial and commerce pages.
 * - Disallows private account, cart, internal callbacks, draft endpoints, and Studio.
 * - Directs crawlers to the canonical sitemap.xml.
 */
export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = getAbsoluteUrl("/sitemap.xml");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/collections",
          "/collections/",
          "/products/",
          "/journal",
          "/journal/",
          "/lookbook",
          "/lookbook/",
          "/campaigns/",
          "/about",
        ],
        disallow: [
          "/account",
          "/account/",
          "/bag",
          "/search",
          "/api/",
          "/studio",
          "/studio/",
        ],
      },
    ],
    sitemap: sitemapUrl,
  };
}
