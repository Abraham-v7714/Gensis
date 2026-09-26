/**
 * CMS Cache Tag Strategy — Stage 4.5
 *
 * Defines deterministic, provider-neutral cache tags and mapping functions
 * for Next.js on-demand revalidation.
 */

export const CMS_TAGS = {
  all: () => "cms",
  journalCollection: () => "cms:journal",
  journalArticle: (slug: string) => `cms:journal:${slug}`,
  lookbookCollection: () => "cms:lookbooks",
  lookbookItem: (slug: string) => `cms:lookbook:${slug}`,
  campaignCollection: () => "cms:campaigns",
  campaignItem: (slug: string) => `cms:campaign:${slug}`,
  about: () => "cms:about",
} as const;

/**
 * Maps a Sanity document payload (type, slug, previous slug) to affected cache tags.
 * Handles slug changes by invalidating both previous and current tags.
 */
export function getTagsForDocument(
  docType: string,
  slug?: string | null,
  slugPrevious?: string | null
): string[] {
  const tags: string[] = [];

  switch (docType) {
    case "journalArticle": {
      tags.push(CMS_TAGS.journalCollection());
      if (slug) {
        tags.push(CMS_TAGS.journalArticle(slug));
      }
      if (slugPrevious && slugPrevious !== slug) {
        tags.push(CMS_TAGS.journalArticle(slugPrevious));
      }
      break;
    }
    case "lookbook": {
      tags.push(CMS_TAGS.lookbookCollection());
      if (slug) {
        tags.push(CMS_TAGS.lookbookItem(slug));
      }
      if (slugPrevious && slugPrevious !== slug) {
        tags.push(CMS_TAGS.lookbookItem(slugPrevious));
      }
      break;
    }
    case "campaign": {
      tags.push(CMS_TAGS.campaignCollection());
      if (slug) {
        tags.push(CMS_TAGS.campaignItem(slug));
      }
      if (slugPrevious && slugPrevious !== slug) {
        tags.push(CMS_TAGS.campaignItem(slugPrevious));
      }
      break;
    }
    case "aboutPage": {
      tags.push(CMS_TAGS.about());
      break;
    }
    case "category":
    case "tag":
    case "contributor": {
      // Taxonomies affect listing collections
      tags.push(
        CMS_TAGS.journalCollection(),
        CMS_TAGS.lookbookCollection(),
        CMS_TAGS.campaignCollection()
      );
      break;
    }
    default: {
      // Unknown document types fail closed (do not invalidate unrelated cache)
      return [];
    }
  }

  // Filter duplicates
  return Array.from(new Set(tags));
}
