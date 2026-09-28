import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RedisTokenStore } from "@/lib/auth/redisTokenStore";
import { tokenStore, setTokenStore, getTokenStore, DevIsolatedMemoryTokenStore } from "@/lib/auth/tokenStore";
import type { SessionTokens } from "@/lib/auth/types";
import { createCustomerSession, getCustomerSession } from "@/lib/auth/session";
import { validateEnv } from "@/lib/config/env";
import { Redis } from "@upstash/redis";

// Mock next/headers for session.ts integration
vi.mock("next/headers", () => {
  const cookieMap = new Map<string, { value: string; [key: string]: unknown }>();
  return {
    cookies: async () => ({
      get: (name: string) => cookieMap.get(name),
      set: (name: string, value: string, opts: unknown) =>
        cookieMap.set(name, { value, ...(opts as object) }),
      delete: (name: string) => cookieMap.delete(name),
    }),
  };
});

describe("RedisTokenStore (Stage 4.19)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    setTokenStore(null);
  });

  afterEach(() => {
    process.env = originalEnv;
    setTokenStore(null);
    vi.restoreAllMocks();
  });

  const mockTokens: SessionTokens = {
    accessToken: "shpat_test_access_token_123",
    refreshToken: "shpat_test_refresh_token_456",
    idToken: "id_token_789",
    expiresAt: Date.now() + 3600000,
  };

  const sessionId = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0";

  function createMockRedisClient() {
    const memory = new Map<string, { value: unknown; ex?: number }>();
    return {
      memory,
      client: {
        get: vi.fn(async (key: string) => {
          const item = memory.get(key);
          return item ? item.value : null;
        }),
        set: vi.fn(async (key: string, value: unknown, opts?: { ex?: number }) => {
          memory.set(key, { value, ex: opts?.ex });
          return "OK";
        }),
        del: vi.fn(async (key: string) => {
          const existed = memory.has(key);
          memory.delete(key);
          return existed ? 1 : 0;
        }),
      } as unknown as Redis,
    };
  }

  it("1. get() returns stored SessionTokens", async () => {
    const { client, memory } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    memory.set(`gensis:customer-session:${sessionId}`, { value: mockTokens });

    const result = await store.get(sessionId);
    expect(result).toEqual(mockTokens);
  });

  it("2. get() returns null for missing key", async () => {
    const { client } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    const result = await store.get("non-existent-session");
    expect(result).toBeNull();
  });

  it("3. set() stores the correct namespaced key", async () => {
    const { client } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    await store.set(sessionId, mockTokens);

    expect(client.set).toHaveBeenCalledWith(
      `gensis:customer-session:${sessionId}`,
      mockTokens,
      expect.objectContaining({ ex: expect.any(Number) })
    );
  });

  it("4. set() serializes/stores the complete SessionTokens object", async () => {
    const { client, memory } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    await store.set(sessionId, mockTokens);

    const stored = memory.get(`gensis:customer-session:${sessionId}`);
    expect(stored?.value).toEqual(mockTokens);
  });

  it("5. set() calculates TTL from expiresAt", async () => {
    const { client } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    const ttlMs = 5000;
    const tokens: SessionTokens = {
      ...mockTokens,
      expiresAt: Date.now() + ttlMs,
    };

    await store.set(sessionId, tokens);

    expect(client.set).toHaveBeenCalledWith(
      `gensis:customer-session:${sessionId}`,
      tokens,
      { ex: 5 }
    );
  });

  it("6. expired tokens are not persisted", async () => {
    const { client, memory } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    memory.set(`gensis:customer-session:${sessionId}`, { value: mockTokens });

    const expiredTokens: SessionTokens = {
      ...mockTokens,
      expiresAt: Date.now() - 1000,
    };

    await store.set(sessionId, expiredTokens);

    expect(client.set).not.toHaveBeenCalled();
    expect(client.del).toHaveBeenCalledWith(`gensis:customer-session:${sessionId}`);
    expect(memory.has(`gensis:customer-session:${sessionId}`)).toBe(false);
  });

  it("7. delete() deletes the correct namespaced key", async () => {
    const { client } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    await store.delete(sessionId);

    expect(client.del).toHaveBeenCalledWith(`gensis:customer-session:${sessionId}`);
  });

  it("8. Redis failures propagate rather than being swallowed", async () => {
    const failingClient = {
      get: vi.fn().mockRejectedValue(new Error("Redis connection refused")),
      set: vi.fn().mockRejectedValue(new Error("Redis connection timeout")),
      del: vi.fn().mockRejectedValue(new Error("Redis cluster down")),
    } as unknown as Redis;

    const store = new RedisTokenStore({ client: failingClient });

    await expect(store.get(sessionId)).rejects.toThrow("Redis connection refused");
    await expect(store.set(sessionId, mockTokens)).rejects.toThrow("Redis connection timeout");
    await expect(store.delete(sessionId)).rejects.toThrow("Redis cluster down");
  });

  it("9. malformed stored data is not returned as valid SessionTokens", async () => {
    const { client, memory } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    memory.set(`gensis:customer-session:${sessionId}`, { value: "not-json" });
    expect(await store.get(sessionId)).toBeNull();

    memory.set(`gensis:customer-session:${sessionId}`, { value: { expiresAt: 12345 } });
    expect(await store.get(sessionId)).toBeNull();

    memory.set(`gensis:customer-session:${sessionId}`, {
      value: { accessToken: "at", expiresAt: "invalid-number" },
    });
    expect(await store.get(sessionId)).toBeNull();
  });

  it("10. credentials are never written to logs", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const consoleErrorSpy = vi.spyOn(console, "error");
    const { client } = createMockRedisClient();
    const store = new RedisTokenStore({ client });

    await store.set(sessionId, mockTokens);
    await store.get(sessionId);
    await store.delete(sessionId);

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("11. production registration uses RedisTokenStore", async () => {
    process.env.NODE_ENV = "production";
    process.env.KV_REST_API_URL = "https://example-kv.upstash.io";
    process.env.KV_REST_API_TOKEN = "test-token-secret";

    const resolvedStore = getTokenStore();
    expect(resolvedStore).toBeInstanceOf(RedisTokenStore);
  });

  it("12. development/test does not require Redis credentials", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const resolvedStore = getTokenStore();
    expect(resolvedStore).toBeInstanceOf(DevIsolatedMemoryTokenStore);
    await resolvedStore.set(sessionId, mockTokens);
    expect(await resolvedStore.get(sessionId)).toEqual(mockTokens);
  });

  it("13. production still fails closed when the persistent adapter is unavailable", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    await expect(tokenStore.get(sessionId)).rejects.toThrow(
      /Production persistent token store is not configured/
    );
  });

  it("14. KV_REST_API_TOKEN is never exposed through client-side code", async () => {
    process.env.NEXT_PUBLIC_KV_REST_API_TOKEN = "leaked_token";
    process.env.NODE_ENV = "production";

    const result = validateEnv();
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('Sensitive secret "NEXT_PUBLIC_KV_REST_API_TOKEN" must NOT be exposed')
    );
  });

  it("integration: Customer session service works with registered RedisTokenStore", async () => {
    const { client } = createMockRedisClient();
    const redisStore = new RedisTokenStore({ client });
    setTokenStore(redisStore);

    process.env.AUTH_SECRET = "0123456789012345678901234567890123456789";

    const createdSessionId = await createCustomerSession(mockTokens);
    expect(createdSessionId).toBeDefined();

    const sessionData = await getCustomerSession();
    expect(sessionData).not.toBeNull();
    expect(sessionData?.tokens.accessToken).toBe("shpat_test_access_token_123");
  });
});
