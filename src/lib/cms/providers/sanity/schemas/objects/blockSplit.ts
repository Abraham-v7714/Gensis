import { defineType, defineField } from "../helpers";

export const blockSplitSchema = defineType({
  name: "blockSplit",
  title: "Split Content Block",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "mediaAsset",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "text",
      title: "Content Text",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imagePosition",
      title: "Image Position",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
    }),
  ],
});
