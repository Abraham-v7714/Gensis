/**
 * Sanity Schema Registry Tests — Stage 4.1
 *
 * Verifies:
 *   - All 7 required document types are registered
 *   - All 7 editorial block types are registered
 *   - Reusable object schemas are registered
 *   - No duplicate schema names exist
 *   - Stable schema name constants are intact
 *   - GROQ-compatible schema names match constants
 */

import { describe, it, expect } from "vitest";
import {
  schemaTypes,
  SANITY_DOCUMENT_TYPES,
  SANITY_BLOCK_TYPES,
} from "@/lib/cms/providers/sanity/schemas";

describe("Sanity Schema Registry", () => {
  const schemaNames = schemaTypes.map((s) => s.name);

  // ----------------------------------------------------------------
  // Document type registration
  // ----------------------------------------------------------------
  describe("Document types", () => {
    const requiredDocuments = [
      "journalArticle",
      "lookbook",
      "campaign",
      "aboutPage",
      "category",
      "tag",
      "contributor",
    ];

    it("registers all 7 required document types", () => {
      for (const docType of requiredDocuments) {
        expect(schemaNames).toContain(docType);
      }
    });

    it("marks all document types with type: 'document'", () => {
      const documentSchemas = schemaTypes.filter((s) =>
        requiredDocuments.includes(s.name)
      );
      expect(documentSchemas).toHaveLength(7);
      for (const schema of documentSchemas) {
        expect(schema.type).toBe("document");
      }
    });
  });

  // ----------------------------------------------------------------
  // Editorial block object registration
  // ----------------------------------------------------------------
  describe("Editorial block types", () => {
    const requiredBlocks = [
      "blockRichtext",
      "blockHeading",
      "blockImage",
      "blockPullquote",
      "blockDivider",
      "blockSplit",
      "blockGallery",
    ];

    it("registers all 7 editorial block object types", () => {
      for (const blockType of requiredBlocks) {
        expect(schemaNames).toContain(blockType);
      }
    });

    it("marks all block types with type: 'object'", () => {
      const blockSchemas = schemaTypes.filter((s) =>
        requiredBlocks.includes(s.name)
      );
      expect(blockSchemas).toHaveLength(7);
      for (const schema of blockSchemas) {
        expect(schema.type).toBe("object");
      }
    });
  });

  // ----------------------------------------------------------------
  // Reusable object registration
  // ----------------------------------------------------------------
  describe("Reusable object types", () => {
    it("registers the seo object schema", () => {
      expect(schemaNames).toContain("seo");
    });

    it("registers the mediaAsset object schema", () => {
      expect(schemaNames).toContain("mediaAsset");
    });

    it("registers the lookbookItem object schema", () => {
      expect(schemaNames).toContain("lookbookItem");
    });

    it("registers productReference and collectionReference stubs", () => {
      expect(schemaNames).toContain("productReference");
      expect(schemaNames).toContain("collectionReference");
    });
  });

  // ----------------------------------------------------------------
  // No duplicate names
  // ----------------------------------------------------------------
  describe("Schema name uniqueness", () => {
    it("has no duplicate schema names in the registry", () => {
      const uniqueNames = new Set(schemaNames);
      expect(uniqueNames.size).toBe(schemaNames.length);
    });
  });

  // ----------------------------------------------------------------
  // GROQ-compatible constant names
  // ----------------------------------------------------------------
  describe("SANITY_DOCUMENT_TYPES constants", () => {
    it("constants match registered document schema names", () => {
      expect(schemaNames).toContain(SANITY_DOCUMENT_TYPES.JOURNAL_ARTICLE);
      expect(schemaNames).toContain(SANITY_DOCUMENT_TYPES.LOOKBOOK);
      expect(schemaNames).toContain(SANITY_DOCUMENT_TYPES.CAMPAIGN);
      expect(schemaNames).toContain(SANITY_DOCUMENT_TYPES.ABOUT_PAGE);
      expect(schemaNames).toContain(SANITY_DOCUMENT_TYPES.CATEGORY);
      expect(schemaNames).toContain(SANITY_DOCUMENT_TYPES.TAG);
      expect(schemaNames).toContain(SANITY_DOCUMENT_TYPES.CONTRIBUTOR);
    });
  });

  describe("SANITY_BLOCK_TYPES constants", () => {
    it("constants match registered block schema names", () => {
      expect(schemaNames).toContain(SANITY_BLOCK_TYPES.RICHTEXT);
      expect(schemaNames).toContain(SANITY_BLOCK_TYPES.HEADING);
      expect(schemaNames).toContain(SANITY_BLOCK_TYPES.IMAGE);
      expect(schemaNames).toContain(SANITY_BLOCK_TYPES.PULLQUOTE);
      expect(schemaNames).toContain(SANITY_BLOCK_TYPES.DIVIDER);
      expect(schemaNames).toContain(SANITY_BLOCK_TYPES.SPLIT);
      expect(schemaNames).toContain(SANITY_BLOCK_TYPES.GALLERY);
    });
  });

  // ----------------------------------------------------------------
  // Key schema field presence
  // ----------------------------------------------------------------
  describe("Schema field verification", () => {
    it("journalArticle schema has required editorial fields", () => {
      const schema = schemaTypes.find((s) => s.name === "journalArticle");
      expect(schema).toBeDefined();
      const fieldNames = schema!.fields.map((f) => f.name);
      expect(fieldNames).toContain("title");
      expect(fieldNames).toContain("slug");
      expect(fieldNames).toContain("status");
      expect(fieldNames).toContain("body");
      expect(fieldNames).toContain("seo");
    });

    it("aboutPage schema has singleton-compatible slug and status", () => {
      const schema = schemaTypes.find((s) => s.name === "aboutPage");
      expect(schema).toBeDefined();
      const fieldNames = schema!.fields.map((f) => f.name);
      expect(fieldNames).toContain("slug");
      expect(fieldNames).toContain("status");
      expect(fieldNames).toContain("intro");
    });

    it("seo schema supports title, description, canonicalUrl, noIndex", () => {
      const schema = schemaTypes.find((s) => s.name === "seo");
      expect(schema).toBeDefined();
      const fieldNames = schema!.fields.map((f) => f.name);
      expect(fieldNames).toContain("title");
      expect(fieldNames).toContain("description");
      expect(fieldNames).toContain("canonicalUrl");
      expect(fieldNames).toContain("noIndex");
    });

    it("mediaAsset schema supports alt, caption, credit, url", () => {
      const schema = schemaTypes.find((s) => s.name === "mediaAsset");
      expect(schema).toBeDefined();
      const fieldNames = schema!.fields.map((f) => f.name);
      expect(fieldNames).toContain("alt");
      expect(fieldNames).toContain("caption");
      expect(fieldNames).toContain("credit");
      expect(fieldNames).toContain("url");
    });

    it("blockHeading has level and text fields", () => {
      const schema = schemaTypes.find((s) => s.name === "blockHeading");
      expect(schema).toBeDefined();
      const fieldNames = schema!.fields.map((f) => f.name);
      expect(fieldNames).toContain("level");
      expect(fieldNames).toContain("text");
    });

    it("blockGallery has assets and columns fields", () => {
      const schema = schemaTypes.find((s) => s.name === "blockGallery");
      expect(schema).toBeDefined();
      const fieldNames = schema!.fields.map((f) => f.name);
      expect(fieldNames).toContain("assets");
      expect(fieldNames).toContain("columns");
    });
  });
});
