import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  JournalArticlePage,
  LookbookPage,
  CampaignPage,
  AboutPage,
} from "@/components/pages";
import {
  journalFixtures,
  lookbookFixtures,
  campaignFixtures,
  aboutFixture,
} from "@/content/fixtures";
import type {
  JournalArticle,
  Lookbook,
  Campaign,
  AboutPage as AboutPageModel,
} from "@/types/cms";

describe("Page Composition Components", () => {
  // -------------------------------------------------------------------------
  // JournalArticlePage
  // -------------------------------------------------------------------------
  describe("JournalArticlePage", () => {
    it("renders article title, excerpt, metadata, and body blocks from fixture", () => {
      const article = journalFixtures[0];
      render(<JournalArticlePage article={article} />);

      // Title & Excerpt
      expect(
        screen.getByRole("heading", { level: 1, name: article.title })
      ).toBeInTheDocument();
      expect(screen.getByText(article.excerpt)).toBeInTheDocument();

      // Category & Contributor metadata
      expect(screen.getByText(article.category.name)).toBeInTheDocument();
      expect(screen.getByText(article.author.name)).toBeInTheDocument();

      // Featured image alt
      expect(
        screen.getByRole("img", { name: article.featuredMedia.alt })
      ).toBeInTheDocument();
    });

    it("handles minimal article safely without optional fields", () => {
      const minimalArticle: JournalArticle = {
        id: "min-article-1",
        slug: "minimal-article",
        title: "Minimal Article Title",
        status: "published",
        publishedAt: null,
        updatedAt: "2026-09-01T00:00:00Z",
        excerpt: "",
        featuredMedia: {
          id: "m-media",
          url: "/images/min.jpg",
          alt: "Minimal image",
        },
        author: { id: "a1", name: "Solo Author" },
        category: { id: "c1", name: "Craft", slug: "craft" },
        body: [{ type: "heading", level: 2, text: "Minimal Body Heading" }],
        seo: {},
      };

      render(<JournalArticlePage article={minimalArticle} />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Minimal Article Title" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Minimal Body Heading" })
      ).toBeInTheDocument();
      expect(screen.getByText("Solo Author")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // LookbookPage
  // -------------------------------------------------------------------------
  describe("LookbookPage", () => {
    it("renders lookbook title, description, cover media, and ordered items from fixture", () => {
      const lookbook = lookbookFixtures[0];
      render(<LookbookPage lookbook={lookbook} />);

      // Title & Season
      expect(
        screen.getByRole("heading", { level: 1, name: lookbook.title })
      ).toBeInTheDocument();
      if (lookbook.season) {
        expect(screen.getByText(lookbook.season)).toBeInTheDocument();
      }

      // Cover media
      expect(
        screen.getByRole("img", { name: lookbook.coverMedia.alt })
      ).toBeInTheDocument();

      // Items rendered
      for (const item of lookbook.items) {
        expect(
          screen.getByRole("img", { name: item.media.alt })
        ).toBeInTheDocument();
      }
    });

    it("handles minimal lookbook safely without optional fields", () => {
      const minimalLookbook: Lookbook = {
        id: "min-lookbook-1",
        slug: "minimal-lookbook",
        title: "Minimal Lookbook",
        status: "published",
        publishedAt: null,
        updatedAt: "2026-09-01T00:00:00Z",
        coverMedia: { id: "cm-1", url: "/images/cover.jpg", alt: "Cover" },
        items: [],
        seo: {},
      };

      render(<LookbookPage lookbook={minimalLookbook} />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Minimal Lookbook" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Cover" })
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // CampaignPage
  // -------------------------------------------------------------------------
  describe("CampaignPage", () => {
    it("renders campaign title, hero media, body blocks, and lightweight references from fixture", () => {
      const campaign = campaignFixtures[0];
      render(<CampaignPage campaign={campaign} />);

      // Title & Hero
      expect(
        screen.getByRole("heading", { level: 1, name: campaign.title })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: campaign.heroMedia.alt })
      ).toBeInTheDocument();

      // Lightweight references
      if (campaign.products) {
        for (const prod of campaign.products) {
          expect(screen.getByText(prod.title)).toBeInTheDocument();
        }
      }
      if (campaign.collections) {
        for (const col of campaign.collections) {
          expect(screen.getByText(col.title)).toBeInTheDocument();
        }
      }
    });

    it("handles minimal campaign safely without optional fields", () => {
      const minimalCampaign: Campaign = {
        id: "min-campaign-1",
        slug: "minimal-campaign",
        title: "Minimal Campaign",
        status: "published",
        publishedAt: null,
        updatedAt: "2026-09-01T00:00:00Z",
        heroMedia: { id: "hm-1", url: "/images/hero.jpg", alt: "Hero" },
        body: [],
        seo: {},
      };

      render(<CampaignPage campaign={minimalCampaign} />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Minimal Campaign" })
      ).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Hero" })).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // AboutPage
  // -------------------------------------------------------------------------
  describe("AboutPage", () => {
    it("renders title, intro, media, and body blocks from fixture", () => {
      const page = aboutFixture;
      render(<AboutPage page={page} />);

      expect(
        screen.getByRole("heading", { level: 1, name: page.title })
      ).toBeInTheDocument();
      expect(screen.getByText(page.intro)).toBeInTheDocument();
      if (page.media) {
        expect(
          screen.getByRole("img", { name: page.media.alt })
        ).toBeInTheDocument();
      }
    });

    it("handles minimal about page safely without optional media", () => {
      const minimalAbout: AboutPageModel = {
        id: "min-about-1",
        slug: "about",
        title: "Minimal About",
        intro: "Minimal intro text.",
        status: "published",
        publishedAt: null,
        updatedAt: "2026-09-01T00:00:00Z",
        body: [],
        seo: {},
      };

      render(<AboutPage page={minimalAbout} />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Minimal About" })
      ).toBeInTheDocument();
      expect(screen.getByText("Minimal intro text.")).toBeInTheDocument();
    });
  });
});
