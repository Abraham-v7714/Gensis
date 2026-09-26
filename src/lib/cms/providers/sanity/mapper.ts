/**
 * Sanity Response Mapper
 *
 * Normalizes raw GROQ query responses from Sanity into GENSIS domain models.
 *
 * Rules:
 * - This file is the single adapter boundary for Sanity response normalization.
 * - Raw Sanity documents or response shapes must never leak beyond this file.
 * - Safely handles missing, null, or optional fields without using `any`.
 */

import type {
  MediaAsset,
  Contributor,
  Category,
  Tag,
  EditorialBlock,
  JournalArticle,
  JournalArticleSummary,
  Lookbook,
  LookbookSummary,
  AboutPage,
  Campaign,
  CampaignSummary,
  SeoMetadata,
  ProductReference,
  CollectionReference,
} from "@/types/cms";

type RawRecord = Record<string, unknown>;

function isRecord(val: unknown): val is RawRecord {
  return typeof val === "object" && val !== null;
}

function getStr(val: unknown, key: string, fallback = ""): string {
  if (isRecord(val) && typeof val[key] === "string") {
    return val[key] as string;
  }
  return fallback;
}

function getOptStr(val: unknown, key: string): string | undefined {
  if (isRecord(val) && typeof val[key] === "string" && (val[key] as string).length > 0) {
    return val[key] as string;
  }
  return undefined;
}

function getNum(val: unknown, key: string): number | undefined {
  if (isRecord(val) && typeof val[key] === "number") {
    return val[key] as number;
  }
  return undefined;
}

// ------------------------------------------------------------------
// MEDIA MAPPER
// ------------------------------------------------------------------

export function mapSanityMediaAsset(raw: unknown): MediaAsset {
  if (!isRecord(raw)) {
    return {
      id: "media-fallback",
      url: "",
      alt: "Missing media asset",
    };
  }

  const assetObj = isRecord(raw.asset) ? raw.asset : undefined;
  const url =
    getOptStr(raw, "url") ||
    (typeof raw.asset === "string" ? raw.asset : getOptStr(assetObj, "url")) ||
    "";

  return {
    id: getStr(raw, "id") || getStr(raw, "_key") || getStr(raw, "_id") || "media-asset",
    url,
    alt: getStr(raw, "alt", "Editorial image"),
    width: getNum(raw, "width"),
    height: getNum(raw, "height"),
    caption: getOptStr(raw, "caption"),
    credit: getOptStr(raw, "credit"),
  };
}

// ------------------------------------------------------------------
// CONTRIBUTOR & TAXONOMY MAPPERS
// ------------------------------------------------------------------

export function mapSanityContributor(raw: unknown): Contributor {
  if (!isRecord(raw)) {
    return {
      id: "contrib-unknown",
      name: "GENSIS Editorial",
    };
  }

  return {
    id: getStr(raw, "id") || getStr(raw, "_id") || "contrib-id",
    name: getStr(raw, "name", "Editorial Writer"),
    role: getOptStr(raw, "role"),
    bio: getOptStr(raw, "bio"),
    avatar: raw.avatar ? mapSanityMediaAsset(raw.avatar) : undefined,
  };
}

export function mapSanityCategory(raw: unknown): Category {
  if (!isRecord(raw)) {
    return {
      id: "cat-uncategorized",
      name: "Uncategorized",
      slug: "uncategorized",
    };
  }

  const slugObj = isRecord(raw.slug) ? raw.slug : undefined;
  const slug = getOptStr(slugObj, "current") || getStr(raw, "slug", "editorial");

  return {
    id: getStr(raw, "id") || getStr(raw, "_id") || "cat-id",
    name: getStr(raw, "name", "Editorial"),
    slug,
    description: getOptStr(raw, "description"),
  };
}

