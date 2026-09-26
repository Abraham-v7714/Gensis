import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { cms } from "@/lib/cms";

/**
 * Next.js App Router Metadata Route: /sitemap.xml
 *
 * Rules:
 * - Surfaces only public, indexable, published URLs.
 * - Excludes account, bag, search, draft preview, and Studio routes.
 * - Integrates real dynamic content from Commerce and CMS providers.
 * - Fails safely with core static pages when external providers are unconfigured.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getAbsoluteUrl("/shop"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/collections"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/journal"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/lookbook"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Fetch dynamic commerce entities
  let productRoutes: MetadataRoute.Sitemap = [];
  let collectionRoutes: MetadataRoute.Sitemap = [];

  if (isCommerceConfigured()) {
    try {
      const [productsResult, collections] = await Promise.all([
        commerce.getProducts({ first: 100 }),
        commerce.getCollections({ first: 50 }),
      ]);

      productRoutes = productsResult.items.map((product) => ({
        url: getAbsoluteUrl(`/products/${product.slug}`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

      collectionRoutes = collections.items.map((collection) => ({
        url: getAbsoluteUrl(`/collections/${collection.slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } catch {
      // Graceful fallback if commerce API has transient error
    }
  }

  // Fetch dynamic CMS entities
  let journalRoutes: MetadataRoute.Sitemap = [];
  let lookbookRoutes: MetadataRoute.Sitemap = [];
  let campaignRoutes: MetadataRoute.Sitemap = [];

  try {
    const [articles, lookbooks, campaigns] = await Promise.all([
      cms.getJournalArticles({ limit: 100 }),
      cms.getLookbooks({ limit: 50 }),
      cms.getCampaigns({ limit: 50 }),
    ]);

    journalRoutes = articles.map((article) => ({
      url: getAbsoluteUrl(`/journal/${article.slug}`),
      lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    lookbookRoutes = lookbooks.map((lookbook) => ({
      url: getAbsoluteUrl(`/lookbook/${lookbook.slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    campaignRoutes = campaigns.map((campaign) => ({
      url: getAbsoluteUrl(`/campaigns/${campaign.slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Graceful fallback if CMS has transient error
  }

  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
    ...journalRoutes,
    ...lookbookRoutes,
    ...campaignRoutes,
  ];
}
