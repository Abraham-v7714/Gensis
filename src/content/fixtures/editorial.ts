/**
 * CMS Editorial Content Block Fixtures (Development/Test Only)
 *
 * Reusable provider-neutral EditorialBlock fixtures covering all block variants.
 * Used for development preview and component testing.
 */

import type {
  RichTextBlock,
  HeadingBlock,
  ImageBlock,
  PullQuoteBlock,
  DividerBlock,
  SplitBlock,
  GalleryBlock,
  EditorialBlock,
} from "@/types/cms";
import { mediaFixtures } from "./media";

export const richtextFixture: RichTextBlock = {
  type: "richtext",
  html: "<p>This is a <strong>development fixture</strong> demonstrating formatted body text rendering within an editorial article layout.</p>",
};

export const headingFixture: HeadingBlock = {
  type: "heading",
  level: 2,
  text: "Fixture Section: Architectural Proportions",
};

export const imageFixture: ImageBlock = {
  type: "image",
  asset: mediaFixtures.landscape,
  caption: "Development fixture caption: Architectural proportion sample.",
};

export const pullquoteFixture: PullQuoteBlock = {
  type: "pullquote",
  quote: "Form is not imposed upon material, but discovered through restrained manipulation.",
  attribution: "Fictional Design Notes (Fixture)",
};

export const dividerFixture: DividerBlock = {
  type: "divider",
};

export const splitFixture: SplitBlock = {
  type: "split",
  image: mediaFixtures.portrait,
  text: "Development fixture split text: Juxtaposing structural lines with tactile material flow.",
  imagePosition: "left",
};

export const galleryFixture: GalleryBlock = {
  type: "gallery",
  assets: [mediaFixtures.portrait, mediaFixtures.landscape, mediaFixtures.square],
  columns: 3,
};

export const editorialFixtures: EditorialBlock[] = [
  headingFixture,
  richtextFixture,
  imageFixture,
  dividerFixture,
  pullquoteFixture,
  splitFixture,
  galleryFixture,
];