export function mapSanityTag(raw: unknown): Tag {
  if (!isRecord(raw)) {
    return {
      id: "tag-general",
      name: "General",
      slug: "general",
    };
  }

  const slugObj = isRecord(raw.slug) ? raw.slug : undefined;
  const slug = getOptStr(slugObj, "current") || getStr(raw, "slug", "tag");

  return {
    id: getStr(raw, "id") || getStr(raw, "_id") || "tag-id",
    name: getStr(raw, "name", "Tag"),
    slug,
  };
}

// ------------------------------------------------------------------
// EDITORIAL BLOCK MAPPER
// ------------------------------------------------------------------

/**
 * Normalizes raw Portable Text or HTML block strings into RichTextBlock.
 */
function normalizeRichTextHtml(rawBlock: RawRecord): string {
  const html = getOptStr(rawBlock, "html");
  if (html) {
    return html;
  }

  const blocks = Array.isArray(rawBlock.portableText)
    ? rawBlock.portableText
    : Array.isArray(rawBlock.body)
    ? rawBlock.body
    : null;

  if (blocks) {
    return blocks
      .map((b) => {
        if (isRecord(b) && b._type === "block" && Array.isArray(b.children)) {
          const text = b.children
            .map((c) => (isRecord(c) ? getStr(c, "text") : ""))
            .join("");
          return `<p>${text}</p>`;
        }
        return "";
      })
      .filter(Boolean)
      .join("");
  }

  const text = getOptStr(rawBlock, "text");
  if (text) {
    return `<p>${text}</p>`;
  }

  return "<p></p>";
}

export function mapSanityEditorialBlock(raw: unknown): EditorialBlock | null {
  if (!isRecord(raw) || typeof raw._type !== "string") return null;

  switch (raw._type) {
    case "blockRichtext":
    case "richtext":
      return {
        type: "richtext",
        html: normalizeRichTextHtml(raw),
      };

    case "blockHeading":
    case "heading": {
      const numLevel = getNum(raw, "level");
      const level = (numLevel && numLevel >= 1 && numLevel <= 6) ? (numLevel as 1 | 2 | 3 | 4 | 5 | 6) : 2;
      return {
        type: "heading",
        level,
        text: getStr(raw, "text", "Heading"),
      };
    }

    case "blockImage":
    case "image":
      return {
        type: "image",
        asset: mapSanityMediaAsset(raw.asset || raw),
        caption: getOptStr(raw, "caption"),
      };

    case "blockPullquote":
    case "pullquote":
      return {
        type: "pullquote",
        quote: getStr(raw, "quote"),
        attribution: getOptStr(raw, "attribution"),
      };

    case "blockDivider":
    case "divider":
      return {
        type: "divider",
      };

    case "blockSplit":
    case "split":
      return {
        type: "split",
        image: mapSanityMediaAsset(raw.image || raw.asset),
        text: getStr(raw, "text"),
        imagePosition: raw.imagePosition === "right" ? "right" : "left",
      };

    case "blockGallery":
    case "gallery": {
      const cols = getNum(raw, "columns");
      const columns = (cols === 2 || cols === 3 || cols === 4) ? cols : 2;
      return {
        type: "gallery",
        assets: Array.isArray(raw.assets) ? raw.assets.map(mapSanityMediaAsset) : [],
        columns,
      };
    }

    default:
      return null;
  }
}

// ------------------------------------------------------------------
// SEO METADATA MAPPER
// ------------------------------------------------------------------

export function mapSanitySeoMetadata(raw: unknown): SeoMetadata {
  if (!isRecord(raw)) return {};

  return {
    title: getOptStr(raw, "title"),
    description: getOptStr(raw, "description"),
    canonicalUrl: getOptStr(raw, "canonicalUrl"),
    noIndex: Boolean(raw.noIndex),
  };
}

// ------------------------------------------------------------------
// DOMAIN MODEL MAPPERS
// ------------------------------------------------------------------

