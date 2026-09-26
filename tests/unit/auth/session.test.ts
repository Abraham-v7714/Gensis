import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCustomerSession,
  getCustomerSession,
  destroyCustomerSession,
} from "@/lib/auth/session";
import { cookies } from "next/headers";
import { tokenStore } from "@/lib/auth/tokenStore";
import type { SessionTokens } from "@/lib/auth/types";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

type MockCookie = { name: string; value: string; options?: Record<string, unknown> };

describe("Customer Session Manager", () => {
  let cookieMap: Map<string, MockCookie>;

  const mockTokens: SessionTokens = {
    accessToken: "at-access-token-123",
    refreshToken: "rt-refresh-token-456",
    idToken: "id-token-789",
    expiresAt: Date.now() + 3600000,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    cookieMap = new Map();

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => cookieMap.get(name)),
      set: vi.fn((name: string, value: string, options?: Record<string, unknown>) => {
        cookieMap.set(name, { name, value, options });
      }),
      delete: vi.fn((name: string) => {
        cookieMap.delete(name);
      }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);
  });

  it("creates encrypted session cookie and saves tokens in tokenStore", async () => {
    const sessionId = await createCustomerSession(mockTokens);

    expect(sessionId).toBeDefined();
    expect(cookieMap.has("gensis_customer_session")).toBe(true);

    const cookieObj = cookieMap.get("gensis_customer_session");
    expect(cookieObj?.options?.httpOnly).toBe(true);
    expect(cookieObj?.options?.sameSite).toBe("lax");
    // Cookie value must NOT contain raw access token
    expect(cookieObj?.value).not.toContain(mockTokens.accessToken);

    const storedTokens = await tokenStore.get(sessionId);
    expect(storedTokens).toEqual(mockTokens);
  });

  it("retrieves session tokens server-side when valid session cookie exists", async () => {
    await createCustomerSession(mockTokens);

    const session = await getCustomerSession();
    expect(session).not.toBeNull();
    expect(session?.tokens.accessToken).toBe(mockTokens.accessToken);
  });

  it("destroys session, deletes cookie, and removes tokenStore entry on logout", async () => {
    const sessionId = await createCustomerSession(mockTokens);

    await destroyCustomerSession();

    expect(cookieMap.has("gensis_customer_session")).toBe(false);
    const stored = await tokenStore.get(sessionId);
    expect(stored).toBeNull();
  });
});
