import type { Metadata } from "next";
import type { SeoMetadata } from "@/types/cms";
import { siteConfig } from "@/config/site";

export type ConstructMetadataOptions = {
  /** Normalized SeoMetadata object from a GENSIS domain model. */
  seo?: SeoMetadata;
  /** Fallback title if seo.title is absent. */
  fallbackTitle?: string;
  /** Fallback description if seo.description is absent. */
  fallbackDescription?: string;
  /** Explicit canonical URL or path. */
  canonical?: string;
  /** Explicit noIndex flag. */
  noIndex?: boolean;
  /** Image URL or image descriptor for OpenGraph & Twitter cards. */
  image?: string | { url: string; width?: number; height?: number; alt?: string };
  /** OpenGraph type (default: "website"). */
  type?: "website" | "article";
  /** Published date ISO string (for articles). */
  publishedTime?: string;
};

/**
 * Resolves an absolute URL given a path or full URL.
 */
export function getAbsoluteUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Maps normalized GENSIS domain SeoMetadata to Next.js App Router Metadata.
 *
 * Rules:
 * - Provider-neutral SEO mapping utility.
 * - Maps title, description, canonicalUrl, OpenGraph, Twitter card, and robots policies.
 * - Reuses siteConfig defaults without duplicating brand strings.
 * - Formats absolute URLs for OpenGraph images and canonical tags.
 */
export function constructMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  canonical,
  noIndex,
  image,
  type = "website",
  publishedTime,
}: ConstructMetadataOptions = {}): Metadata {
  const baseTitle = seo?.title ?? fallbackTitle ?? siteConfig.name;

  const formattedTitle =
    baseTitle === siteConfig.name
      ? siteConfig.name
      : baseTitle.includes(siteConfig.name)
      ? baseTitle
      : `${baseTitle} | ${siteConfig.name}`;

  const description = seo?.description ?? fallbackDescription ?? siteConfig.description;

  const metadata: Metadata = {
    title: formattedTitle,
    description,
  };

  // Canonical URL resolution
  const rawCanonical = seo?.canonicalUrl || canonical;
  const canonicalUrl = rawCanonical ? getAbsoluteUrl(rawCanonical) : undefined;
  if (canonicalUrl) {
    metadata.alternates = {
      canonical: canonicalUrl,
    };
  }

  // Open Graph & Social Image resolution
  let resolvedImage: { url: string; width?: number; height?: number; alt?: string } | undefined;
  if (seo?.image?.url) {
    resolvedImage = {
      url: getAbsoluteUrl(seo.image.url),
      alt: seo.image.alt || formattedTitle,
      width: seo.image.width,
      height: seo.image.height,
    };
  } else if (image) {
    if (typeof image === "string") {
      resolvedImage = {
        url: getAbsoluteUrl(image),
        alt: formattedTitle,
      };
    } else {
      resolvedImage = {
        ...image,
        url: getAbsoluteUrl(image.url),
      };
    }
  }

  metadata.openGraph = {
    title: formattedTitle,
    description,
    siteName: siteConfig.name,
    locale: "en_US",
    type,
    ...(canonicalUrl ? { url: canonicalUrl } : {}),
    ...(resolvedImage ? { images: [resolvedImage] } : {}),
    ...(publishedTime && type === "article" ? { publishedTime } : {}),
  };

  metadata.twitter = {
    card: "summary_large_image",
    title: formattedTitle,
    description,
    ...(resolvedImage ? { images: [resolvedImage.url] } : {}),
  };

  // Indexation / Robots control
  const resolvedNoIndex = seo?.noIndex ?? noIndex;
  if (resolvedNoIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}
