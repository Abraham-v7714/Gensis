import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createCustomerSession,
  destroyCustomerSession,
  setPkceCookie,
  getPkceCookie,
} from "@/lib/auth/session";
import { setTokenStore, TokenStore } from "@/lib/auth/tokenStore";
import type { SessionTokens } from "@/lib/auth/types";

// Mock Next.js cookies store
const cookieMap = new Map<string, { value: string; options: Record<string, unknown> }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const entry = cookieMap.get(name);
      return entry ? { name, value: entry.value } : undefined;
    },
    set: (name: string, value: string, options: Record<string, unknown>) => {
      cookieMap.set(name, { value, options });
    },
    delete: (name: string) => {
      cookieMap.delete(name);
    },
  }),
}));

describe("Customer Session & Cookie Hardening (Stage 4.16)", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalAuthSecret = process.env.AUTH_SECRET;

  beforeEach(() => {
    cookieMap.clear();
    setTokenStore(null);
    process.env.NODE_ENV = "development";
    process.env.AUTH_SECRET = "dev_secret_min_32_characters_long_for_test!!";
  });

  afterEach(() => {
    setTokenStore(null);
    process.env.NODE_ENV = originalEnv;
    process.env.AUTH_SECRET = originalAuthSecret;
  });

  const mockTokens: SessionTokens = {
    accessToken: "test_access_token_12345",
    refreshToken: "test_refresh_token_67890",
    idToken: "test_id_token",
    expiresAt: Date.now() + 3600000,
  };

  it("sets customer session cookie with strict security flags", async () => {
    await createCustomerSession(mockTokens);

    const sessionCookie = cookieMap.get("gensis_customer_session");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.options.httpOnly).toBe(true);
    expect(sessionCookie?.options.sameSite).toBe("lax");
    expect(sessionCookie?.options.path).toBe("/");
    expect(sessionCookie?.options.maxAge).toBeGreaterThan(0);

    // Verify cookie does NOT contain raw access token (opaque AES encrypted string)
    expect(sessionCookie?.value).not.toContain("test_access_token_12345");
    expect(sessionCookie?.value).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
  });

  it("sets Secure flag on session cookie when NODE_ENV is production", async () => {
    process.env.NODE_ENV = "production";
    process.env.AUTH_SECRET = "production_secure_secret_key_32_chars_long!";

    const mockStore: TokenStore = {
      store: new Map(),
      async get(id: string) {
        return (this as unknown as { store: Map<string, SessionTokens> }).store.get(id) || null;
      },
      async set(id: string, t: SessionTokens) {
        (this as unknown as { store: Map<string, SessionTokens> }).store.set(id, t);
      },
      async delete(id: string) {
        (this as unknown as { store: Map<string, SessionTokens> }).store.delete(id);
      },
    } as unknown as TokenStore;

    setTokenStore(mockStore);

    await createCustomerSession(mockTokens);

    const sessionCookie = cookieMap.get("gensis_customer_session");
    expect(sessionCookie?.options.secure).toBe(true);
  });

  it("enforces AUTH_SECRET in production and throws if missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.AUTH_SECRET;

    const mockStore: TokenStore = {
      async get() { return null; },
      async set() {},
      async delete() {},
    };
    setTokenStore(mockStore);

    await expect(createCustomerSession(mockTokens)).rejects.toThrow(
      /AUTH_SECRET environment variable/
    );
  });

  it("sets PKCE cookie with strict security flags and short expiration", async () => {
    await setPkceCookie("test_verifier_123", "test_state_456");

    const pkceCookie = cookieMap.get("gensis_auth_pkce");
    expect(pkceCookie).toBeDefined();
    expect(pkceCookie?.options.httpOnly).toBe(true);
    expect(pkceCookie?.options.sameSite).toBe("lax");
    expect(pkceCookie?.options.path).toBe("/");
    expect(pkceCookie?.options.maxAge).toBe(600); // 10 minutes max age

    const decrypted = await getPkceCookie();
    expect(decrypted).toEqual({
      codeVerifier: "test_verifier_123",
      state: "test_state_456",
    });
  });

  it("destroys session cleanly and deletes cookie", async () => {
    await createCustomerSession(mockTokens);
    expect(cookieMap.has("gensis_customer_session")).toBe(true);

    await destroyCustomerSession();
    expect(cookieMap.has("gensis_customer_session")).toBe(false);
  });
});
