import { defineType, defineField } from "../helpers";

export const contributorSchema = defineType({
  name: "contributor",
  title: "Contributor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Title",
      type: "string",
      description: "e.g. Photographer, Writer, Creative Director",
    }),
    defineField({
      name: "bio",
      title: "Short Biography",
      type: "text",
    }),
    defineField({
      name: "avatar",
      title: "Avatar / Portrait",
      type: "mediaAsset",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role" },
  },
});
