/**
 * CMS Taxonomy Fixtures (Development/Test Only)
 *
 * Provider-neutral taxonomy fixtures for local development and testing.
 */

import type { Category, Tag } from "@/types/cms";

export const taxonomyFixtures: {
  categories: Category[];
  tags: Tag[];
} = {
  categories: [
    {
      id: "fixture-cat-craft",
      name: "Atelier & Craft (Fixture)",
      slug: "atelier-craft",
      description: "Development fixture category exploring material study and construction.",
    },
    {
      id: "fixture-cat-design",
      name: "Design Philosophy (Fixture)",
      slug: "design-philosophy",
      description: "Development fixture category focusing on aesthetic forms and silhouette theory.",
    },
    {
      id: "fixture-cat-campaigns",
      name: "Campaign Stories (Fixture)",
      slug: "campaign-stories",
      description: "Development fixture category for seasonal image narratives.",
    },
  ],
  tags: [
    {
      id: "fixture-tag-tailoring",
      name: "Tailoring (Fixture)",
      slug: "tailoring",
    },
    {
      id: "fixture-tag-textiles",
      name: "Textiles (Fixture)",
      slug: "textiles",
    },
    {
      id: "fixture-tag-archive",
      name: "Archive (Fixture)",
      slug: "archive",
    },
    {
      id: "fixture-tag-sustainable",
      name: "Materiality (Fixture)",
      slug: "materiality",
    },
  ],
};
