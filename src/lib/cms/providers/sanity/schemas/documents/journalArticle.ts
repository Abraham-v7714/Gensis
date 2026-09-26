import { defineType, defineField } from "../helpers";

/**
 * Journal Article Document Schema
 *
 * Maps to the GENSIS JournalArticle domain model.
 * All field names align with GROQ queries in queries.ts and mapper.ts.
 *
 * Status semantics:
 *   - "draft"     : in progress, not publicly visible
 *   - "published" : live and visible on /journal/[slug]
 *   - "archived"  : previously published, removed from listings
 *
 * Note: Sanity's own document publishing lifecycle (_id prefix "__drafts.")
 * is a separate internal mechanism. The "status" field here reflects the
 * GENSIS content lifecycle independent of Sanity's draft system.
 */
export const journalArticleSchema = defineType({
  name: "journalArticle",
  title: "Journal Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        slugify: (input: string) =>
          input.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Content Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      description: "Short summary shown in listing cards.",
      validation: (Rule) => Rule.max(280),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Longer editorial description used in SEO fallback.",
    }),
    defineField({
      name: "publishedAt",
      title: "Publish Date",
      type: "datetime",
    }),
    defineField({
      name: "featuredMedia",
      title: "Featured Image",
      type: "mediaAsset",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "contributor" }],
    }),
    defineField({
      name: "contributors",
      title: "Additional Contributors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "contributor" }] }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    }),
    defineField({
      name: "body",
      title: "Body Blocks",
      type: "array",
      of: [
        { type: "blockRichtext" },
        { type: "blockHeading" },
        { type: "blockImage" },
        { type: "blockPullquote" },
        { type: "blockDivider" },
        { type: "blockSplit" },
        { type: "blockGallery" },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO Metadata",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", status: "status" },
  },
});
