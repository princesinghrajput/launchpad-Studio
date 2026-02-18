# Launchpad Studio

A schema-driven page builder — load content from Contentful, edit it in a WYSIWYG-lite studio, and publish immutable versioned releases with automated SemVer, changelogs, and RBAC.

> Timeboxed to ~3 hours. See [What's Incomplete](#whats-incomplete) for tradeoffs.

---

## Quick Look

|            Landing Page             |             Studio Editor             |
| :---------------------------------: | :-----------------------------------: |
| ![Landing](/public/images/home.png) | ![Editor](/public/images/editors.png) |

|               Publisher View               |           Viewer / Preview           |
| :----------------------------------------: | :----------------------------------: |
| ![Publisher](/public/images/publisher.png) | ![Viewer](/public/images/viewer.png) |

---

## Architecture

```
                    ┌─────────────────────┐
                    │   Contentful (CMS)  │
                    └─────────┬───────────┘
                              │ fetch
                              ▼
                    ┌─────────────────────┐
                    │   content/adapter   │
                    │  (transform + map)  │
                    └─────────┬───────────┘
                              │ clean domain model
                              ▼
                    ┌─────────────────────┐
                    │   Zod validation    │
                    │  (PageSchema)       │
                    └─────────┬───────────┘
                              │ validated Page
                              ▼
                    ┌─────────────────────┐
                    │     renderer/       │
                    │   PageRenderer +    │
                    │  sectionRegistry    │
                    └────┬──────────┬─────┘
                         │          │
              renders    │          │  renders (live preview)
                         ▼          ▼
               ┌──────────┐  ┌───────────────┐
               │ /preview  │  │   /studio     │
               │  (SSR)    │  │  (Client)     │
               └──────────┘  └───────┬───────┘
                                     │ user edits
                                     ▼
                           ┌──────────────────┐
                           │   Redux store    │
                           │  (draft + UI +   │
                           │   publish slice) │
                           └────────┬─────────┘
                                    │ dispatch publishDraft
                                    ▼
                           ┌──────────────────┐
                           │ POST /api/publish│
                           │  (RBAC gated)    │
                           └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │    publish/      │
                           │ diff → semver →  │
                           │ changelog →      │
                           │ snapshot         │
                           └────────┬─────────┘
                                    │ write
                                    ▼
                           ┌──────────────────┐
                           │ Snapshot Storage  │
                           │ (Vercel Blob or  │
                           │  local fs)       │
                           └──────────────────┘

  Published snapshots can render via /preview
  without contacting Contentful.
```

### Data Loading Priority

Both `/preview` and `/studio` load data in this order:

1. **localStorage draft** (if user is mid-edit) — preview shows an amber "Viewing draft" banner
2. **Latest published snapshot** (from Vercel Blob or `releases/` folder)
3. **Contentful / mock data** (only if nothing has been published yet)

---

## Subsystems

**renderer/** — Core rendering engine. A typed `Record<SectionType, Component>` registry maps section schemas to React components. Unknown types get an `UnsupportedSection` fallback. The renderer is CMS-agnostic — it doesn't care if data comes from Contentful, localStorage, or a snapshot.

**content/** — Contentful boundary. Wraps the SDK, transforms raw entries into domain models via `contentAdapter.ts`. No Contentful types leak outside this directory. Falls back to mock data when credentials aren't set.

**studio/** — Editor app with its own Redux store (three slices: `draftPage`, `ui`, `publish`). Drafts auto-save to localStorage. Live preview renders the current draft in real time.

**publish/** — Release pipeline. `diff.ts` compares draft vs last snapshot, `semver.ts` determines the bump (text→patch, add→minor, remove→major), `changelog.ts` generates a summary, `snapshot.ts` writes an immutable JSON file. Publishing identical content is a no-op.

**rbac/** — Server-side role enforcement via Next.js middleware. Viewers can't access `/studio`, only publishers can hit `/api/publish`.

---

## Project Structure

```
├── app/
│   ├── api/publish/route.ts        # Validate → diff → version → snapshot
│   ├── api/set-role/route.ts       # Sets role cookie for demo
│   ├── preview/[slug]/page.tsx     # SSR preview page
│   ├── studio/[slug]/page.tsx      # Studio editor page
│   └── page.tsx                    # Landing page with role switcher
├── content/
│   ├── contentfulClient.ts         # Contentful SDK (delivery + preview)
│   ├── contentAdapter.ts           # CMS → domain model transform
│   ├── getPageBySlug.ts            # Fetcher with mock fallback
│   └── types.ts                    # CMS-specific types (internal only)
├── renderer/
│   ├── sectionRegistry.ts          # Section type → component map
│   ├── PageRenderer.tsx            # Iterates sections, renders via registry
│   ├── ErrorBoundary.tsx           # Catches section render crashes
│   ├── DraftPreview.tsx            # Client-side draft loader
│   └── sections/                   # Hero, FeatureGrid, Testimonial, CTA, Unsupported
├── studio/
│   ├── components/                 # StudioEditor, SectionList, SectionEditor, Toolbar
│   └── store/slices/               # draftPageSlice, uiSlice, publishSlice
├── publish/
│   ├── diff.ts                     # Page structural comparison
│   ├── semver.ts                   # Version bump calculator
│   ├── changelog.ts                # Human-readable change summary
│   └── snapshot.ts                 # Dual storage (Vercel Blob / filesystem)
├── rbac/roles.ts                   # Role definitions
├── middleware.ts                    # Route-level RBAC enforcement
└── lib/schema/page.ts              # Zod schemas: Page, Section, SectionType
```

---

## Contentful Model

Two content types:

| Content Type | Fields                                                                            |
| ------------ | --------------------------------------------------------------------------------- |
| **Section**  | `sectionId` (text), `type` (text), `props` (JSON)                                 |
| **Page**     | `pageId` (text), `slug` (text), `title` (text), `sections` (references → Section) |

`contentAdapter.ts` transforms raw Contentful entries into domain objects. When `CONTENTFUL_SPACE_ID` isn't set, mock data is served instead — no setup required for local development.

---

## Publish Pipeline

1. Draft validated against Zod schemas
2. `diff.ts` compares draft vs last published snapshot
3. `semver.ts` picks the bump — text edits → patch, new sections → minor, removals → major
4. `changelog.ts` generates a summary
5. `snapshot.ts` writes an immutable JSON file to Vercel Blob (production) or filesystem (local)
6. localStorage draft is cleared, studio shows "Published ✓"

Publishing identical content returns the existing version — no duplicates.

### Example Snapshot (`releases/home/0.1.0.json`)

```json
{
  "version": "0.1.0",
  "page": {
    "pageId": "home",
    "slug": "home",
    "title": "Welcome to Launchpad",
    "sections": [
      {
        "id": "s1",
        "type": "hero",
        "props": {
          "heading": "Build landing pages, fast",
          "subheading": "A schema-driven studio for creating and publishing pages."
        }
      },
      {
        "id": "s2",
        "type": "featureGrid",
        "props": {
          "features": [
            { "title": "Schema-Driven", "body": "Zod-validated sections" },
            { "title": "Version Control", "body": "Automated SemVer" },
            { "title": "WYSIWYG-Lite", "body": "Edit and preview in real time" }
          ]
        }
      },
      {
        "id": "s3",
        "type": "testimonial",
        "props": {
          "quote": "Launchpad Studio changed how we ship pages.",
          "author": "Engineering Lead"
        }
      },
      {
        "id": "s4",
        "type": "cta",
        "props": {
          "label": "Get Started",
          "url": "/studio/home"
        }
      }
    ]
  },
  "changelog": "- Added hero section\n- Added featureGrid section\n- Added testimonial section\n- Added cta section",
  "publishedAt": "2026-02-18T17:07:28.220Z"
}
```

Each snapshot is immutable — once written, it's never modified. The preview page can render directly from a snapshot without contacting Contentful.

---

## RBAC

| Role      | Studio | Edit  | Publish | Preview |
| --------- | :----: | :---: | :-----: | :-----: |
| Viewer    |   ✗    |   ✗   |    ✗    |    ✓    |
| Editor    |   ✓    |   ✓   |    ✗    |    ✓    |
| Publisher |   ✓    |   ✓   |    ✓    |    ✓    |

Switch roles from the landing page or via `/api/set-role?role=publisher&redirect=/studio/home`.

---

## Getting Started

```bash
git clone https://github.com/princesinghrajput/launchpad-Studio.git
cd launchpad-studio
npm install
cp .env.local.example .env.local
npm run dev
```

### Environment Variables

```env
CONTENTFUL_SPACE_ID=...            # leave empty to use mock data
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_TOKEN=...
BLOB_READ_WRITE_TOKEN=...          # Vercel Blob token (for deployed publishing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

```bash
npm run dev       # dev server
npm run build     # production build
npm run lint      # eslint
npm run test      # unit tests (vitest)
npm run test:e2e  # e2e tests (playwright)
```

---

## Tech Stack

Next.js 15 (App Router) · TypeScript · Redux Toolkit · Contentful · Zod · Tailwind CSS · Vercel Blob · Playwright · Vitest

---

## What's Incomplete

**Drag-to-reorder** — Replaced with Up/Down buttons. Keyboard-accessible and simpler than wiring up a DnD library.

**FeatureGrid & Testimonial editing** — These render correctly but their props can't be edited in the studio. Focused on Hero and CTA editing which were the core requirement.

**Tests** — Vitest and Playwright configs are in place, test files aren't written yet. The publish module (diff, semver) is designed as pure functions for easy testing.

**Auth** — Role is a plain cookie, no sessions. Would use NextAuth in production.

**CI** — Not wired up. Would run `build` + `test` + Playwright on push via GitHub Actions.

---

## License

MIT
