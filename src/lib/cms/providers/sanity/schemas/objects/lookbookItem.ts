import { defineType, defineField } from "../helpers";

export const lookbookItemSchema = defineType({
  name: "lookbookItem",
  title: "Lookbook Item",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Item Identifier",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "media",
      title: "Media Asset",
      type: "mediaAsset",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
