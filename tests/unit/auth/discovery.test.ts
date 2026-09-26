import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchOidcConfiguration } from "@/lib/auth/discovery";

const STORE_DOMAIN = "gensis.myshopify.com";

describe("fetchOidcConfiguration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws when store domain is empty", async () => {
    await expect(fetchOidcConfiguration("")).rejects.toThrow(
      "Invalid store domain provided."
    );
  });

  it("resolves and validates discovery endpoints from well-known JSON", async () => {
    const mockDiscovery = {
      authorization_endpoint: "https://gensis.myshopify.com/auth/oauth/authorize",
      token_endpoint: "https://gensis.myshopify.com/auth/oauth/token",
      end_session_endpoint: "https://gensis.myshopify.com/auth/logout",
    };

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockDiscovery,
    } as Response);

    const config = await fetchOidcConfiguration(STORE_DOMAIN);

    expect(config.authorization_endpoint).toBe(mockDiscovery.authorization_endpoint);
    expect(config.token_endpoint).toBe(mockDiscovery.token_endpoint);
    expect(config.end_session_endpoint).toBe(mockDiscovery.end_session_endpoint);
  });

  it("rejects non-HTTPS or untrusted arbitrary endpoints injected into discovery response", async () => {
    const maliciousDiscovery = {
      authorization_endpoint: "https://evil.com/auth/authorize",
      token_endpoint: "http://gensis.myshopify.com/auth/token",
    };

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => maliciousDiscovery,
    } as Response);

    const config = await fetchOidcConfiguration(STORE_DOMAIN);

    // Falls back safely to standard shopify store domain endpoints
    expect(config.authorization_endpoint).toBe(`https://${STORE_DOMAIN}/auth/oauth/authorize`);
    expect(config.token_endpoint).toBe(`https://${STORE_DOMAIN}/auth/oauth/token`);
  });
});
