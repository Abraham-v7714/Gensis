/**
 * Sanity GROQ Queries
 *
 * Provider-specific GROQ query strings for fetching GENSIS CMS entities.
 * Kept isolated inside the provider boundary — never imported by UI or routes.
 */

import { groq } from "next-sanity";

export const journalArticlesQuery = groq`
  *[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"] | order(publishedAt desc) [$offset...$limit] {
    _id,
    "id": coalesce(id, _id),
    "slug": slug.current,
    title,
    excerpt,
    publishedAt,
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
    }
  }
`;

export const journalArticleBySlugQuery = groq`
  *[_type == "journalArticle" && !(_id in path("drafts.**")) && slug.current == $slug && status == "published"][0] {
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

export const lookbooksQuery = groq`
  *[_type == "lookbook" && !(_id in path("drafts.**")) && status == "published"] | order(publishedAt desc) [$offset...$limit] {
    _id,
    "id": coalesce(id, _id),
    "slug": slug.current,
    title,
    description,
    publishedAt,
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
    }
  }
`;

export const lookbookBySlugQuery = groq`
  *[_type == "lookbook" && !(_id in path("drafts.**")) && slug.current == $slug && status == "published"][0] {
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

export const aboutPageQuery = groq`
  *[_type == "aboutPage" && !(_id in path("drafts.**")) && status == "published"][0] {
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

export const campaignsQuery = groq`
  *[_type == "campaign" && !(_id in path("drafts.**")) && status == "published"] | order(publishedAt desc) [$offset...$limit] {
    _id,
    "id": coalesce(id, _id),
    "slug": slug.current,
    title,
    description,
    publishedAt,
    status,
    heroMedia {
      "id": coalesce(id, _key, "media-hero"),
      "url": coalesce(url, asset->url, ""),
      "alt": coalesce(alt, ""),
      width,
      height,
      caption,
      credit
    }
  }
`;

export const campaignBySlugQuery = groq`
  *[_type == "campaign" && !(_id in path("drafts.**")) && slug.current == $slug && status == "published"][0] {
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
