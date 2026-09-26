/**
 * OAuth 2.0 PKCE & State Utility — Stage 4.11
 *
 * Provides cryptographically secure PKCE code_verifier, code_challenge (S256),
 * and state parameter generation using Node.js native crypto.
 */

import { randomBytes, createHash } from "crypto";
import type { PkcePair } from "./types";

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePkcePair(): PkcePair {
  const verifierBytes = randomBytes(32);
  const codeVerifier = base64UrlEncode(verifierBytes);

  const hash = createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = base64UrlEncode(hash);

  const stateBytes = randomBytes(24);
  const state = base64UrlEncode(stateBytes);

  return {
    codeVerifier,
    codeChallenge,
    state,
  };
}

export function validateState(receivedState: string, expectedState: string): boolean {
  if (
    !receivedState ||
    !expectedState ||
    typeof receivedState !== "string" ||
    typeof expectedState !== "string"
  ) {
    return false;
  }
  return receivedState === expectedState;
}
