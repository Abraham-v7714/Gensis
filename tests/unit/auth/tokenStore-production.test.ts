import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tokenStore, setTokenStore, TokenStore } from "@/lib/auth/tokenStore";
import type { SessionTokens } from "@/lib/auth/types";

describe("Production TokenStore Boundary (Stage 4.16)", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    setTokenStore(null); // Reset to default
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    setTokenStore(null);
    process.env.NODE_ENV = originalEnv;
  });

  const mockTokens: SessionTokens = {
    accessToken: "shpat_customer_token",
    refreshToken: "shpat_refresh_token",
    idToken: "id_token_xyz",
    expiresAt: Date.now() + 3600000,
  };

  it("operates normally with in-memory store in development/test", async () => {
    process.env.NODE_ENV = "test";

    await tokenStore.set("session_123", mockTokens);
    const retrieved = await tokenStore.get("session_123");
    expect(retrieved?.accessToken).toBe("shpat_customer_token");

    await tokenStore.delete("session_123");
    const afterDelete = await tokenStore.get("session_123");
    expect(afterDelete).toBeNull();
  });

  it("fails closed in production if no persistent TokenStore adapter is configured", async () => {
    process.env.NODE_ENV = "production";

    await expect(tokenStore.get("session_123")).rejects.toThrow(
      /Production persistent token store is not configured/
    );

    await expect(tokenStore.set("session_123", mockTokens)).rejects.toThrow(
      /Production persistent token store is not configured/
    );

    await expect(tokenStore.delete("session_123")).rejects.toThrow(
      /Production persistent token store is not configured/
    );
  });

  it("supports registering a custom persistent TokenStore adapter in production", async () => {
    process.env.NODE_ENV = "production";

    // Simulate a persistent Redis/SQL adapter
    const persistentDb = new Map<string, SessionTokens>();
    const mockPersistentAdapter: TokenStore = {
      async get(sessionId: string) {
        return persistentDb.get(sessionId) || null;
      },
      async set(sessionId: string, tokens: SessionTokens) {
        persistentDb.set(sessionId, tokens);
      },
      async delete(sessionId: string) {
        persistentDb.delete(sessionId);
      },
    };

    setTokenStore(mockPersistentAdapter);

    await tokenStore.set("persistent_sess_1", mockTokens);
    const retrieved = await tokenStore.get("persistent_sess_1");
    expect(retrieved?.accessToken).toBe("shpat_customer_token");

    await tokenStore.delete("persistent_sess_1");
    expect(await tokenStore.get("persistent_sess_1")).toBeNull();
  });
});
