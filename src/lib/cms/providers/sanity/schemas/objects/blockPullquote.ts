import { defineType, defineField } from "../helpers";

export const blockPullquoteSchema = defineType({
  name: "blockPullquote",
  title: "Pull Quote Block",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Quote Text",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "attribution",
      title: "Attribution / Author",
      type: "string",
    }),
  ],
});
