import { describe, it, expect } from "vitest";
import { validateCheckoutUrl } from "@/features/checkout/checkout";

const STORE_DOMAIN = "gensis.myshopify.com";

describe("validateCheckoutUrl", () => {
  // ── Valid cases ─────────────────────────────────────────────────────────

  it("accepts HTTPS URL on exact store domain", () => {
    expect(
      validateCheckoutUrl(`https://${STORE_DOMAIN}/checkouts/cn/abc123`, STORE_DOMAIN)
    ).toBe(true);
  });

  it("accepts HTTPS URL on checkout. subdomain of store domain", () => {
    expect(
      validateCheckoutUrl(`https://checkout.${STORE_DOMAIN}/co/abc123?token=x`, STORE_DOMAIN)
    ).toBe(true);
  });

  it("accepts URL with trailing path and query string", () => {
    expect(
      validateCheckoutUrl(
        `https://${STORE_DOMAIN}/checkouts/cn/abc?locale=en-US`,
        STORE_DOMAIN
      )
    ).toBe(true);
  });

  // ── Non-HTTPS protocol rejection ────────────────────────────────────────

  it("rejects javascript: URL", () => {
    expect(validateCheckoutUrl("javascript:alert(1)", STORE_DOMAIN)).toBe(false);
  });

  it("rejects data: URL", () => {
    expect(
      validateCheckoutUrl("data:text/html,<script>alert(1)</script>", STORE_DOMAIN)
    ).toBe(false);
  });

  it("rejects http: URL (non-TLS)", () => {
    expect(
      validateCheckoutUrl(`http://${STORE_DOMAIN}/checkouts/cn/abc123`, STORE_DOMAIN)
    ).toBe(false);
  });

  // ── Protocol-relative and malformed ────────────────────────────────────

  it("rejects protocol-relative URL", () => {
    expect(
      validateCheckoutUrl(`//${STORE_DOMAIN}/checkouts/cn/abc123`, STORE_DOMAIN)
    ).toBe(false);
  });

  it("rejects bare path", () => {
    expect(validateCheckoutUrl("/checkouts/cn/abc123", STORE_DOMAIN)).toBe(false);
  });

  it("rejects malformed string", () => {
    expect(validateCheckoutUrl("not-a-url-at-all", STORE_DOMAIN)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateCheckoutUrl("", STORE_DOMAIN)).toBe(false);
  });

  // ── Hostname allowlist violations ────────────────────────────────────────

  it("rejects arbitrary .myshopify.com subdomain (not the configured store)", () => {
    expect(
      validateCheckoutUrl("https://evil.myshopify.com/checkouts/cn/abc123", STORE_DOMAIN)
    ).toBe(false);
  });

  it("rejects external domain", () => {
    expect(validateCheckoutUrl("https://evil.com/checkout", STORE_DOMAIN)).toBe(false);
  });

  it("rejects deceptive host embedding store domain as path segment", () => {
    expect(
      validateCheckoutUrl(`https://evil.com/${STORE_DOMAIN}/checkout`, STORE_DOMAIN)
    ).toBe(false);
  });

  it("rejects domain that merely contains the store domain as suffix", () => {
    expect(
      validateCheckoutUrl(
        `https://not${STORE_DOMAIN}/checkouts/cn/abc123`,
        STORE_DOMAIN
      )
    ).toBe(false);
  });

  it("rejects checkout. subdomain of a different .myshopify.com store", () => {
    expect(
      validateCheckoutUrl("https://checkout.evil.myshopify.com/co/abc123", STORE_DOMAIN)
    ).toBe(false);
  });

  // ── Missing / empty storeDomain ─────────────────────────────────────────

  it("rejects when storeDomain is empty string", () => {
    expect(
      validateCheckoutUrl(`https://${STORE_DOMAIN}/checkouts/cn/abc123`, "")
    ).toBe(false);
  });

  it("rejects userinfo URL attack (with embedded username/password)", () => {
    expect(
      validateCheckoutUrl(`https://attacker:secret@${STORE_DOMAIN}/checkouts/cn/abc123`, STORE_DOMAIN)
    ).toBe(false);
  });
});
