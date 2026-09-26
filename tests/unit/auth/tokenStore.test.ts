import { describe, it, expect } from "vitest";
import { tokenStore } from "@/lib/auth/tokenStore";
import type { SessionTokens } from "@/lib/auth/types";

describe("TokenStore", () => {
  const mockTokens: SessionTokens = {
    accessToken: "at-12345",
    refreshToken: "rt-67890",
    idToken: "idt-abc",
    expiresAt: Date.now() + 3600000,
  };

  it("stores, retrieves, and deletes session tokens in dev environment", async () => {
    const sessionId = "session-test-id-123";

    await tokenStore.set(sessionId, mockTokens);
    const retrieved = await tokenStore.get(sessionId);

    expect(retrieved).toEqual(mockTokens);

    await tokenStore.delete(sessionId);
    const afterDelete = await tokenStore.get(sessionId);

    expect(afterDelete).toBeNull();
  });

  it("throws clear infrastructure dependency error when NODE_ENV is production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      await expect(tokenStore.get("any-session")).rejects.toThrow(
        /GENSIS Auth Infrastructure Dependency/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
