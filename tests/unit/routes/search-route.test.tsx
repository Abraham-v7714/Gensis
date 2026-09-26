import { describe, it, expect } from "vitest";
import { generateMetadata } from "@/app/search/page";

describe("Search Route Metadata", () => {
  it("enforces noIndex: true for search page metadata", async () => {
    const meta = await generateMetadata({ searchParams: Promise.resolve({ q: "coat" }) });
    expect(meta.robots).toEqual(
      expect.objectContaining({
        index: false,
        follow: false,
      })
    );
    expect(meta.title).toBe("Search: \"coat\" | GENSIS");
  });
});
