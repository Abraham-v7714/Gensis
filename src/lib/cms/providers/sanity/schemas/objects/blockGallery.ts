import { defineType, defineField } from "../helpers";

export const blockGallerySchema = defineType({
  name: "blockGallery",
  title: "Gallery Block",
  type: "object",
  fields: [
    defineField({
      name: "assets",
      title: "Gallery Images",
      type: "array",
      of: [{ type: "mediaAsset" }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "columns",
      title: "Column Count",
      type: "number",
      options: {
        list: [
          { title: "2 Columns", value: 2 },
          { title: "3 Columns", value: 3 },
          { title: "4 Columns", value: 4 },
        ],
      },
      initialValue: 2,
      validation: (Rule) => Rule.required().min(2).max(4),
    }),
  ],
});
