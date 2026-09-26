import { defineType, defineField } from "../helpers";

/**
 * About Page Document Schema (Singleton)
 *
 * Maps to the GENSIS AboutPage domain model.
 * This document type is a singleton — only one record should exist in Sanity.
 * The GROQ query uses [0] to fetch the first (and only) record.
 *
 * Singleton behavior is enforced via Studio configuration (see studio/config.ts):
 * the "Create New" action is hidden and the document is accessed via a fixed link.
 *
 * Status semantics follow the GENSIS ContentStatus union:
 *   draft | published | archived
 */
export const aboutPageSchema = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        slugify: () => "about",
      },
      description: "Fixed to 'about' — this is a singleton page.",
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
      description: "Brief brand description used in SEO fallback.",
    }),
    defineField({
      name: "intro",
      title: "Introduction Text",
      type: "text",
      description: "Editorial introduction paragraph shown above body content.",
    }),
    defineField({
      name: "publishedAt",
      title: "Publish Date",
      type: "datetime",
    }),
    defineField({
      name: "media",
      title: "Featured Media",
      type: "mediaAsset",
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
    select: { title: "title", subtitle: "status" },
  },
});
