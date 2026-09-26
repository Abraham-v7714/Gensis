/**
 * Customer Session Manager — Stage 4.11
 *
 * Manages opaque customer sessions using HttpOnly cookies and AES-256-GCM encryption.
 *
 * Security:
 * - Browser cookie `gensis_customer_session` contains ONLY an encrypted opaque Session ID.
 * - Access tokens, refresh tokens, and ID tokens are stored EXCLUSIVELY in the server-side TokenStore.
 * - AES-256-GCM encryption prevents tampering or inspection of the Session ID.
 */

import { cookies } from "next/headers";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";
import { tokenStore } from "./tokenStore";
import type { SessionTokens } from "./types";

const SESSION_COOKIE_NAME = "gensis_customer_session";
const PKCE_COOKIE_NAME = "gensis_auth_pkce";
const DEFAULT_SECRET = "gensis_auth_secret_must_be_32_bytes_min!!";

function getSecretKey(): Buffer {
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.AUTH_SECRET || process.env.AUTH_SECRET === DEFAULT_SECRET)
  ) {
    throw new Error(
      "[GENSIS Auth Security] AUTH_SECRET environment variable (min 32 characters) is required in production."
    );
  }
  const raw = process.env.AUTH_SECRET || DEFAULT_SECRET;
  return createHash("sha256").update(raw).digest();
}

function encryptSessionId(sessionId: string): string {
  const key = getSecretKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(sessionId, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

function decryptSessionId(encryptedData: string): string | null {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return null;

    const key = getSecretKey();
    const iv = Buffer.from(parts[0], "base64");
    const authTag = Buffer.from(parts[1], "base64");
    const encryptedText = parts[2];

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    return null;
  }
}

export async function createCustomerSession(tokens: SessionTokens): Promise<string> {
  const sessionId = randomBytes(32).toString("hex");

  await tokenStore.set(sessionId, tokens);

  const encryptedId = encryptSessionId(sessionId);
  const cookieStore = await cookies();

  const maxAge = Math.max(0, Math.floor((tokens.expiresAt - Date.now()) / 1000));

  cookieStore.set(SESSION_COOKIE_NAME, encryptedId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge > 0 ? maxAge : 3600 * 24 * 30, // Fallback 30 days
  });

  return sessionId;
}

export async function getCustomerSession(): Promise<{
  sessionId: string;
  tokens: SessionTokens;
} | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawCookie) return null;

  const sessionId = decryptSessionId(rawCookie);
  if (!sessionId) return null;

  const tokens = await tokenStore.get(sessionId);
  if (!tokens) return null;

  if (Date.now() >= tokens.expiresAt) {
    await tokenStore.delete(sessionId);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return { sessionId, tokens };
}

export async function destroyCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawCookie) {
    const sessionId = decryptSessionId(rawCookie);
    if (sessionId) {
      await tokenStore.delete(sessionId);
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function setPkceCookie(codeVerifier: string, state: string): Promise<void> {
  const cookieStore = await cookies();
  const payload = JSON.stringify({ codeVerifier, state });
  const encrypted = encryptSessionId(payload);

  cookieStore.set(PKCE_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes temporary PKCE lifespan
  });
}

export async function getPkceCookie(): Promise<{ codeVerifier: string; state: string } | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(PKCE_COOKIE_NAME)?.value;

  if (!rawCookie) return null;

  const decrypted = decryptSessionId(rawCookie);
  if (!decrypted) return null;

  try {
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export async function clearPkceCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PKCE_COOKIE_NAME);
}
