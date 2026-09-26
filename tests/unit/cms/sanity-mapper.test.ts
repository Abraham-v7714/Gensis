import { describe, it, expect } from "vitest";
import {
  mapSanityMediaAsset,
  mapSanityContributor,
  mapSanityCategory,
  mapSanityTag,
  mapSanityEditorialBlock,
  mapSanityJournalArticle,
  mapSanityLookbook,
  mapSanityAboutPage,
  mapSanityCampaign,
} from "@/lib/cms/providers/sanity/mapper";

describe("Sanity Response Mapper", () => {
  it("maps raw Sanity media asset object safely", () => {
    const rawAsset = {
      id: "media-1",
      url: "https://cdn.sanity.io/images/proj/ds/img.jpg",
      alt: "Sanity image alt text",
      width: 1200,
      height: 800,
      caption: "Sanity caption",
      credit: "Sanity credit",
    };

    const media = mapSanityMediaAsset(rawAsset);
    expect(media.id).toBe("media-1");
    expect(media.url).toBe("https://cdn.sanity.io/images/proj/ds/img.jpg");
    expect(media.alt).toBe("Sanity image alt text");
    expect(media.width).toBe(1200);
    expect(media.height).toBe(800);
    expect(media.caption).toBe("Sanity caption");
    expect(media.credit).toBe("Sanity credit");
  });

  it("handles null or missing media asset safely", () => {
    const media = mapSanityMediaAsset(null);
    expect(media.id).toBe("media-fallback");
    expect(media.url).toBe("");
  });

  it("maps Sanity contributor, category, and tag objects", () => {
    const contrib = mapSanityContributor({
      _id: "contrib-1",
      name: "Sanity Author",
      role: "Editor",
    });
    expect(contrib.id).toBe("contrib-1");
    expect(contrib.name).toBe("Sanity Author");
    expect(contrib.role).toBe("Editor");

    const cat = mapSanityCategory({
      _id: "cat-1",
      name: "Atelier",
      slug: { current: "atelier" },
    });
    expect(cat.id).toBe("cat-1");
    expect(cat.name).toBe("Atelier");
    expect(cat.slug).toBe("atelier");

    const tag = mapSanityTag({
      _id: "tag-1",
      name: "Wool",
      slug: { current: "wool" },
    });
    expect(tag.id).toBe("tag-1");
    expect(tag.slug).toBe("wool");
  });

  it("maps all 7 editorial block types from raw Sanity response shapes", () => {
    const richtextBlock = mapSanityEditorialBlock({
      _type: "blockRichtext",
      html: "<p>Sanity rich text paragraph.</p>",
    });
    expect(richtextBlock).toEqual({
      type: "richtext",
      html: "<p>Sanity rich text paragraph.</p>",
    });

    const portableTextBlock = mapSanityEditorialBlock({
      _type: "blockRichtext",
      portableText: [
        {
          _type: "block",
          children: [{ text: "Converted Portable Text." }],
        },
      ],
    });
    expect(portableTextBlock).toEqual({
      type: "richtext",
      html: "<p>Converted Portable Text.</p>",
    });

    const headingBlock = mapSanityEditorialBlock({
      _type: "blockHeading",
      level: 2,
      text: "Sanity Section Heading",
    });
    expect(headingBlock).toEqual({
      type: "heading",
      level: 2,
      text: "Sanity Section Heading",
    });

    const imageBlock = mapSanityEditorialBlock({
      _type: "blockImage",
      asset: { url: "https://cdn.sanity.io/img.jpg", alt: "Sanity Image" },
      caption: "Image caption",
    });
    expect(imageBlock?.type).toBe("image");

    const pullquoteBlock = mapSanityEditorialBlock({
      _type: "blockPullquote",
      quote: "Sanity quote text",
      attribution: "Author",
    });
    expect(pullquoteBlock).toEqual({
      type: "pullquote",
      quote: "Sanity quote text",
      attribution: "Author",
    });

    const dividerBlock = mapSanityEditorialBlock({ _type: "blockDivider" });
    expect(dividerBlock).toEqual({ type: "divider" });

    const splitBlock = mapSanityEditorialBlock({
      _type: "blockSplit",
      image: { url: "https://cdn.sanity.io/split.jpg", alt: "Split" },
      text: "Split text",
      imagePosition: "right",
    });
    expect(splitBlock?.type).toBe("split");

    const galleryBlock = mapSanityEditorialBlock({
      _type: "blockGallery",
      assets: [{ url: "https://cdn.sanity.io/g1.jpg", alt: "G1" }],
      columns: 3,
    });
    expect(galleryBlock?.type).toBe("gallery");
  });

  it("maps raw Sanity document into normalized JournalArticle model", () => {
    const rawArticle = {
      _id: "sanity-art-1",
      slug: { current: "sanity-article-slug" },
      title: "Sanity Article Title",
      excerpt: "Sanity article excerpt.",
      status: "published",
      publishedAt: "2026-09-01T00:00:00Z",
      featuredMedia: { url: "/img.jpg", alt: "Featured" },
      author: { _id: "a1", name: "Author Name" },
      category: { _id: "c1", name: "Craft", slug: { current: "craft" } },
      body: [{ _type: "blockHeading", level: 2, text: "Body Heading" }],
      seo: { title: "Sanity SEO Title", noIndex: true },
    };

    const article = mapSanityJournalArticle(rawArticle);
    expect(article).not.toBeNull();
    expect(article?.id).toBe("sanity-art-1");
    expect(article?.slug).toBe("sanity-article-slug");
    expect(article?.title).toBe("Sanity Article Title");
    expect(article?.status).toBe("published");
    expect(article?.body).toHaveLength(1);
    expect(article?.seo.title).toBe("Sanity SEO Title");
    expect(article?.seo.noIndex).toBe(true);

    // Verify provider neutrality
    expect(article).not.toHaveProperty("_id");
    expect(article).not.toHaveProperty("_type");
  });

  it("maps raw Sanity document into normalized Lookbook model", () => {
    const rawLookbook = {
      _id: "sanity-look-1",
      slug: { current: "aw26-lookbook" },
      title: "AW26 Lookbook",
      status: "published",
      publishedAt: "2026-08-01T00:00:00Z",
      coverMedia: { url: "/cover.jpg", alt: "Cover" },
      items: [
        { _key: "item-1", media: { url: "/look1.jpg", alt: "Look 1" }, order: 1 },
      ],
      collection: { _id: "col-1", slug: { current: "aw26" }, title: "AW26 Collection" },
      seo: {},
    };

    const lookbook = mapSanityLookbook(rawLookbook);
    expect(lookbook?.id).toBe("sanity-look-1");
    expect(lookbook?.items).toHaveLength(1);
    expect(lookbook?.collection?.title).toBe("AW26 Collection");
  });

  it("maps raw Sanity document into normalized AboutPage singleton model", () => {
    const rawAbout = {
      _id: "about-doc",
      slug: { current: "about" },
      title: "About GENSIS",
      intro: "Brand introduction",
      status: "published",
      publishedAt: "2026-01-01T00:00:00Z",
      body: [{ _type: "blockRichtext", html: "<p>Atelier body text.</p>" }],
      seo: {},
    };

    const about = mapSanityAboutPage(rawAbout);
    expect(about?.title).toBe("About GENSIS");
    expect(about?.intro).toBe("Brand introduction");
    expect(about?.body).toHaveLength(1);
  });

  it("maps raw Sanity document into normalized Campaign model with lightweight references", () => {
    const rawCampaign = {
      _id: "sanity-camp-1",
      slug: { current: "monolith-story" },
      title: "Monolith Story",
      status: "published",
      publishedAt: "2026-07-01T00:00:00Z",
      heroMedia: { url: "/hero.jpg", alt: "Hero" },
      products: [{ _id: "p1", slug: { current: "coat" }, title: "Wool Coat" }],
      collections: [{ _id: "c1", slug: { current: "monolith" }, title: "Monolith Series" }],
      body: [],
      seo: {},
    };

    const campaign = mapSanityCampaign(rawCampaign);
    expect(campaign?.title).toBe("Monolith Story");
    expect(campaign?.products?.[0].title).toBe("Wool Coat");
    expect(campaign?.collections?.[0].title).toBe("Monolith Series");

    // Ensure lightweight references only
    expect(campaign?.products?.[0]).not.toHaveProperty("price");
  });
});
