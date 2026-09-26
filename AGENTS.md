<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GENSIS Engineering Rules

## Core Principles
1. **Server First**: Use Server Components by default. Only use "use client" where client-side interaction or browser state is genuinely required.
2. **Architecture Hierarchy**: PAGE → FEATURE → SHARED → UI. Generic UI must never depend on commerce, payment, CMS, database, or fulfillment providers.
3. **No Fake Data**: Do not create fake APIs, commerce data, Tapstitch integrations, or Shopify integrations. Connect when appropriate.
4. **Dependencies**: Use existing project dependencies whenever possible. Do not add unnecessary state, API, or UI libraries (e.g. Redux, Zustand).
5. **Code Quality**: Strict TypeScript (no `any`), semantic HTML, maintain accessibility and responsive behavior. Do not disable lint rules or suppress TS errors to make the build pass.

## Design Identity
- **Fonts**: Instrument Serif (Display/Editorial), Manrope (Interface/Body)
- **Colors**: GENSIS Black (#0A0A0A), GENSIS Ivory (#F2F0EA), GENSIS Charcoal (#202020), GENSIS Stone (#B7B1A6), GENSIS Sand (#D8D0C3)
- Do not invent additional brand colors.

## TypeScript Architecture
- **Provider-Neutral Domain Types**: Define domain models without assuming specific providers (no `ShopifyProduct`, etc. until integration).
- **Strict Typing**: Maintain strict TypeScript. Do not use `any`.
- **Type Safety**: Avoid unsafe type assertions or unnecessary non-null assertions.
- **Data Boundaries**: External/untrusted data should conceptually enter as `unknown` and be validated before becoming domain data.
- **Enums**: Use string unions instead of TypeScript enums.

## Styling Architecture
- **Technology**: Tailwind CSS v4 using CSS-first theme architecture. Do not use CSS-in-JS (styled-components, Emotion, etc.).
- **Responsive Strategy**: Mobile-first approach. Support mobile, tablet, desktop, and large desktop natively without unnecessary custom breakpoints.
- **Layout**: Use established layout tokens (e.g., `var(--layout-content-width)`, responsive gutters). Do not create arbitrary max-width values. Full-bleed sections are permitted for hero/campaign media.
- **Typography**: Consume existing typography tokens (`var(--text-body)`, `var(--leading-headline)`, etc.). Use Instrument Serif for display/editorial and Manrope for interface/body. Avoid arbitrary font sizes unless genuinely necessary.
- **Colors**: Strictly use semantic GENSIS color tokens (`var(--color-bg-primary)`, `var(--color-fg-muted)`, etc.). Do not use arbitrary hex colors inside components.
- **Spacing**: Use the established GENSIS spacing scale (e.g., `p-6`, `gap-4`, `mb-8`). Avoid arbitrary values (e.g., `mt-[37px]`).
- **Component Styling**: Keep component styling close to the component. Do not create a giant global stylesheet containing all component styles.
- **Global CSS**: `globals.css` should primarily contain design tokens, resets, base typography, accessibility foundations, and truly global styles. No page-specific styling.
- **Motion**: "Movement with purpose." Use existing motion tokens (`var(--duration-fast)`, `var(--ease-default)`). Prefer subtle transitions on specific properties rather than `transition-all`. Avoid excessive, decorative, or looping animations. Respect `prefers-reduced-motion`.
- **Hover/Interactions**: Keep interactions restrained (e.g., subtle image scale, opacity transition, underline, controlled contrast change). Avoid flashy effects.
- **Performance**: Avoid unnecessary layout-triggering animations, large blur effects, and continuous animation loops.

## CMS Architecture

### Provider Neutrality & Sanity CMS Integration
- **Sanity is the selected CMS provider.** All Sanity-specific code lives strictly in `src/lib/cms/providers/sanity/`.
- **UI components must never import from CMS provider SDKs** (Sanity `next-sanity`, `@sanity/client`, etc.).
- **Pages and features depend on GENSIS domain types** (`JournalArticle`, `Lookbook`, `Campaign`, `AboutPage`), not raw Sanity document or response shapes.
- **Sanity adapter & mapper normalize provider data.** All mapping from raw Sanity GROQ responses to GENSIS domain types happens inside `src/lib/cms/providers/sanity/mapper.ts` — never in UI code or routes.
- **Private Sanity API tokens are server-side only.** Never prefix private tokens with `NEXT_PUBLIC_`.
- **Development fixtures remain test-only.** Sanity adapter does not silently fall back to fixtures.
- **Visual Editing and Draft Mode** are supported architecturally and reserved for Stage 4.x.

### Content Architecture
- **Domain types live in `src/types/cms/`.** Import from `@/types/cms` (the barrel) in application code.
- **The CmsClient interface lives in `src/lib/cms/types.ts`.** Any future provider adapter must implement this interface.
- **The active provider is wired in `src/lib/cms/index.ts`.** Changing providers requires editing only this file.
- **Commerce and CMS are separate domains.** `ProductImage` (commerce) and `MediaAsset` (CMS) must not be merged. Product/Collection types are commerce concerns.

### Structured Editorial Content
- **`EditorialBlock` is a discriminated union** of content blocks (`richtext`, `heading`, `image`, `pullquote`, `divider`, `split`, `gallery`).
- **Blocks describe content data, not presentation.** No Tailwind classes, JSX, or React component references inside block types.
- **The presentation layer maps blocks to components.** Use a `switch (block.type)` pattern at render time.
- **The existing editorial components** (`EditorialImage`, `EditorialText`, `EditorialSplit`, `EditorialGrid`, `PullQuote`) remain the presentation layer for CMS blocks. Do not rewrite them to accept raw CMS data.

### References
- **Cross-content references use lightweight stubs** (`ProductReference`, `CollectionReference`, etc.) containing only `id`, `slug`, and `title`.
- **Never embed full nested objects** inside content models. Resolve full objects at the data-fetching layer.
- **No circular imports** between `src/types/cms/*` files. `references.ts` imports nothing from other CMS type files.

### Content Directory & Fixtures
- **`src/content/`** is for local fixtures and schema documentation only.
- **Fixtures are development/test data only.** They use application domain types (`@/types/cms`), are provider-neutral, contain no CMS SDK objects or fake provider IDs, and are clearly identified as fictional fixtures.
- **Fixtures must never be imported by CMS provider code**, future CMS adapters, or production commerce services, nor returned by `CmsClient`.
- Do not put real GENSIS editorial copy in `src/content/`.

### Content Rendering Architecture
- **`EditorialRenderer` accepts normalized `EditorialBlock[]`.** It is provider-neutral and Maps content blocks to existing GENSIS components.
- **CMS providers never appear in presentation components.**
- **Content models contain data, not presentation implementation.**
- **Unknown/new block types must be handled exhaustively.** The renderer must fail at compile time if a new block type is added to the union but not handled.
- **Raw HTML must not be rendered.** Avoid `dangerouslySetInnerHTML`.
- **Existing editorial components should be reused.** Do not create duplicate presentation components.

### Page Composition Architecture
- **Route-level code owns data acquisition.** Composition components receive normalized domain content as props.
- **Composition components do not call CMS APIs** and do not know about CMS providers or fetch calls.
- **Composition components reuse existing primitives** (`PageContainer`, `Section`, `EditorialRenderer`, `EditorialImage`, `EditorialGrid`).
- **Global navigation and footer remain outside page compositions.** They are owned by the application layout layer.
- **SEO generation remains outside composition components.** `generateMetadata` and meta tags belong to route-level architecture.
- **Page compositions are Server Components by default.** No `"use client"` directive unless required for interactive state.

## Route & Metadata Architecture
- **Routes own data acquisition.** Dynamic routes handle `params`, invoke domain fetch functions, and pass normalized models to composition components.
- **Composition components receive normalized data.** They do not perform route parameter parsing or data fetching.
- **CMS providers remain hidden behind adapters.** Route code interacts only with provider-neutral abstractions.
- **Dynamic routes use slug-based boundaries.** Param signatures match Next.js App Router conventions (`params: Promise<{ slug: string }>`).
- **SEO generation belongs at route level.** `generateMetadata()` maps domain `SeoMetadata` into Next.js `Metadata` via `constructMetadata()`.
- **`SeoMetadata` is mapped through reusable SEO utilities.** Standardizes title formatting, meta descriptions, canonical URLs, and `noIndex` robots policies.
- **No CMS/commerce provider integration at this stage.** Dynamic routes use `notFound()` when dynamic data resources are unwired or unresolvable.
- **Production routes must not use fixture data as fake backend data.** Fixtures remain strictly in `src/content/fixtures/` for local testing/previews.
- **Global layout/navigation remain application-level concerns.** Defined in `src/app/layout.tsx` using `SiteHeader` and accessible main content landmarks.


## Stage 4.1 — Sanity Studio Schema Architecture

### Studio Location
- **Provider boundary**: All Sanity Studio and schema code lives strictly in `src/lib/cms/providers/sanity/`.
- **Schema definitions**: `src/lib/cms/providers/sanity/schemas/`
- **Studio config factory**: `src/lib/cms/providers/sanity/studio/config.ts`
- **Schema helpers**: `src/lib/cms/providers/sanity/schemas/helpers.ts`

### Schema Organization
```
schemas/
  documents/       — Sanity document types (one Sanity record per content item)
    journalArticle.ts
    lookbook.ts
    campaign.ts
    aboutPage.ts    ← singleton-style
    category.ts
    tag.ts
    contributor.ts

  objects/         — Reusable embedded sub-structures
    seo.ts          ← SeoMetadata
    mediaAsset.ts   ← MediaAsset
    lookbookItem.ts ← LookbookItem
    references.ts   ← productReference, collectionReference stubs
    blockRichtext.ts
    blockHeading.ts
    blockImage.ts
    blockPullquote.ts
    blockDivider.ts
    blockSplit.ts
    blockGallery.ts

  helpers.ts       — defineType, defineField, defineArrayMember helpers
  index.ts         — Central schema registry (schemaTypes array + stable name constants)
```

### Document Types (7)
| Schema Name      | GENSIS Domain Model  | Route              |
|:-----------------|:---------------------|:-------------------|
| `journalArticle` | `JournalArticle`     | `/journal/[slug]`  |
| `lookbook`       | `Lookbook`           | `/lookbook/[slug]` |
| `campaign`       | `Campaign`           | `/campaigns/[slug]`|
| `aboutPage`      | `AboutPage`          | `/about`           |
| `category`       | `Category`           | taxonomy reference |
| `tag`            | `Tag`                | taxonomy reference |
| `contributor`    | `Contributor`        | reference          |

### Editorial Block Object Types (7)
Corresponds directly to the `EditorialBlock` discriminated union in `@/types/cms/blocks.ts`:
`blockRichtext` | `blockHeading` | `blockImage` | `blockPullquote` | `blockDivider` | `blockSplit` | `blockGallery`

### Singleton About Page
- The `aboutPage` document type is a singleton — only one record should exist.
- The GROQ query uses `[0]` to fetch the single record.
- The slug field is fixed to `"about"` via a custom slugify function.
- Studio singleton behavior (hiding "New Document" action, fixed navigation link) is configured in `studio/config.ts` and deferred to Stage 4.2 Studio wiring.

### Status Model
- GENSIS domain uses `"draft" | "published" | "archived"` (`ContentStatus`).
- Sanity schemas implement this as an explicit `status` string field with three options.
- Sanity's internal draft mechanism (`__drafts.` prefix) is separate and does not affect this field.
- GROQ queries filter by `status == "published"` to fetch only live content.

### Provider Boundary Rules
- `schemaTypes` and schema definitions MUST NOT be imported by `@/types/cms`, `@/components`, `@/features`, or `src/app` routes.
- `SANITY_DOCUMENT_TYPES` and `SANITY_BLOCK_TYPES` constants in `schemas/index.ts` are the stable names used by GROQ queries and mapper.
- The `createStudioConfig()` factory in `studio/config.ts` reads server-side env vars only (`SANITY_PROJECT_ID`, not `NEXT_PUBLIC_`).

### GROQ / Mapper Compatibility
- All schema field names directly match what `queries.ts` projects and what `mapper.ts` reads.
- Do not rename Sanity schema fields without updating `queries.ts` and `mapper.ts` in the same PR.
- Never leak Sanity GROQ raw data or Portable Text JSON beyond `mapper.ts`.

### Intentionally Deferred (Stage 4.2+)
- ~~Sanity Studio route wiring~~ — **Completed in Stage 4.2**
- ~~Singleton Studio enforcement~~ — Partial: new-doc menu suppressed; full `__experimental_actions` deferred to Stage 4.3+
- Visual Editing / Draft Mode / Presentation Tool
- Webhooks and live preview
- Shopify / Tapstitch commerce integration

---

## Stage 4.2 — Sanity Studio Integration & Editorial Workspace

### Studio Route
- **URL**: `/studio` and all sub-paths (`/studio/*`)
- **Route**: `src/app/studio/[[...tool]]/page.tsx` — catch-all for Studio's client-side routing
- **Layout**: `src/app/studio/layout.tsx` — isolated; replaces root storefront layout
- **Isolation**: Storefront `SiteHeader`, GENSIS fonts, and `globals.css` are NOT loaded on Studio pages

### Studio Location (files)
```
src/app/studio/
  layout.tsx                 ← isolated Studio layout (NextStudioLayout)
  [[...tool]]/page.tsx       ← "use client" — NextStudio SPA mount point

src/lib/cms/providers/sanity/studio/
  config.ts                  ← defineConfig() result (gensisStudioConfig)
  structure.ts               ← Structure Builder: Content / Taxonomy / People
```

### Studio Configuration
- `gensisStudioConfig` — result of `defineConfig()` from `sanity` package, consumed by `NextStudio`
- Schema: wires `schemaTypes` from Stage 4.1 registry (all 7 document types + all object types)
- Plugin: `structureTool({ structure: gensisStructure })` for custom editorial navigation

### Editorial Navigation (Structure Builder)
```
GENSIS Editorial
  ├── Content
  │   ├── Journal Articles
  │   ├── Lookbooks
  │   ├── Campaigns
  │   └── About          ← singleton (direct link to fixed document ID)
  ├── Taxonomy
  │   ├── Categories
  │   └── Tags
  └── People
      └── Contributors
```

### About Singleton (Stage 4.2)
- Structure Builder surfaces a direct link to a fixed `about-singleton` document ID
- "About" entry in the Content section opens the single document directly (no list view)
- `newDocumentOptions` in `defineConfig` suppresses `aboutPage` from the global "New document" menu
- Full `__experimental_actions` hiding is deferred to Stage 4.3+

### Environment Variables (Studio)
| Variable | Scope | Purpose |
|:---------|:------|:--------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public (browser) | Required by Studio SPA to connect to Content Lake |
| `NEXT_PUBLIC_SANITY_DATASET` | Public (browser) | Required by Studio SPA |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Public (browser) | Required by Studio SPA |
| `SANITY_PROJECT_ID` | Server-only | Used by application GROQ adapter |
| `SANITY_DATASET` | Server-only | Used by application GROQ adapter |
| `SANITY_API_READ_TOKEN` | Server-only secret | NEVER expose to browser |

### Authentication
- Sanity Studio uses its own session-based authentication
- Editors sign in at `/studio` with their Sanity.io account credentials
- No custom authentication system is implemented
- Route-level access middleware (e.g., protecting `/studio` from public) is deferred to Stage 4.3+

### Security Rules
- `SANITY_API_READ_TOKEN` must NEVER appear in any file imported by client components
- `gensisStudioConfig` contains ONLY public project/dataset identifiers — no secrets
- `src/app/studio/[[...tool]]/page.tsx` imports ONLY from `@/lib/cms/providers/sanity/studio/config`
- Storefront routes (`/`, `/journal/*`, etc.) MUST NOT import any Studio code
- Studio code must NOT import from `@/types/cms`, `@/components`, or storefront layers

### Intentionally Deferred (Stage 4.3+)
- Full singleton enforcement via `__experimental_actions`
- Visual Editing / Presentation Tool
- Draft Mode / Next.js `draftMode()`
- Live preview / real-time subscriptions
- Webhook-driven cache invalidation
- Route-level middleware protecting `/studio`
- Shopify / Tapstitch commerce integration

---

## Stage 4.3 — Sanity Content Seeding & Real Editorial Data Validation

### Seeding Mechanism
- **Script**: `scripts/seed-sanity.ts` uses `@sanity/client` to insert deterministic fixture data into the live Content Lake.
- **Execution**: Run manually via `npx tsx scripts/seed-sanity.ts`
- **Idempotency**: All records use deterministic IDs (e.g., `seed-article-1`, `about-singleton`) and use the `createOrReplace` method, ensuring it's safe to run multiple times without duplicating content or requiring destructive clears.
- **Isolation**: The seed dataset and script exist entirely outside the Next.js compilation boundary and are never sent to the browser.

### Draft Exclusion
- **GROQ Updates**: All provider-specific GROQ queries now include `!(_id in path("drafts.**"))` in addition to checking for `status == "published"`.
- **Reasoning**: This prevents Sanity's internal draft documents (which are created automatically when editing a published document and inherit its "published" status string) from leaking into storefront production queries.

### Environment Requirements for Seeding
| Variable | Scope | Purpose |
|:---------|:------|:--------|
| `SANITY_PROJECT_ID` | Server-only / Local | Needed to identify the correct Sanity project. |
| `SANITY_DATASET` | Server-only / Local | Needed to identify the correct environment (e.g., `production`). |
| `SANITY_API_WRITE_TOKEN` | Local Script-only | **Required** for seeding. This token must never be prefixed with `NEXT_PUBLIC_` and is not needed for the storefront application. |

*If `SANITY_API_WRITE_TOKEN` is missing, the script gracefully exits without making fabricated network requests.*

---

## Stage 4.4 — Sanity Visual Editing & Draft Preview

### Objective
Allow authenticated editors to preview unpublished Sanity content through the Next.js storefront while keeping production routes strictly published-only.

### Core Architecture
- **Next.js Draft Mode**: The mechanism for storing the preview state (via cookie).
- **Sanity Presentation Tool**: The Studio UI that embeds the storefront for side-by-side preview and click-to-edit.
- **Visual Editing**: The Next.js overlay that connects the storefront DOM to the Presentation Tool.

### Draft-Aware CMS Client
- **`SanityPreviewCmsClient`**: A dedicated `CmsClient` implementation used *only* during Draft Mode.
- **Client Configuration**: Uses `stega: true` (for DOM metadata encoding), `perspective: "previewDrafts"`, and `useCdn: false`.
- **Query Strategy**: Preview queries intentionally omit `!(_id in path("drafts.**"))` and `status == "published"` filters.
- **Listing Protection**: Listing methods (e.g., `getJournalArticles`) in the preview client *fall back to production queries*. Drafts must never bulk-appear in public-facing lists, even for editors.

### Routing & Validation
- **`getPreviewCms()`**: A server-only utility (in `src/lib/cms/index.ts`) that checks `draftMode().isEnabled` and returns either the preview client or production client. Routes must call this instead of using the `cms` singleton directly if they need preview support.
- **Enable Route (`/api/draft-mode/enable`)**: Validates the Sanity preview secret (passed via URL) using `@sanity/preview-url-secret` against the live Sanity instance. This ensures only authenticated editors can activate preview.
- **Disable Route (`/api/draft-mode/disable`)**: Clears the Draft Mode cookie. Validates the `redirect` parameter to prevent open redirect vulnerabilities (must be same-origin).

### Security Boundaries
- **`SANITY_API_READ_TOKEN`**: Remains strictly server-side. Never exposed with `NEXT_PUBLIC_`.
- **Visual Editing Component**: Added to `src/app/layout.tsx` but rendered *only* when `draftMode().isEnabled`. Production traffic never downloads the Visual Editing JavaScript bundle.
- **Provider Neutrality**: Route components continue to use the GENSIS domain models (e.g., `JournalArticle`). The Sanity-specific stega encoding strings are transparently passed through the `CmsClient` interface and handled by the Visual Editing overlay.

### Visual Indicator
- **`PreviewBanner`**: A fixed banner shown at the bottom of the screen during Draft Mode to indicate to editors that unpublished content may be visible, providing a clear "Exit Preview" link.

### Intentionally Deferred (Stage 4.5+)
- Webhook-driven on-demand ISR cache invalidation.
- Shopify / Tapstitch commerce data integration.

---

## Stage 4.16 — Production Infrastructure & Deployment Hardening

### Production TokenStore Architecture
- **Boundary**: `src/lib/auth/tokenStore.ts` provides the `TokenStore` interface (`get`, `set`, `delete`).
- **Fail-Closed Policy**: If `NODE_ENV === "production"` and no persistent adapter has been registered via `setTokenStore()`, the development in-memory fallback immediately throws an explicit error to prevent silent session drop.
- **Provider-Neutral Extension**: Persistent adapters (Redis, PostgreSQL, DynamoDB, Vercel KV) implement `TokenStore` and register via `setTokenStore()`.

### Environment & Secrets Validation
- **Module**: `src/lib/config/env.ts` implements server-side, non-network `validateEnv()`.
- **Classification**:
  - `PUBLIC`: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`.
  - `SERVER`: `AUTH_SECRET` (min 32 chars in production), `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`, `SHOPIFY_STOREFRONT_API_VERSION`, `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`.
  - `SCRIPT ONLY`: `SANITY_API_WRITE_TOKEN`.
- **Leak Prevention**: Immediate error if server secrets are prefixed with `NEXT_PUBLIC_`.

### Cookie & Session Hardening
- `gensis_customer_session`: HttpOnly, Secure (in production), SameSite=Lax, Path=/, Max-Age=30d. Encrypted opaque Session ID (AES-256-GCM).
- `gensis_cart_id`: HttpOnly, Secure (in production), SameSite=Lax, Path=/, Max-Age=30d. Opaque cart identifier only.
- `gensis_auth_pkce`: HttpOnly, Secure (in production), SameSite=Lax, Path=/, Max-Age=10m. Encrypted verifier and state.

### Security Headers
Configured in `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-DNS-Prefetch-Control: on`

### Strict Non-Goals
- Tapstitch manufacturing integration
- Custom payment processors / gateways
- Wishlist, product reviews, loyalty programs, recommendation algorithms
- Client-side token caching or sensitive data exposure

---

## Stage 4.17 — Performance + SEO Optimization

### Technical SEO & Metadata
- **Module**: `src/lib/seo/index.ts` provides `constructMetadata()` mapping normalized domain `SeoMetadata` to Next.js App Router metadata with OpenGraph (type: website/article, images, publishedTime), Twitter summary_large_image cards, and canonical absolute URL resolution via `getAbsoluteUrl()`.
- **Directives**: Public pages receive indexable directives (`max-image-preview: large`, etc.); private routes (`/account/*`, `/bag`, `/search`, `/studio/*`) receive strict `noIndex: true` and `noFollow`.

### JSON-LD Structured Data
- **Module**: `src/lib/seo/jsonLd.ts` and `<JsonLd>` Server Component in `src/components/shared/JsonLd.tsx`.
- **Schemas**:
  - `Organization`: Global brand organization schema.
  - `WebSite`: Global website schema with SearchAction.
  - `Product`: Commerce product schema with real price, currency, availability (`InStock`/`OutOfStock`), and SKU.
  - `Article`: Editorial journal article schema with headline, author, publication date, and featured image.
  - `BreadcrumbList`: Structural breadcrumb list schema.
- **XSS Safety**: `safeJsonLd()` sanitizes `<`, `>`, `&`, and unicode line breaks to prevent script injection.

### Crawlability & Indexation (Robots & Sitemap)
- **`src/app/robots.ts`**: Allows crawling of public routes (`/`, `/shop`, `/collections/*`, `/products/*`, `/journal/*`, `/lookbook/*`, `/campaigns/*`, `/about`) and disallows private endpoints (`/account/*`, `/bag`, `/search`, `/api/*`, `/studio/*`). Points to canonical `/sitemap.xml`.
- **`src/app/sitemap.ts`**: Dynamically generates valid XML sitemap entries for static pages and published products, collections, articles, lookbooks, and campaigns with appropriate change frequencies and priorities.

### Image & Rendering Efficiency
- **`GensisImage`**: Injects default responsive `sizes` (`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`) when `isFill` is active without caller-specified sizes.
- **Layout Shift Prevention**: Aspect ratios (`4/5`, `16/9`, `square`) strictly enforced on all figure wrappers.

---

## Stage 4.18 — Final QA & Launch Readiness

### Route & Journey Inventory
- **21 Application Routes Verified**:
  - Public: `/`, `/shop`, `/collections`, `/collections/[slug]`, `/products/[slug]`, `/journal`, `/journal/[slug]`, `/lookbook`, `/lookbook/[slug]`, `/campaigns/[slug]`, `/about`.
  - Search: `/search` (100-character sanitization, `noIndex`).
  - Commerce: `/bag` (`noIndex`, HttpOnly cart ID).
  - Customer Accounts: `/account/login` (`noIndex`), `/account/callback`, `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`.
  - Studio & APIs: `/studio/[[...tool]]`, `/api/draft-mode/*`, `/api/revalidate/sanity`.
  - Metadata: `/robots.txt`, `/sitemap.xml`.

### Verification Suite Baseline
- **TypeScript**: 0 type errors (`tsc --noEmit`).
- **ESLint**: 0 errors, 0 warnings (`npm run lint`).
- **Unit & Integration Suite**: 60 test files, 427 tests passing (`npm run test:run`).
- **Production Build**: Next.js 16.3.3 Turbopack build succeeded with all static and dynamic route generations verified.

---

## Stage 4.19 — Production Launch

### Release Candidate Readiness
- **Release Status**: Codebase is fully release-ready (`NOT DEPLOYED — EXTERNAL DEPENDENCY`).
- **Infrastructure Checklist**:
  - `AUTH_SECRET`: 32+ character high-entropy secret required in production environment.
  - `TokenStore`: Persistent adapter (Redis/KV) required before enabling live customer accounts in production.
  - `Shopify`: Live Storefront API private token, domain, and Customer Account OAuth Client ID required.
  - `Sanity`: Live project ID, dataset, API read token, and webhook revalidation secret required.
  - `Hosting & Domain`: Vercel/cloud hosting deployment with canonical domain, DNS, and SSL.




