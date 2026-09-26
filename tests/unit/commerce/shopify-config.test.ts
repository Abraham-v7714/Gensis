import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  shopifyConfig,
  getShopifyStoreDomain,
  isShopifyConfigured,
} from "@/lib/commerce/providers/shopify/config";

describe("Shopify Config Boundary", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns false for isShopifyConfigured when domain or private token is missing", () => {
    shopifyConfig.domain = "";
    shopifyConfig.privateToken = "";
    expect(isShopifyConfigured()).toBe(false);
  });

  it("normalizes store domain by stripping http/https protocol and trailing slashes", () => {
    shopifyConfig.domain = "https://gensis-store.myshopify.com/";
    shopifyConfig.privateToken = "test-private-token";
    expect(getShopifyStoreDomain()).toBe("gensis-store.myshopify.com");
    expect(isShopifyConfigured()).toBe(true);
  });

  it("defaults apiVersion to current supported stable release 2026-07 when unspecified", () => {
    expect(shopifyConfig.apiVersion).toBe("2026-07");
  });
});
