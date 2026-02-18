# Launchpad Studio

A schema-driven Page Studio that allows authorised users to load page definitions from Contentful, edit via a lightweight WYSIWYG-lite editor, preview rendered landing pages, and publish immutable versioned releases — all backed by quality gates including automated tests, accessibility audits, and CI.

## Screenshots

### Landing Page
![Landing Page](/public/images/home.png)

### Studio Editor (Editor Role)
![Studio Editor](/public/images/editors.png)

### Publisher View
![Publisher View](/public/images/publisher.png)

### Viewer / Preview
![Viewer Preview](/public/images/viewer.png)

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
│ (swappable)  │          │  ErrorBoundary.tsx    │
└──────────────┘          │  DraftPreview.tsx     │
                          │  sections/*           │
                          └──────┬───────┬────────┘
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
                                    │  Vercel Blob     │
                                    │  (or filesystem) │
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

### Project Structure

```
launchpad-studio/
├── app/
│   ├── api/
│   │   ├── publish/route.ts       # POST endpoint — validates, diffs, versions, snapshots
│   │   └── set-role/route.ts      # Dev helper — sets role cookie
│   ├── preview/[slug]/page.tsx    # SSR preview — loads published release or CMS data
│   ├── studio/[slug]/page.tsx     # Studio page — loads latest release as starting point
│   ├── page.tsx                   # Landing page with role switcher
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── content/
│   ├── contentfulClient.ts        # Contentful SDK wrapper (delivery + preview)
│   ├── contentAdapter.ts          # Transforms raw CMS entries → domain models
│   ├── getPageBySlug.ts           # Page fetcher with mock fallback
│   └── types.ts                   # Contentful-specific types (never exported)
├── renderer/
│   ├── sectionRegistry.ts         # Typed Record<SectionType, Component> map
│   ├── PageRenderer.tsx           # Iterates sections, looks up registry, renders
│   ├── ErrorBoundary.tsx          # Class component error boundary
│   ├── DraftPreview.tsx           # Client component — checks localStorage for drafts
│   └── sections/
│       ├── HeroSection.tsx
│       ├── FeatureGridSection.tsx
│       ├── TestimonialSection.tsx
│       ├── CtaSection.tsx
│       └── UnsupportedSection.tsx # Fallback for unknown section types
├── studio/
│   ├── components/
│   │   ├── StudioEditor.tsx       # Main layout — sidebar + live preview
│   │   ├── SectionList.tsx        # Section list with reorder + delete
│   │   ├── SectionEditor.tsx      # Property editor for selected section
│   │   └── Toolbar.tsx            # Add section, reset, publish
│   ├── hooks/
│   │   └── useStudioStore.ts      # Typed Redux hooks
│   └── store/
│       ├── index.ts               # Store configuration
│       ├── provider.tsx           # Redux provider
│       └── slices/
│           ├── draftPageSlice.ts   # Draft state + localStorage persistence
│           ├── uiSlice.ts          # Selected section, UI state
│           └── publishSlice.ts     # Publish workflow + async thunk
├── publish/
│   ├── diff.ts                    # Structural page comparison
│   ├── semver.ts                  # Version bump calculator
│   ├── changelog.ts               # Human-readable change summary
│   └── snapshot.ts                # Dual-mode storage (Vercel Blob / filesystem)
├── rbac/
│   └── roles.ts                   # Role definitions and permission helpers
├── lib/
│   └── schema/
│       └── page.ts                # Zod schemas: Page, Section, SectionType
├── middleware.ts                   # RBAC enforcement (studio + publish routes)
└── public/images/                  # Screenshots
```

## How Preview Rendering Works

Preview does **not** render raw CMS data directly. Data flows through a strict validation pipeline before reaching the renderer:

```
Contentful API → content/adapter (transform) → Zod validation → renderer/PageRenderer → Page
```

The preview page loads data in this priority order:
1. **localStorage draft** (if editing in studio) — shown with amber "unsaved draft" banner
2. **Latest published release** (from Vercel Blob or filesystem)
3. **CMS/mock data** — only if nothing has been published yet

This pipeline ensures:
1. **Invalid CMS data never crashes the app** — Zod catches malformed entries before rendering
2. **Unknown section types render gracefully** — `UnsupportedSection` fallback via registry lookup
3. **CMS is fully decoupled** — swapping Contentful for another CMS only changes the `content/` directory
4. **Released versions render independently** — snapshots can feed the renderer, bypassing CMS entirely

## Redux Slice Responsibilities

Redux state is **scoped to the studio editor only**. Preview and renderer are pure and stateless.

| Slice                | Responsibility                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`draftPageSlice`** | Manages the in-progress page: sections array, add/remove/reorder sections, edit section props (hero text, CTA label/URL). Persisted to localStorage for reload safety. |
| **`uiSlice`**        | Editor UI state: currently selected section index. Ephemeral — not persisted.                                                                                          |
| **`publishSlice`**   | Publish workflow state: loading status, last published version, publish result (version, changelog). Clears localStorage draft on success.                             |

## Contentful Model + Adapter

### Content Model

Two content types in Contentful:

- **Page** — `pageId`, `slug`, `title`, `sections` (references to Section entries)
- **Section** — `sectionId`, `type` (hero | featureGrid | testimonial | cta), `props` (JSON object validated per type)

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
- Draft vs published content is isolated to the client configuration
- When Contentful credentials aren't configured, mock data is served seamlessly

## Publish + SemVer Logic

### Deterministic Diff

The publish flow compares the current draft against the last published snapshot using deep structural comparison:

```
Draft Page ──► diff.ts ──► Change Set ──► semver.ts ──► Version Bump
                                              │
                                              ▼
                                    snapshot.ts ──► Vercel Blob / filesystem
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

Each publish creates a frozen JSON snapshot containing the full page schema, timestamp, and changelog. Storage is dual-mode:
- **Vercel Blob** (when `BLOB_READ_WRITE_TOKEN` is set) — works on Vercel's serverless environment
- **Filesystem** (`releases/<slug>/<version>.json`) — works locally during development

## RBAC (Role-Based Access Control)

Three roles with server-side enforcement via Next.js middleware:

| Role          |       Studio Access       | Editing | Publish | Preview |
| ------------- | :-----------------------: | :-----: | :-----: | :-----: |
| **Viewer**    | ✗ (redirected to preview) |    ✗    |    ✗    |    ✓    |
| **Editor**    |             ✓             |    ✓    |    ✗    |    ✓    |
| **Publisher** |             ✓             |    ✓    |    ✓    |    ✓    |

Roles are set via cookie and can be switched from the landing page or via `/api/set-role?role=publisher&redirect=/studio/home`.

## Accessibility Evidence

### WCAG 2.2 Practices

- **Keyboard operability**: All interactive elements are fully keyboard accessible with logical tab order
- **Visible focus states**: Custom focus-visible rings on all interactive elements
- **Heading hierarchy**: Single `<h1>` per page, sequential heading levels, semantic HTML5 elements
- **Form accessibility**: All form inputs have associated `<label>` elements
- **Error boundaries**: Rendering errors are caught and displayed gracefully
- **Semantic HTML**: `<blockquote>` for testimonials, `<a>` for CTAs (not `<button>`), `<main>` landmarks

## Tech Stack

| Tool                 | Purpose                                 |
| -------------------- | --------------------------------------- |
| Next.js (App Router) | Framework, SSR/ISR, API routes          |
| TypeScript           | Type safety                             |
| Redux Toolkit        | Editor state management (studio-scoped) |
| Contentful           | Headless CMS                            |
| Zod                  | Runtime schema validation               |
| Tailwind CSS         | Styling                                 |
| Vercel Blob          | Snapshot storage (production)           |
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
git clone https://github.com/princesinghrajput/launchpad-Studio.git
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
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

## What Is Incomplete and Why

**Drag-to-reorder**: Replaced with Up/Down buttons. Drag-and-drop libraries add significant complexity; the keyboard alternative is more accessible anyway.

**FeatureGrid and Testimonial prop editing**: The brief specifies Hero text and CTA label/URL as the required editable props. These section types render correctly from CMS data but their props can't be edited inline in the studio.

**Authentication**: Role is stored in a plain cookie with no signing or session management. This is demo-only. Real auth would use NextAuth or a similar provider.

**Unit and E2E tests**: Vitest config and Playwright config are set up but test files are pending. The `publish/` module (diff, semver, changelog) is designed to be testable in isolation.

## License

MIT
