import { describe, it, expect } from "vitest";
import { generatePkcePair, validateState } from "@/lib/auth/pkce";

describe("generatePkcePair & validateState", () => {
  it("generates cryptographic PKCE code_verifier, S256 code_challenge, and state", () => {
    const pair = generatePkcePair();

    expect(pair.codeVerifier).toBeDefined();
    expect(pair.codeChallenge).toBeDefined();
    expect(pair.state).toBeDefined();

    expect(pair.codeVerifier.length).toBeGreaterThan(30);
    expect(pair.codeChallenge.length).toBeGreaterThan(20);
    expect(pair.state.length).toBeGreaterThan(20);

    // Ensure base64url characters only (no +, /, or =)
    expect(pair.codeVerifier).not.toMatch(/[+/=]/);
    expect(pair.codeChallenge).not.toMatch(/[+/=]/);
    expect(pair.state).not.toMatch(/[+/=]/);
  });

  it("validates state matching correctly and rejects mismatches", () => {
    const state = "valid-state-123456";

    expect(validateState(state, state)).toBe(true);
    expect(validateState(state, "wrong-state")).toBe(false);
    expect(validateState("", state)).toBe(false);
  });
});
