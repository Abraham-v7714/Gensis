import { defineType, defineField } from "../helpers";

export const productReferenceSchema = defineType({
  name: "productReference",
  title: "Product Reference",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Product ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Product Slug",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Product Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
});

export const collectionReferenceSchema = defineType({
  name: "collectionReference",
  title: "Collection Reference",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Collection ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Collection Slug",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Collection Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
