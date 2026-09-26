# GENSIS Production Deployment & Infrastructure Guide

This guide details the requirements, configuration, and sequence for deploying the GENSIS storefront to a production hosting environment (e.g., Vercel, AWS ECS/Amplify, Node.js Container).

---

## 1. Environment & Secrets Classification

Environment variables are strictly segmented into three boundaries:

### A. Public Client-Safe Variables (`NEXT_PUBLIC_`)
| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Browser / Server | Canonical HTTPS storefront URL (e.g. `https://gensis.com`). |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Browser SPA | Project ID for Sanity Studio at `/studio`. |
| `NEXT_PUBLIC_SANITY_DATASET` | Browser SPA | Dataset name (e.g. `production`). |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Browser SPA | API version (e.g. `2026-09-12`). |

### B. Server-Only Secrets & Private Configuration (Never expose with `NEXT_PUBLIC_`)
| Variable | Purpose | Security Requirement |
| :--- | :--- | :--- |
| `AUTH_SECRET` | AES-256-GCM session cookie encryption key. | Min 32 random characters (`openssl rand -base64 32`). Required in prod. |
| `SHOPIFY_STORE_DOMAIN` | Shopify store domain (e.g. `your-store.myshopify.com`). | Hostname only without protocol. |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Private Storefront API token for server GraphQL. | Server-only secret from Shopify Headless sales channel. |
| `SHOPIFY_STOREFRONT_API_VERSION` | API version (`2026-07`). | Stable release. |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | OAuth 2.0 PKCE Client ID. | Generated in Shopify Customer Account settings. |
| `SANITY_PROJECT_ID` | Server-side Sanity GROQ query target. | Server-only. |
| `SANITY_DATASET` | Server-side Sanity dataset. | Default `production`. |
| `SANITY_API_VERSION` | Server-side Sanity API version. | Default `2026-09-12`. |
| `SANITY_API_READ_TOKEN` | Server-side Read Token for draft preview queries. | Server-only secret with Viewer/Read permissions. |
| `SANITY_REVALIDATE_SECRET` | Secret for on-demand ISR webhook (`/api/revalidate/sanity`). | Min 16 random characters. |

### C. Development / Script Only (Never in storefront app)
| Variable | Purpose |
| :--- | :--- |
| `SANITY_API_WRITE_TOKEN` | Only used locally for content seeding (`npx tsx scripts/seed-sanity.ts`). |

---

## 2. Persistent Customer TokenStore

In production (`NODE_ENV === "production"`), customer sessions require persistent server-side token storage to avoid session loss across restarts or serverless instance recycling.

### Architectural Policy:
- Development/testing uses `DevIsolatedMemoryTokenStore`.
- In production, in-memory storage **fails closed and throws an explicit error** to prevent silent session drop.
- Deployments should instantiate a persistent adapter implementing `TokenStore` (`get`, `set`, `delete`) connected to Redis, PostgreSQL, DynamoDB, or Vercel KV, and register it during server bootstrap via:
  ```ts
  import { setTokenStore } from "@/lib/auth/tokenStore";
  setTokenStore(myPersistentRedisTokenStore);
  ```

---

## 3. Shopify Provider Setup

1. **Headless Sales Channel**:
   - Install the Headless sales channel in Shopify Admin.
   - Create a Storefront API token and assign `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_read_collection_listings`, and `unauthenticated_write_checkouts`.
   - Set `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` and `SHOPIFY_STORE_DOMAIN`.

2. **Customer Account API (OAuth 2.0 PKCE)**:
   - Enable New Customer Accounts in Shopify Admin.
   - Configure Customer Account API application with callback URL: `https://<YOUR_PRODUCTION_DOMAIN>/account/callback`.
   - Set `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`.
   - **Note**: Shopify Customer Account OAuth strictly requires public HTTPS callback URLs; localhost is not supported for production OAuth.

---

## 4. Sanity CMS Setup & ISR Webhooks

1. **Content Lake & Permissions**:
   - Create a Sanity project and dataset (`production`).
   - Generate a Viewer Read Token and set `SANITY_API_READ_TOKEN`.

2. **On-Demand ISR Webhook**:
   - In Sanity project settings > API > Webhooks, create a webhook targeting:
     `https://<YOUR_PRODUCTION_DOMAIN>/api/revalidate/sanity`
   - Set the webhook Secret to match `SANITY_REVALIDATE_SECRET`.
   - Trigger on: create, update, delete for documents.
   - Projection: `{ _type, slug }`.

---

## 5. Security & Session Hardening

- **Cookies**:
  - `gensis_customer_session`: HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age=30d. Stores encrypted opaque Session ID only.
  - `gensis_cart_id`: HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age=30d. Stores Shopify Cart ID string only.
  - `gensis_auth_pkce`: HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age=10m. Stores encrypted verifier & state.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: SAMEORIGIN`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `X-DNS-Prefetch-Control: on`

---

## 6. Build, Verification & Startup

1. **Install Dependencies**:
   ```bash
   npm ci
   ```
2. **Type Check & Lint**:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
3. **Run Test Suite**:
   ```bash
   npm run test:run
   ```
4. **Production Build**:
   ```bash
   npm run build
   ```
5. **Start Server**:
   ```bash
   npm start
   ```

---

## 7. Rollback & Disaster Recovery

- **Stateless Application Tier**: The Next.js storefront is stateless. Deployments can be instantly rolled back to the previous immutable release bundle.
- **Carts**: Active carts reside authoritatively on Shopify's infrastructure; deployment rollbacks do not wipe active customer bag sessions.
- **Content**: CMS drafts and published snapshots are versioned authoritatively in Sanity Content Lake.
