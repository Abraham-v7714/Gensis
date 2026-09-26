import { describe, it, expect } from "vitest";
import { parse, evaluate } from "groq-js";

describe("Sanity Storefront GROQ Queries - Draft Exclusion", () => {
  it("enforces both status == 'published' AND drafts.** exclusion conceptually", async () => {
    // 1. Setup the 4 cases from Stage 4.3 instructions
    const dataset = [
      {
        _type: "journalArticle",
        _id: "seed-article-draft",
        status: "draft", // Case A
        title: "Case A",
      },
      {
        _type: "journalArticle",
        _id: "drafts.seed-article-1",
        status: "published", // Case B (Sanity draft of a published doc)
        title: "Case B",
      },
      {
        _type: "journalArticle",
        _id: "drafts.seed-article-1",
        status: "draft", // Case C (Sanity draft of a draft doc)
        title: "Case C",
      },
      {
        _type: "journalArticle",
        _id: "seed-article-1",
        status: "published", // Case D (Normal published doc)
        title: "Case D",
      },
    ];

    // 2. Evaluate the filter logic from the GROQ query
    // We isolate the filter because groq-js parser does not support dynamic slice parameters ($offset...$limit)
    const filterQuery = '*[_type == "journalArticle" && !(_id in path("drafts.**")) && status == "published"]';
    const parsed = parse(filterQuery);
    const result = await evaluate(parsed, { dataset });
    const docs = await result.get();

    // 3. Assertions
    // Only Case D should be returned
    expect(docs).toHaveLength(1);
    expect(docs[0]._id).toBe("seed-article-1");
    expect(docs[0].status).toBe("published");
    expect(docs[0].title).toBe("Case D");

    // Explicit exclusions check
    const returnedIds = docs.map((d: Record<string, unknown>) => d._id);
    expect(returnedIds).not.toContain("seed-article-draft"); // Case A excluded (status)
    expect(returnedIds).not.toContain("drafts.seed-article-1"); // Case B & C excluded (path)
  });
});

