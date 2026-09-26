/**
 * JSON-LD Structured Data Utilities — Stage 4.17
 *
 * Provides provider-neutral Schema.org structured data models:
 * - Organization
 * - WebSite
 * - Product (with real price, currency, availability, and SKU)
 * - Article (for Journal entries)
 * - BreadcrumbList
 *
 * Rules:
 * - Safe JSON escaping to prevent script injection.
 * - No fake ratings, fake reviews, or fabricated aggregate data.
 * - Strictly provider-neutral types.
 */

import type { Product } from "@/types/product";
import type { JournalArticle } from "@/types/cms";
import { siteConfig } from "@/config/site";
import { getAbsoluteUrl } from "./index";

/**
 * Escapes unsafe HTML characters within serialized JSON-LD to prevent XSS.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Generates Schema.org Organization structured data.
 */
export function getOrganizationJsonLd() {
  const siteUrl = getAbsoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    logo: getAbsoluteUrl("/favicon.ico"),
    sameAs: [],
  };
}

/**
 * Generates Schema.org WebSite structured data with SearchAction.
 */
export function getWebSiteJsonLd() {
  const siteUrl = getAbsoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generates Schema.org Product structured data from real GENSIS Product model.
 */
export function getProductJsonLd(product: Product, pathOrUrl: string) {
  const url = getAbsoluteUrl(pathOrUrl);
  const images = product.images.map((img) => getAbsoluteUrl(img.url));

  const isAvailable = product.availability === "available";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    url,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.variants[0]?.sku ? { sku: product.variants[0].sku } : {}),
    offers: {
      "@type": "Offer",
      price: product.price.amount,
      priceCurrency: product.price.currency,
      availability: isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/**
 * Generates Schema.org Article structured data from real JournalArticle CMS model.
 */
export function getArticleJsonLd(article: JournalArticle, pathOrUrl: string) {
  const url = getAbsoluteUrl(pathOrUrl);
  const image = article.featuredMedia?.url
    ? getAbsoluteUrl(article.featuredMedia.url)
    : undefined;

  const authorRecord = article as unknown as {
    author?: { name?: string };
    contributor?: { name?: string };
    contributors?: Array<{ name?: string }>;
  };
  const authorName =
    authorRecord.author?.name ||
    authorRecord.contributor?.name ||
    authorRecord.contributors?.[0]?.name ||
    siteConfig.name;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.description,
    url,
    ...(image ? { image: [image] } : {}),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/favicon.ico"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/**
 * Generates Schema.org BreadcrumbList structured data.
 */
export function getBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  };
}
