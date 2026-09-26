import { defineType, defineField } from "../helpers";

export const blockRichtextSchema = defineType({
  name: "blockRichtext",
  title: "Rich Text Block",
  type: "object",
  fields: [
    defineField({
      name: "html",
      title: "Sanitized HTML Content",
      type: "text",
      description: "Sanitized HTML string representation for GENSIS domain rendering.",
    }),
    defineField({
      name: "portableText",
      title: "Portable Text Blocks",
      type: "array",
      of: [{ type: "block" }],
      description: "Structured Portable Text array for Sanity Studio rich text authoring.",
    }),
  ],
});
