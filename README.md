# Launchpad Studio

A schema-driven Page Studio that allows authorised users to load page definitions from Contentful, edit via a lightweight WYSIWYG-lite editor, preview rendered landing pages, and publish immutable versioned releases — all backed by quality gates including automated tests, accessibility audits, and CI.

## Architecture Overview

Launchpad Studio is designed as a **small frontend platform with isolated subsystems**, not a monolithic React application. Each top-level directory represents a distinct bounded context with clear responsibilities and minimal coupling.

The **renderer is the core** of the platform. Studio and Preview are both consumers of it — preview can render pages even if the studio doesn't exist.

```
                          ┌──────────────────────┐
                          │    lib/schema/        │
                          │    Zod Schemas        │
                          │  (Page, Section)      │
                          └──────────┬───────────┘
                                     │ validates
                                     ▼
┌──────────────┐          ┌──────────────────────┐
│  content/    │  adapt   │    renderer/          │
│              │────────► │                       │
│ Contentful   │          │  sectionRegistry.ts   │
│ Adapter      │          │  PageRenderer.tsx     │
│ (swappable)  │          │  sections/*           │
└──────────────┘          └──────┬───────┬────────┘
                                 │       │
                    renders      │       │  renders
                                 ▼       ▼
                          ┌──────────┐ ┌──────────────┐
                          │ /preview │ │ /studio      │
                          │ (SSR)    │ │ (Client)     │
                          └──────────┘ └──────┬───────┘
                                              │ edits draft
                                              ▼
                                    ┌──────────────────┐
                                    │  studio/store/   │
                                    │  Redux (scoped)  │
                                    └──────┬───────────┘
                                           │ triggers
                                           ▼
                                    ┌──────────────────┐
                                    │  publish/        │
                                    │  diff → semver   │
                                    │  → snapshot      │
                                    └──────────────────┘
                                           │
                                           ▼
                                    ┌──────────────────┐
                                    │  releases/       │
                                    │  <slug>/<v>.json │
                                    └──────────────────┘
```

### Subsystem Responsibilities

| Subsystem         | Purpose                                                                                                  | Key Principle                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **`renderer/`**   | Schema-driven rendering engine. Maps validated section schemas to React components via a typed registry. | Sections are render modules, not UI components. The registry is the engine's heart. |
| **`content/`**    | CMS data boundary. Wraps Contentful SDK and transforms raw entries into domain models.                   | Fully swappable — no Contentful types leak into renderer or studio.                 |
| **`studio/`**     | Editor application with its own Redux store (draftPage, ui, publish slices).                             | Owns all editor state. Preview/renderer never depend on Redux.                      |
| **`publish/`**    | Handles release creation: diff detection, SemVer calculation, and immutable snapshot generation.         | Core business logic — deterministic and testable in isolation.                      |
| **`rbac/`**       | Role-based access control. Server-side enforcement via Next.js middleware.                               | UI reflects permissions, but security is enforced server-side.                      |
| **`lib/schema/`** | Shared Zod schemas for Page and Section models.                                                          | Shared infrastructure used by renderer, studio, and publish.                        |

## How Preview Rendering Works

Preview does **not** render raw CMS data directly. Data flows through a strict validation pipeline before reaching the renderer:

```
Contentful API → content/adapter (transform) → Zod validation → renderer/PageRenderer → Page
```

This pipeline ensures:
1. **Invalid CMS data never crashes the app** — Zod catches malformed entries before rendering
2. **Unknown section types render gracefully** — `UnsupportedSection` fallback via registry lookup
3. **CMS is fully decoupled** — swapping Contentful for another CMS only changes the `content/` directory
4. **Released versions render independently** — snapshots in `releases/` can also feed the renderer, bypassing CMS entirely

## Redux Slice Responsibilities

Redux state is **scoped to the studio editor only**. Preview and renderer are pure and stateless.

| Slice                | Responsibility                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`draftPageSlice`** | Manages the in-progress page: sections array, add/remove/reorder sections, edit section props (hero text, CTA label/URL). Persisted to localStorage for reload safety. |
| **`uiSlice`**        | Editor UI state: currently selected section index, panel open/closed state, drag state. Ephemeral — not persisted.                                                     |
| **`publishSlice`**   | Publish workflow state: loading status, last published version, publish result (version, changelog).                                                                   |

