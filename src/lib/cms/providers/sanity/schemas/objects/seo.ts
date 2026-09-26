import { defineType, defineField } from "../helpers";

export const seoSchema = defineType({
  name: "seo",
  title: "SEO Metadata",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Meta Title",
      type: "string",
      description: "Custom SEO title. If omitted, page title is used.",
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: "description",
      title: "Meta Description",
      type: "text",
      description: "Search engine snippet summary.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
      description: "Preferred URL for indexing.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from Search Engines (noindex)",
      type: "boolean",
      description: "Instruct search engines not to index this page.",
      initialValue: false,
    }),
  ],
});
