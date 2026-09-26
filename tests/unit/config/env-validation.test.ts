import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/config/env";

describe("Environment & Secrets Validation (Stage 4.16)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("passes in development with minimal configuration", () => {
    delete process.env.AUTH_SECRET;
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SANITY_PROJECT_ID;

    const result = validateEnv({ isProduction: false });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("detects sensitive secrets mistakenly prefixed with NEXT_PUBLIC_", () => {
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PRIVATE_TOKEN = "leaked_secret";
    process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN = "leaked_token";

    const result = validateEnv({ isProduction: false });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("NEXT_PUBLIC_SHOPIFY_STOREFRONT_PRIVATE_TOKEN"),
        expect.stringContaining("NEXT_PUBLIC_SANITY_API_READ_TOKEN"),
      ])
    );
  });

  it("fails in production when AUTH_SECRET is missing", () => {
    delete process.env.AUTH_SECRET;

    const result = validateEnv({ isProduction: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("AUTH_SECRET is required in production")
    );
  });

  it("fails in production when AUTH_SECRET is too short (< 32 chars)", () => {
    process.env.AUTH_SECRET = "short-secret";

    const result = validateEnv({ isProduction: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("AUTH_SECRET must be at least 32 characters")
    );
  });

  it("fails in production when AUTH_SECRET is the dev placeholder", () => {
    process.env.AUTH_SECRET = "gensis_auth_secret_must_be_32_bytes_min!!";

    const result = validateEnv({ isProduction: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("AUTH_SECRET is using the default development placeholder")
    );
  });

  it("validates NEXT_PUBLIC_SITE_URL format", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "not-a-valid-url";

    const result = validateEnv({ isProduction: false });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("NEXT_PUBLIC_SITE_URL is not a valid URL")
    );
  });

  it("throws when throwOnError option is set and errors exist", () => {
    delete process.env.AUTH_SECRET;

    expect(() => {
      validateEnv({ isProduction: true, throwOnError: true });
    }).toThrow(/Environment Validation Failed/);
  });

  it("passes when all production secrets are validly configured", () => {
    process.env.AUTH_SECRET = "super_secure_random_key_that_is_at_least_32_characters_long!";
    process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN = "shpat_test_token";
    process.env.SANITY_PROJECT_ID = "test_sanity_proj";
    process.env.SANITY_REVALIDATE_SECRET = "webhook_secret_123456";
    process.env.NEXT_PUBLIC_SITE_URL = "https://gensis.com";

    const result = validateEnv({ isProduction: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
