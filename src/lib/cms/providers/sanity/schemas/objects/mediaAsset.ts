import { defineType, defineField } from "../helpers";

export const mediaAssetSchema = defineType({
  name: "mediaAsset",
  title: "Media Asset",
  type: "object",
  fields: [
    defineField({
      name: "asset",
      title: "Image File",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "url",
      title: "Direct Media URL",
      type: "url",
      description: "Direct URL fallback if not using Sanity CDN image asset.",
    }),
    defineField({
      name: "alt",
      title: "Alternative Text",
      type: "string",
      description: "Accessibility text description for images.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Editorial image caption text.",
    }),
    defineField({
      name: "credit",
      title: "Credit / Photographer",
      type: "string",
      description: "Attribution for photographer, artist, or agency.",
    }),
    defineField({
      name: "width",
      title: "Intrinsic Width (px)",
      type: "number",
    }),
    defineField({
      name: "height",
      title: "Intrinsic Height (px)",
      type: "number",
    }),
  ],
});
