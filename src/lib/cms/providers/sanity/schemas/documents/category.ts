import { defineType, defineField } from "../helpers";

export const categorySchema = defineType({
  name: "category",
  title: "Category",
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
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Brief editorial description of this category.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current" },
  },
});