export function mapSanityJournalArticle(raw: unknown): JournalArticle | null {
  if (!isRecord(raw)) return null;

  const rawBlocks = Array.isArray(raw.body) ? raw.body : [];
  const bodyBlocks = rawBlocks
    .map(mapSanityEditorialBlock)
    .filter((b): b is EditorialBlock => b !== null);

  const slugObj = isRecord(raw.slug) ? raw.slug : undefined;
  const slug = getOptStr(slugObj, "current") || getStr(raw, "slug", "article-slug");

  return {
    id: getStr(raw, "id") || getStr(raw, "_id") || "article-id",
    slug,
    title: getStr(raw, "title", "Untitled Article"),
    description: getOptStr(raw, "description"),
    excerpt: getStr(raw, "excerpt"),
    status: raw.status === "draft" ? "draft" : raw.status === "archived" ? "archived" : "published",
    publishedAt: getOptStr(raw, "publishedAt") ?? null,
    updatedAt: getStr(raw, "updatedAt") || getStr(raw, "_updatedAt") || new Date().toISOString(),
    featuredMedia: mapSanityMediaAsset(raw.featuredMedia),
    author: mapSanityContributor(raw.author),
    contributors: Array.isArray(raw.contributors) ? raw.contributors.map(mapSanityContributor) : undefined,
    category: mapSanityCategory(raw.category),
    tags: Array.isArray(raw.tags) ? raw.tags.map(mapSanityTag) : undefined,
    body: bodyBlocks,
    seo: mapSanitySeoMetadata(raw.seo),
  };
}

export function mapSanityJournalArticleSummary(raw: unknown): JournalArticleSummary {
  const article = mapSanityJournalArticle(raw)!;
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    featuredMedia: article.featuredMedia,
    author: article.author,
    category: article.category,
    tags: article.tags,
    publishedAt: article.publishedAt,
    status: article.status,
  };
}

export function mapSanityLookbook(raw: unknown): Lookbook | null {
  if (!isRecord(raw)) return null;

  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems.map((item: unknown, index: number) => {
    const itemRec = isRecord(item) ? item : {};
    return {
      id: getStr(itemRec, "id") || getStr(itemRec, "_key") || `look-${index}`,
      media: mapSanityMediaAsset(itemRec.media || itemRec),
      caption: getOptStr(itemRec, "caption"),
      order: getNum(itemRec, "order") ?? index + 1,
    };
  });

  const colRec = isRecord(raw.collection) ? raw.collection : undefined;
  const colSlugRec = colRec && isRecord(colRec.slug) ? colRec.slug : undefined;
  const collectionRef: CollectionReference | undefined = colRec
    ? {
        id: getStr(colRec, "id") || getStr(colRec, "_id") || "col-id",
        slug: getOptStr(colSlugRec, "current") || getStr(colRec, "slug", "col-slug"),
        title: getStr(colRec, "title", "Collection"),
      }
    : undefined;

  const slugObj = isRecord(raw.slug) ? raw.slug : undefined;

  return {
    id: getStr(raw, "id") || getStr(raw, "_id") || "lookbook-id",
    slug: getOptStr(slugObj, "current") || getStr(raw, "slug", "lookbook-slug"),
    title: getStr(raw, "title", "Untitled Lookbook"),
    description: getOptStr(raw, "description"),
    status: raw.status === "draft" ? "draft" : raw.status === "archived" ? "archived" : "published",
    publishedAt: getOptStr(raw, "publishedAt") ?? null,
    updatedAt: getStr(raw, "updatedAt") || getStr(raw, "_updatedAt") || new Date().toISOString(),
    coverMedia: mapSanityMediaAsset(raw.coverMedia),
    items,
    season: getOptStr(raw, "season"),
    collection: collectionRef,
    seo: mapSanitySeoMetadata(raw.seo),
  };
}

export function mapSanityLookbookSummary(raw: unknown): LookbookSummary {
  const lookbook = mapSanityLookbook(raw)!;
  return {
    id: lookbook.id,
    slug: lookbook.slug,
    title: lookbook.title,
    description: lookbook.description,
    coverMedia: lookbook.coverMedia,
    season: lookbook.season,
    collection: lookbook.collection,
    publishedAt: lookbook.publishedAt,
    status: lookbook.status,
  };
}

