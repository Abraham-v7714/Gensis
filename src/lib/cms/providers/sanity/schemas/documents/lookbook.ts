import { defineType, defineField } from "../helpers";

/**
 * Lookbook Document Schema
 *
 * Maps to the GENSIS Lookbook domain model.
 * All field names align with GROQ queries in queries.ts and mapper.ts.
 *
 * Status semantics follow the GENSIS ContentStatus union:
 *   draft | published | archived
 */
export const lookbookSchema = defineType({
  name: "lookbook",
  title: "Lookbook",
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
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "season",
      title: "Season / Collection Year",
      type: "string",
      description: "e.g. AW 2026, SS 2027",
    }),
    defineField({
      name: "publishedAt",
      title: "Publish Date",
      type: "datetime",
    }),
    defineField({
      name: "coverMedia",
      title: "Cover Image",
      type: "mediaAsset",
    }),
    defineField({
      name: "items",
      title: "Lookbook Items",
      type: "array",
      of: [{ type: "lookbookItem" }],
    }),
    defineField({
      name: "collection",
      title: "Associated Collection",
      type: "collectionReference",
    }),
    defineField({
      name: "seo",
      title: "SEO Metadata",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "season" },
  },
});
