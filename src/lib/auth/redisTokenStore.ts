/**
 * Upstash Redis TokenStore Adapter — Stage 4.19
 *
 * Production-persistent implementation of the GENSIS TokenStore boundary using
 * Upstash Redis HTTP/REST API (@upstash/redis).
 *
 * Architecture Boundary:
 * Customer Account OAuth → AuthService / Customer Account Client → TokenStore → RedisTokenStore → Upstash Redis REST API
 */

import { Redis } from "@upstash/redis";
import type { TokenStore } from "./tokenStore";
import type { SessionTokens } from "./types";

export interface RedisTokenStoreOptions {
  url?: string;
  token?: string;
  client?: Redis;
}

export class RedisTokenStore implements TokenStore {
  private client: Redis;

  constructor(options: RedisTokenStoreOptions = {}) {
    if (options.client) {
      this.client = options.client;
    } else {
      const url = options.url || process.env.KV_REST_API_URL;
      const token = options.token || process.env.KV_REST_API_TOKEN;

      if (!url || !token) {
        throw new Error(
          "[GENSIS RedisTokenStore] Missing required environment variables: KV_REST_API_URL and KV_REST_API_TOKEN must be configured."
        );
      }

      this.client = new Redis({ url, token });
    }
  }

  private getKey(sessionId: string): string {
    return `gensis:customer-session:${sessionId}`;
  }

  async get(sessionId: string): Promise<SessionTokens | null> {
    const key = this.getKey(sessionId);
    const data = await this.client.get<unknown>(key);

    if (data === null || data === undefined) {
      return null;
    }

    let parsed: unknown = data;

    if (typeof data === "string") {
      try {
        parsed = JSON.parse(data);
      } catch {
        return null;
      }
    }

    if (!this.isValidSessionTokens(parsed)) {
      return null;
    }

    return parsed;
  }

  async set(sessionId: string, tokens: SessionTokens): Promise<void> {
    const key = this.getKey(sessionId);
    const ttlMs = tokens.expiresAt - Date.now();
    const ttlSeconds = Math.floor(ttlMs / 1000);

    if (ttlSeconds <= 0) {
      await this.client.del(key);
      return;
    }

    await this.client.set(key, tokens, { ex: ttlSeconds });
  }

  async delete(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.client.del(key);
  }

  private isValidSessionTokens(data: unknown): data is SessionTokens {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const record = data as Record<string, unknown>;

    if (typeof record.accessToken !== "string" || record.accessToken.trim() === "") {
      return false;
    }

    if (typeof record.expiresAt !== "number" || Number.isNaN(record.expiresAt)) {
      return false;
    }

    if (record.refreshToken !== undefined && typeof record.refreshToken !== "string") {
      return false;
    }

    if (record.idToken !== undefined && typeof record.idToken !== "string") {
      return false;
    }

    return true;
  }
}