## Contentful Model + Adapter

### Content Model

Two content types in Contentful:

- **Page** — `pageId`, `slug`, `title`, `sections` (references to Section entries)
- **Section** — `sectionId`, `type` (hero | featureGrid | testimonial | cta), `props` (validated per type)

Section props are validated per section type via **Zod discriminated union schemas** — each type has a distinct prop shape (e.g., `hero` → `heading`, `subheading`; `cta` → `label`, `url`). This ensures full type safety from CMS to renderer.

### Adapter Pattern

```
Contentful API → contentfulClient.ts → contentAdapter.ts → Domain Page Model
                  (SDK wrapper)          (transforms raw     (used by renderer
                   draft/published        entries to clean     and studio)
                   toggle)                domain objects)
```

The adapter boundary (`content/`) ensures:
- No `contentful` SDK types appear in components
- Switching CMS requires changing only this directory
- Draft vs published is isolated to the client configuration

## Publish + SemVer Logic

### Deterministic Diff

The publish flow compares the current draft against the last published snapshot using deep structural comparison:

```
Draft Page ──► diff.ts ──► Change Set ──► semver.ts ──► Version Bump
                                              │
                                              ▼
                                    snapshot.ts ──► releases/<slug>/<version>.json
                                              │
                                              ▼
                                    changelog.ts ──► Human-readable summary
```

### SemVer Rules (Fixed)

| Change Type                                      | Bump              | Examples                          |
| ------------------------------------------------ | ----------------- | --------------------------------- |
| Text/prop change only                            | **Patch** (0.0.x) | Edit hero heading, change CTA URL |
| Add section or optional prop                     | **Minor** (0.x.0) | Add new testimonial section       |
| Remove section, change type, break required prop | **Major** (x.0.0) | Remove hero, change section type  |

### Idempotency

Publishing the same draft twice produces no new version. The diff engine detects zero changes and returns the existing version.

### Immutable Snapshots

Each publish creates a frozen JSON file at `releases/<slug>/<version>.json` containing the full page schema, timestamp, and changelog. The preview/production page can render from a released snapshot independently of CMS state.

## Accessibility Evidence

### WCAG 2.2 AAA-Oriented Practices

- **Keyboard operability**: All interactive elements (studio controls, section editing, navigation) are fully keyboard accessible with logical tab order
- **Visible focus states**: Custom focus-visible rings on all interactive elements
- **Heading hierarchy**: Single `<h1>` per page, sequential heading levels, semantic HTML5 elements
- **`prefers-reduced-motion`**: All animations and transitions respect the user's motion preference via `motion-safe:` / `motion-reduce:` utilities
- **Form accessibility**: All form inputs have associated `<label>` elements, error messages use `aria-describedby`, required fields marked with `aria-required`
- **Axe audit**: Automated accessibility testing via Playwright + axe-core, generating `a11y-report.json` artifact
- **CI enforcement**: GitHub Actions fails on any critical axe violations

## Tech Stack

| Tool                 | Purpose                                 |
| -------------------- | --------------------------------------- |
| Next.js (App Router) | Framework, SSR/ISR, API routes          |
| TypeScript           | Type safety                             |
| Redux Toolkit        | Editor state management (studio-scoped) |
| Contentful           | Headless CMS                            |
| Zod                  | Runtime schema validation               |
| Tailwind CSS         | Styling                                 |
| shadcn/ui            | UI component primitives                 |
| Playwright           | E2E testing                             |
| axe-core             | Accessibility auditing                  |
| Vitest               | Unit testing                            |
| GitHub Actions       | CI/CD                                   |
| Vercel               | Deployment                              |

## Getting Started

### Prerequisites

- Node.js 18+
- A Contentful space with Page and Section content types (or use built-in mock data)

### Setup

```bash
git clone <repo-url>
cd launchpad-studio
npm install
cp .env.local.example .env.local
# Fill in your Contentful credentials (or leave empty for mock data)
npm run dev
```

### Environment Variables

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_PREVIEW_TOKEN=your_preview_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:a11y    # Accessibility audit
```

## What Is Incomplete and Why

> This section will be updated as development progresses to document any features that were deprioritised or left incomplete, along with the rationale.

## License

MIT
