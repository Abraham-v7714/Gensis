import { defineType, defineField } from "../helpers";

export const blockDividerSchema = defineType({
  name: "blockDivider",
  title: "Divider Block",
  type: "object",
  fields: [
    defineField({
      name: "style",
      title: "Divider Style",
      type: "string",
      options: {
        list: [
          { title: "Standard Rule", value: "line" },
          { title: "Spacing Only", value: "space" },
        ],
      },
      initialValue: "line",
    }),
  ],
});
