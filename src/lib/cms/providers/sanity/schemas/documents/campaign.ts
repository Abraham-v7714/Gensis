import { defineType, defineField } from "../helpers";

/**
 * Campaign Document Schema
 *
 * Maps to the GENSIS Campaign domain model.
 * All field names align with GROQ queries in queries.ts and mapper.ts.
 *
 * Status semantics follow the GENSIS ContentStatus union:
 *   draft | published | archived
 *
 * Products and collections use lightweight provider-neutral reference stubs
 * (productReference, collectionReference) as Shopify integration is deferred.
 */
export const campaignSchema = defineType({
  name: "campaign",
  title: "Campaign",
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
      name: "publishedAt",
      title: "Publish Date",
      type: "datetime",
    }),
    defineField({
      name: "heroMedia",
      title: "Hero Image",
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
      name: "products",
      title: "Associated Products",
      type: "array",
      of: [{ type: "productReference" }],
      description: "Lightweight product references (Shopify integration deferred).",
    }),
    defineField({
      name: "collections",
      title: "Associated Collections",
      type: "array",
      of: [{ type: "collectionReference" }],
    }),
    defineField({
      name: "seo",
      title: "SEO Metadata",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
