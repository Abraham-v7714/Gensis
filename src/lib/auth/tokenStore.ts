/**
 * Server-Side Token Store Boundary — Stage 4.16
 *
 * Server-only persistence abstraction for customer session tokens.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. OAuth access_token, refresh_token, and id_token MUST NEVER be placed in client cookies.
 * 2. Client cookies contain ONLY an opaque session ID.
 * 3. In production environments (NODE_ENV === "production"), an external persistent store
 *    adapter (e.g., Redis, Vercel KV, or Database) MUST be configured.
 * 4. The process-memory fallback below is explicitly restricted to development/test environments
 *    and throws immediately in production to prevent silent ephemeral session loss across server restarts.
 */

import type { SessionTokens } from "./types";
import { RedisTokenStore } from "./redisTokenStore";

export interface TokenStore {
  get(sessionId: string): Promise<SessionTokens | null>;
  set(sessionId: string, tokens: SessionTokens): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

/**
 * Isolated Development/Test Memory TokenStore Adapter.
 * Explicitly prohibited from running in production.
 */
export class DevIsolatedMemoryTokenStore implements TokenStore {
  private store = new Map<string, SessionTokens>();

  async get(sessionId: string): Promise<SessionTokens | null> {
    this.assertNotProduction();
    return this.store.get(sessionId) || null;
  }

  async set(sessionId: string, tokens: SessionTokens): Promise<void> {
    this.assertNotProduction();
    this.store.set(sessionId, tokens);
  }

  async delete(sessionId: string): Promise<void> {
    this.assertNotProduction();
    this.store.delete(sessionId);
  }

  private assertNotProduction(): void {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[GENSIS Auth Infrastructure Dependency] Production persistent token store is not configured. " +
          "Production deployments require configuring a persistent TokenStore adapter (e.g. Redis, Vercel KV, or Database) " +
          "via setTokenStore() to prevent customer session loss."
      );
    }
  }
}

let activeStore: TokenStore | null = null;
const devFallbackStore = new DevIsolatedMemoryTokenStore();

/**
 * Registers a production persistent TokenStore adapter.
 * Pass `null` to reset to default behavior.
 */
export function setTokenStore(store: TokenStore | null): void {
  activeStore = store;
}

/**
 * Resolves the currently active TokenStore.
 */
export function getTokenStore(): TokenStore {
  if (!activeStore && process.env.NODE_ENV === "production") {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      activeStore = new RedisTokenStore();
    }
  }
  return activeStore || devFallbackStore;
}

/** Active server-side token store proxy singleton */
export const tokenStore: TokenStore = {
  async get(sessionId: string): Promise<SessionTokens | null> {
    return getTokenStore().get(sessionId);
  },
  async set(sessionId: string, tokens: SessionTokens): Promise<void> {
    return getTokenStore().set(sessionId, tokens);
  },
  async delete(sessionId: string): Promise<void> {
    return getTokenStore().delete(sessionId);
  },
};

