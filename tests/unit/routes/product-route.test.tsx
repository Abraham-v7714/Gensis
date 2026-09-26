import { describe, it, expect } from "vitest";
import { generateMetadata as generateProductMetadata } from "@/app/products/[slug]/page";

describe("Product Route Metadata", () => {
  it("generates fallback metadata when commerce is unconfigured", async () => {
    const meta = await generateProductMetadata({ params: Promise.resolve({ slug: "minimal-coat" }) });
    expect(meta.title).toBe("Product — minimal-coat | GENSIS");
  });
});
