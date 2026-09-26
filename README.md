# GENSIS

## Project Purpose
GENSIS is a premium web application featuring Next.js App Router, TypeScript, Tailwind CSS, and a custom design token system. It is designed to be highly scalable with a clean architecture that separates generic UI primitives, feature modules, and abstracted service integrations (commerce, CMS, analytics, etc.).

## Commands

- **Development:** `npm run dev`
- **Linting:** `npm run lint`
- **Build:** `npm run build`

## Architecture Overview

The project follows a strict hierarchical architecture to ensure maintainability and scalability:

- **`src/app/`**: Next.js App Router routing and page composition. No provider-specific business logic is kept here.
- **`src/components/`**: 
  - `ui/`: Generic, provider-agnostic UI primitives.
  - `layout/`: Structural layout components.
  - `navigation/`: Navigation-specific components.
  - `shared/`: Reusable cross-feature components.
- **`src/features/`**: Business-domain functionality (e.g., products, checkout, cart). Each feature owns its internal components, queries, and mutations.
- **`src/lib/`**: Abstractions for external services:
  - `commerce/`: Commerce provider abstractions.
  - `cms/`: CMS provider abstractions.
  - `analytics/`: Analytics abstractions.
  - `auth/`: Authentication boundary.
  - `fulfillment/`: Fulfillment boundaries.
  - `utils/`: Genuinely shared utilities.
- **`src/config/`**: Global application configuration.
- **`src/types/`**: Shared application types.
- **`src/content/`**: Local content belonging in the repository.
- **`tests/`**: Contains `unit/`, `integration/`, and `e2e/` test boundaries.
