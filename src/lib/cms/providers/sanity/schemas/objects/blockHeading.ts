import { defineType, defineField } from "../helpers";

export const blockHeadingSchema = defineType({
  name: "blockHeading",
  title: "Heading Block",
  type: "object",
  fields: [
    defineField({
      name: "level",
      title: "Heading Level (1-6)",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(6),
      initialValue: 2,
    }),
    defineField({
      name: "text",
      title: "Heading Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