export function mapSanityAboutPage(raw: unknown): AboutPage | null {
  if (!isRecord(raw)) return null;

  const rawBlocks = Array.isArray(raw.body) ? raw.body : [];
  const bodyBlocks = rawBlocks
    .map(mapSanityEditorialBlock)
    .filter((b): b is EditorialBlock => b !== null);

  const slugObj = isRecord(raw.slug) ? raw.slug : undefined;

  return {
    id: getStr(raw, "id") || getStr(raw, "_id") || "about-singleton",
    slug: getOptStr(slugObj, "current") || getStr(raw, "slug", "about"),
    title: getStr(raw, "title", "About GENSIS"),
    description: getOptStr(raw, "description"),
    intro: getStr(raw, "intro"),
    status: raw.status === "draft" ? "draft" : raw.status === "archived" ? "archived" : "published",
    publishedAt: getOptStr(raw, "publishedAt") ?? null,
    updatedAt: getStr(raw, "updatedAt") || getStr(raw, "_updatedAt") || new Date().toISOString(),
    media: raw.media ? mapSanityMediaAsset(raw.media) : undefined,
    body: bodyBlocks,
    seo: mapSanitySeoMetadata(raw.seo),
  };
}

export function mapSanityCampaign(raw: unknown): Campaign | null {
  if (!isRecord(raw)) return null;

  const rawBlocks = Array.isArray(raw.body) ? raw.body : [];
  const bodyBlocks = rawBlocks
    .map(mapSanityEditorialBlock)
    .filter((b): b is EditorialBlock => b !== null);

  const productRefs: ProductReference[] | undefined = Array.isArray(raw.products)
    ? raw.products.map((p: unknown) => {
        const pRec = isRecord(p) ? p : {};
        const pSlugRec = isRecord(pRec.slug) ? pRec.slug : undefined;
        return {
          id: getStr(pRec, "id") || getStr(pRec, "_id") || "prod-id",
          slug: getOptStr(pSlugRec, "current") || getStr(pRec, "slug", "prod-slug"),
          title: getStr(pRec, "title", "Product"),
        };
      })
    : undefined;

  const collectionRefs: CollectionReference[] | undefined = Array.isArray(raw.collections)
    ? raw.collections.map((c: unknown) => {
        const cRec = isRecord(c) ? c : {};
        const cSlugRec = isRecord(cRec.slug) ? cRec.slug : undefined;
        return {
          id: getStr(cRec, "id") || getStr(cRec, "_id") || "col-id",
          slug: getOptStr(cSlugRec, "current") || getStr(cRec, "slug", "col-slug"),
          title: getStr(cRec, "title", "Collection"),
        };
      })
    : undefined;

  const slugObj = isRecord(raw.slug) ? raw.slug : undefined;

  return {
    id: getStr(raw, "id") || getStr(raw, "_id") || "campaign-id",
    slug: getOptStr(slugObj, "current") || getStr(raw, "slug", "campaign-slug"),
    title: getStr(raw, "title", "Untitled Campaign"),
    description: getOptStr(raw, "description"),
    status: raw.status === "draft" ? "draft" : raw.status === "archived" ? "archived" : "published",
    publishedAt: getOptStr(raw, "publishedAt") ?? null,
    updatedAt: getStr(raw, "updatedAt") || getStr(raw, "_updatedAt") || new Date().toISOString(),
    heroMedia: mapSanityMediaAsset(raw.heroMedia),
    body: bodyBlocks,
    products: productRefs,
    collections: collectionRefs,
    seo: mapSanitySeoMetadata(raw.seo),
  };
}

export function mapSanityCampaignSummary(raw: unknown): CampaignSummary {
  const campaign = mapSanityCampaign(raw)!;
  return {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    description: campaign.description,
    heroMedia: campaign.heroMedia,
    publishedAt: campaign.publishedAt,
    status: campaign.status,
  };
}
