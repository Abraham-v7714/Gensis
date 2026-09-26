/**
 * Sanity Preview GROQ Queries — Stage 4.4
 *
 * Draft-aware GROQ query variants for use ONLY in preview (Draft Mode) context.
 *
 * KEY DIFFERENCES from production queries (queries.ts):
 *   - Removes `!(_id in path("drafts.**"))` so Sanity draft documents are accessible.
 *   - Removes `status == "published"` so documents in any status can be previewed.
 *   - These are intentionally scoped to single-document lookups only.
 *
 * SECURITY DESIGN:
 *   - Listing queries (articles, lookbooks, campaigns) are NOT draft-aware here.
 *     Listing pages always use production queries — drafts never appear in public listings.
 *   - Only single-document "by slug" queries and the About singleton are draft-aware,
 *     because editors preview a specific document, not bulk draft exposure.
 *   - These queries must NEVER be used in production rendering paths.
 *   - They are called only from SanityPreviewCmsClient, which is only instantiated
 *     when Next.js Draft Mode is explicitly enabled by an authenticated editor.
 *
 * RELATIONSHIP TO PRODUCTION QUERIES:
 *   - The production queries in queries.ts remain UNCHANGED and continue to enforce:
 *       !(_id in path("drafts.**")) && status == "published"
 *   - These preview queries are additive — they exist only for the preview path.
 */

import { groq } from "next-sanity";

// ── JOURNAL ARTICLE PREVIEW ──────────────────────────────────────────────────

/**
 * Fetches a single journal article by slug for preview.
 * Intentionally omits draft exclusion and status filter.
 * With perspective: "previewDrafts", Sanity returns the draft version when available.
 */
export const previewJournalArticleBySlugQuery = groq`
  *[_type == "journalArticle" && slug.current == $slug][0] {
    _id,
    "id": coalesce(id, _id),
    "slug": slug.current,
    title,
    description,
    excerpt,
    publishedAt,
    updatedAt,
    status,
    featuredMedia {
      "id": coalesce(id, _key, "media-featured"),
      "url": coalesce(url, asset->url, ""),
      "alt": coalesce(alt, ""),
      width,
      height,
      caption,
      credit
    },
    author-> {
      "id": coalesce(id, _id),
      name,
      role,
      bio,
      avatar {
        "id": coalesce(id, _key, "media-avatar"),
        "url": coalesce(url, asset->url, ""),
        "alt": coalesce(alt, ""),
        width,
        height
      }
    },
    contributors[]-> {
      "id": coalesce(id, _id),
      name,
      role,
      bio,
      avatar {
        "id": coalesce(id, _key, "media-avatar"),
        "url": coalesce(url, asset->url, ""),
        "alt": coalesce(alt, ""),
        width,
        height
      }
    },
    category-> {
      "id": coalesce(id, _id),
      name,
      "slug": slug.current,
      description
    },
    tags[]-> {
      "id": coalesce(id, _id),
      name,
      "slug": slug.current
    },
    body[] {
      ...,
      _type == "blockImage" => {
        asset {
          "id": coalesce(id, _key, "media-image"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      },
      _type == "blockSplit" => {
        image {
          "id": coalesce(id, _key, "media-split"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      },
      _type == "blockGallery" => {
        assets[] {
          "id": coalesce(id, _key, "media-gallery"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      }
    },
    seo {
      title,
      description,
      canonicalUrl,
      noIndex
    }
  }
`;

// ── LOOKBOOK PREVIEW ─────────────────────────────────────────────────────────

/**
 * Fetches a single lookbook by slug for preview.
 * Omits draft exclusion and status filter.
 */
export const previewLookbookBySlugQuery = groq`
  *[_type == "lookbook" && slug.current == $slug][0] {
    _id,
    "id": coalesce(id, _id),
    "slug": slug.current,
    title,
    description,
    publishedAt,
    updatedAt,
    status,
    season,
    coverMedia {
      "id": coalesce(id, _key, "media-cover"),
      "url": coalesce(url, asset->url, ""),
      "alt": coalesce(alt, ""),
      width,
      height,
      caption,
      credit
    },
    collection {
      "id": coalesce(id, _id),
      "slug": slug.current,
      title
    },
    items[] {
      "id": coalesce(id, _key),
      order,
      caption,
      media {
        "id": coalesce(id, _key, "media-item"),
        "url": coalesce(url, asset->url, ""),
        "alt": coalesce(alt, ""),
        width,
        height,
        caption,
        credit
      }
    },
    seo {
      title,
      description,
      canonicalUrl,
      noIndex
    }
  }
`;

// ── CAMPAIGN PREVIEW ──────────────────────────────────────────────────────────

/**
 * Fetches a single campaign by slug for preview.
 * Omits draft exclusion and status filter.
 */
export const previewCampaignBySlugQuery = groq`
  *[_type == "campaign" && slug.current == $slug][0] {
    _id,
    "id": coalesce(id, _id),
    "slug": slug.current,
    title,
    description,
    publishedAt,
    updatedAt,
    status,
    heroMedia {
      "id": coalesce(id, _key, "media-hero"),
      "url": coalesce(url, asset->url, ""),
      "alt": coalesce(alt, ""),
      width,
      height,
      caption,
      credit
    },
    body[] {
      ...,
      _type == "blockImage" => {
        asset {
          "id": coalesce(id, _key, "media-image"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      },
      _type == "blockSplit" => {
        image {
          "id": coalesce(id, _key, "media-split"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      },
      _type == "blockGallery" => {
        assets[] {
          "id": coalesce(id, _key, "media-gallery"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      }
    },
    products[] {
      "id": coalesce(id, _id),
      "slug": slug.current,
      title
    },
    collections[] {
      "id": coalesce(id, _id),
      "slug": slug.current,
      title
    },
    seo {
      title,
      description,
      canonicalUrl,
      noIndex
    }
  }
`;

// ── ABOUT PAGE PREVIEW ───────────────────────────────────────────────────────

/**
 * Fetches the About singleton for preview.
 * Omits draft exclusion and status filter.
 * With perspective: "previewDrafts", returns the draft version when available.
 */
export const previewAboutPageQuery = groq`
  *[_type == "aboutPage"][0] {
    _id,
    "id": coalesce(id, _id, "about-singleton"),
    "slug": coalesce(slug.current, "about"),
    title,
    description,
    intro,
    publishedAt,
    updatedAt,
    status,
    media {
      "id": coalesce(id, _key, "media-about"),
      "url": coalesce(url, asset->url, ""),
      "alt": coalesce(alt, ""),
      width,
      height,
      caption,
      credit
    },
    body[] {
      ...,
      _type == "blockImage" => {
        asset {
          "id": coalesce(id, _key, "media-image"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      },
      _type == "blockSplit" => {
        image {
          "id": coalesce(id, _key, "media-split"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      },
      _type == "blockGallery" => {
        assets[] {
          "id": coalesce(id, _key, "media-gallery"),
          "url": coalesce(url, asset->url, ""),
          "alt": coalesce(alt, ""),
          width,
          height,
          caption,
          credit
        }
      }
    },
    seo {
      title,
      description,
      canonicalUrl,
      noIndex
    }
  }
`;
