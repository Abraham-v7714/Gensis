import { defineType, defineField } from "../helpers";

export const tagSchema = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
        slugify: (input: string) =>
          input.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current" },
  },
});
