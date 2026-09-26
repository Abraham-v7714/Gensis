# src/content/

This directory contains **local content fixtures and schema documentation** for the GENSIS CMS architecture.

## Structure

```
src/content/
├── fixtures/
│   ├── media.ts        — Media asset fixtures using local placeholder paths
│   ├── taxonomy.ts     — Category and tag fixtures
│   ├── contributors.ts — Contributor and author profile fixtures
│   ├── editorial.ts    — Editorial block fixtures covering all 7 block types
│   ├── journal.ts      — JournalArticle development fixtures
│   ├── lookbooks.ts    — Lookbook development fixtures with ordered items
│   ├── campaigns.ts    — Campaign development fixtures with product/collection references
│   ├── about.ts        — AboutPage singleton fixture
│   └── index.ts        — Barrel export for development fixtures
└── README.md
```

## Fixture Architecture & Principles

- **Development/Test Only**: Fixtures exist strictly for local UI development, component previews, and unit/integration tests.
- **Provider-Neutral**: Fixtures implement GENSIS domain types (`@/types/cms`) and contain no CMS-specific fields (`_id`, `_type`, `sys`, `sanityId`, etc.) or CMS SDK objects.
- **Not Production Content**: Fixtures must not be treated as production CMS data and must use clearly fictional development titles/labels (e.g., `(Development Fixture)`).
- **CMS Provider Boundary**: Fixtures must **NEVER** be imported by CMS provider implementations (`src/lib/cms/providers/*`) or production commerce services. They must not be returned by `CmsClient`.
- **Domain Types**: All fixtures strictly satisfy GENSIS domain interfaces (`JournalArticle`, `Lookbook`, `Campaign`, `AboutPage`, `EditorialBlock`, etc.).

## Consuming Fixtures for Local Development

During local UI component development and preview pages (prior to CMS provider wiring), import named fixtures from `@/content/fixtures`:

```ts
import { journalFixtures, editorialFixtures } from "@/content/fixtures";
```

## CMS Architecture Reference

```
src/types/cms/          — Provider-neutral domain types
src/lib/cms/            — CmsClient interface and provider contract
src/content/fixtures/   — Development and testing content fixtures
```
