import { describe, it, expect } from "vitest";
import nextConfig from "@/../next.config";

describe("Security Headers Policy (Stage 4.16)", () => {
  it("defines headers method on nextConfig", () => {
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("configures essential production security headers", async () => {
    if (!nextConfig.headers) {
      throw new Error("headers method is not defined on nextConfig");
    }

    const headerEntries = await nextConfig.headers();
    expect(headerEntries.length).toBeGreaterThan(0);

    const rootHeaders = headerEntries.find((entry) => entry.source === "/(.*)");
    expect(rootHeaders).toBeDefined();

    const headersMap = new Map(
      rootHeaders?.headers.map((h) => [h.key.toLowerCase(), h.value])
    );

    // X-Content-Type-Options
    expect(headersMap.get("x-content-type-options")).toBe("nosniff");

    // Referrer-Policy
    expect(headersMap.get("referrer-policy")).toBe("strict-origin-when-cross-origin");

    // Frame protection
    expect(headersMap.get("x-frame-options")).toBe("SAMEORIGIN");

    // Permissions Policy
    expect(headersMap.get("permissions-policy")).toBeDefined();
    expect(headersMap.get("permissions-policy")).toContain("camera=()");

    // DNS prefetch
    expect(headersMap.get("x-dns-prefetch-control")).toBe("on");
  });
});
