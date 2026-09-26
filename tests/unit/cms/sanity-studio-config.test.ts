/**
 * Sanity Studio Configuration Tests — Stage 4.2
 *
 * Tests the studio configuration and schema wiring without importing
 * `defineConfig` from `sanity` (which pulls in Studio UI peer deps like
 * styled-components that are not installed in the test environment).
 *
 * Strategy:
 *   - Test schema registry (schemaTypes) directly — this is what matters
 *   - Test createStudioConfig() factory shape (uses schemaTypes, not defineConfig)
 *   - The gensisStudioConfig (defineConfig result) is integration-tested at build time
 */

import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock the sanity package to prevent styled-components dependency from being
// loaded in the jsdom test environment. The defineConfig return value is
// opaque and integration-tested at build time instead.
vi.mock("sanity", () => ({
  defineConfig: (config: unknown) => config,
}));

vi.mock("sanity/structure", () => ({
  structureTool: (opts: unknown) => ({ type: "structure", ...( typeof opts === 'object' ? opts : {}) }),
}));

import { createStudioConfig } from "@/lib/cms/providers/sanity/studio/config";
import {
  schemaTypes,
  SANITY_DOCUMENT_TYPES,
  SANITY_BLOCK_TYPES,
} from "@/lib/cms/providers/sanity/schemas";

describe("Studio Schema Registry (schemaTypes)", () => {
  const schemaNames = schemaTypes.map((s) => s.name);

  it("is non-empty", () => {
    expect(schemaTypes.length).toBeGreaterThan(0);
  });

  it("registers all 7 document types", () => {
    const docs = Object.values(SANITY_DOCUMENT_TYPES);
    for (const name of docs) {
      expect(schemaNames).toContain(name);
    }
  });

  it("registers all 7 editorial block types", () => {
    const blocks = Object.values(SANITY_BLOCK_TYPES);
    for (const name of blocks) {
      expect(schemaNames).toContain(name);
    }
  });

  it("registers reusable objects", () => {
    expect(schemaNames).toContain("seo");
    expect(schemaNames).toContain("mediaAsset");
    expect(schemaNames).toContain("lookbookItem");
    expect(schemaNames).toContain("productReference");
    expect(schemaNames).toContain("collectionReference");
  });

  it("has no duplicate schema names", () => {
    const unique = new Set(schemaNames);
    expect(unique.size).toBe(schemaNames.length);
  });

  it("contains exactly 19 schema entries (7 docs + 3 objects + 2 refs + 7 blocks)", () => {
    expect(schemaTypes.length).toBe(19);
  });
});

describe("createStudioConfig() (backward-compatible factory)", () => {
  let config: ReturnType<typeof createStudioConfig>;

  beforeAll(() => {
    config = createStudioConfig();
  });

  it("returns expected shape", () => {
    expect(config).toMatchObject({
      name: "gensis-studio",
      title: "GENSIS Editorial Studio",
      basePath: "/studio",
    });
  });

  it("projectId is a string", () => {
    expect(typeof config.projectId).toBe("string");
  });

  it("dataset has a sensible default", () => {
    expect(config.dataset).toBeTruthy();
  });

  it("schema.types is the registered schemaTypes array", () => {
    expect(config.schema.types).toBe(schemaTypes);
  });

  it("schema.types has 19 registered entries", () => {
    expect(config.schema.types.length).toBe(19);
  });
});
