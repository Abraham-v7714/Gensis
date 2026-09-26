import { defineType, defineField } from "../helpers";

export const blockImageSchema = defineType({
  name: "blockImage",
  title: "Editorial Image Block",
  type: "object",
  fields: [
    defineField({
      name: "asset",
      title: "Media Asset",
      type: "mediaAsset",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption Override",
      type: "string",
    }),
  ],
});
