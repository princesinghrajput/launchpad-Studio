# Launchpad Studio

A page builder where you load content from Contentful, tweak it in a WYSIWYG-lite editor, and publish immutable versioned releases. Built with Next.js App Router, Redux Toolkit, and Zod schemas.

> Built as a take-home assignment. Timeboxed to ~3-4 hours, so some things are intentionally rough around the edges. See [What's Incomplete](#whats-incomplete) for details.

---

## Quick Look

|            Landing Page             |             Studio Editor             |
| :---------------------------------: | :-----------------------------------: |
| ![Landing](/public/images/home.png) | ![Editor](/public/images/editors.png) |

|               Publisher View               |           Viewer / Preview           |
| :----------------------------------------: | :----------------------------------: |
| ![Publisher](/public/images/publisher.png) | ![Viewer](/public/images/viewer.png) |

---

## How It Works

The app has five isolated subsystems. Each one does one thing and doesn't leak into the others.

```
 Contentful ──► content/adapter ──► Zod validation ──► renderer/ ──► /preview (SSR)
                                                           │
                                                           └──► /studio (client)
                                                                    │
                                                                    ▼
                                                              Redux store
                                                                    │
                                                                    ▼
                                                         publish/ (diff → semver → snapshot)
                                                                    │
                                                                    ▼
                                                         Vercel Blob / local filesystem
```

**renderer/** — The core engine. A typed registry maps section types → React components. If the registry doesn't know a type, it renders a fallback. The renderer doesn't care where data comes from — CMS, localStorage draft, or a published snapshot all work the same.

**content/** — Wraps Contentful. Nothing outside this folder imports from the Contentful SDK. You could swap to Sanity or Strapi by changing just this directory. Falls back to mock data when credentials aren't configured.

**studio/** — The editor. Has its own Redux store with three slices: draft page state, UI state (selected section), and publish workflow. Drafts auto-save to localStorage so you don't lose work on refresh.

**publish/** — Business logic for releasing. Diffs the draft against the last snapshot, calculates a semver bump (patch/minor/major based on change type), generates a changelog, and writes an immutable snapshot. Publishing the same content twice is a no-op (idempotent).

**rbac/** — Three roles: viewer, editor, publisher. Enforced server-side via Next.js middleware — viewers get redirected from `/studio` to `/preview`, only publishers can hit `/api/publish`.

---

## Project Structure

```
├── app/
│   ├── api/publish/route.ts        # Validates draft, diffs, bumps version, saves snapshot
│   ├── api/set-role/route.ts       # Sets role cookie (for demo)
│   ├── preview/[slug]/page.tsx     # SSR — loads published release > CMS data
│   ├── studio/[slug]/page.tsx      # Loads latest release into editor
│   └── page.tsx                    # Landing page with role switcher
├── content/
│   ├── contentfulClient.ts         # SDK wrapper (delivery + preview APIs)
│   ├── contentAdapter.ts           # Raw Contentful → clean domain model
│   ├── getPageBySlug.ts            # Fetcher with mock fallback
│   └── types.ts                    # Contentful types (never exported outside)
├── renderer/
│   ├── sectionRegistry.ts          # Record<SectionType, Component>
│   ├── PageRenderer.tsx            # Maps sections → components
│   ├── ErrorBoundary.tsx           # Catches render crashes
│   ├── DraftPreview.tsx            # Reads localStorage, shows draft banner
│   └── sections/                   # Hero, FeatureGrid, Testimonial, CTA, Unsupported
├── studio/
│   ├── components/                 # StudioEditor, SectionList, SectionEditor, Toolbar
│   └── store/slices/               # draftPageSlice, uiSlice, publishSlice
├── publish/
│   ├── diff.ts                     # Structural comparison of two pages
│   ├── semver.ts                   # Bump rules: text→patch, add→minor, remove→major
│   ├── changelog.ts                # "Added 1 section. Updated hero text."
│   └── snapshot.ts                 # Writes to Vercel Blob or local fs
├── rbac/roles.ts                   # Role definitions
├── middleware.ts                    # Server-side route protection
└── lib/schema/page.ts              # Zod schemas (Page, Section, SectionType)
```

---

## Contentful Setup

Two content types:

**Section** — fields: `sectionId` (text), `type` (text), `props` (JSON)  
**Page** — fields: `pageId` (text), `slug` (text), `title` (text), `sections` (references → Section)

The adapter in `content/contentAdapter.ts` transforms raw entries into domain objects. Zod validates everything before it hits the renderer. If you don't set Contentful credentials, mock data kicks in automatically — the app works either way.

---

## Publish Pipeline

When you hit Publish:

1. Draft is validated against Zod schemas
2. `diff.ts` compares draft vs last published version
3. `semver.ts` picks the bump: text edits → patch, new sections → minor, removed sections → major
4. `changelog.ts` generates a human-readable summary
5. `snapshot.ts` saves an immutable JSON snapshot (Vercel Blob in production, filesystem locally)
6. Studio clears the localStorage draft and shows "Published ✓"

Same content published twice? Returns the existing version — no duplicate snapshots.

---

## RBAC

| Role      | Studio | Edit  | Publish | Preview |
| --------- | :----: | :---: | :-----: | :-----: |
| Viewer    |   ✗    |   ✗   |    ✗    |    ✓    |
| Editor    |   ✓    |   ✓   |    ✗    |    ✓    |
| Publisher |   ✓    |   ✓   |    ✓    |    ✓    |

Switch roles from the landing page or hit `/api/set-role?role=publisher&redirect=/studio/home`. It's a cookie — no real auth, just enough for demo.

---

## Running Locally

```bash
git clone https://github.com/princesinghrajput/launchpad-Studio.git
cd launchpad-studio
npm install
cp .env.local.example .env.local   # fill in credentials or leave empty for mock data
npm run dev
```

### Env Variables

```env
CONTENTFUL_SPACE_ID=...           # optional — mock data used if empty
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_TOKEN=...
BLOB_READ_WRITE_TOKEN=...         # for Vercel Blob (publishing on Vercel)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

```bash
npm run dev       # dev server
npm run build     # production build
npm run lint      # eslint
npm run test      # vitest (unit tests)
npm run test:e2e  # playwright
```

---

## Tech Stack

Next.js 15 (App Router) · TypeScript · Redux Toolkit · Contentful · Zod · Tailwind CSS · Vercel Blob · Playwright · Vitest

---

## What's Incomplete

Being honest about what got cut due to the time constraint:

**Drag-to-reorder** — Went with Up/Down buttons instead. Less flashy, but keyboard-accessible and took 10 minutes instead of an hour with a DnD library.

**FeatureGrid & Testimonial editing** — These render fine from CMS data, but you can't edit their props in the studio. Focused on Hero and CTA editing since those were explicitly required.

**Tests** — Vitest and Playwright configs are set up but the actual test files aren't written yet. The `publish/` module is designed to be testable in isolation — diff and semver are pure functions.

**Auth** — Role is a plain cookie. No signing, no sessions. For a real app you'd use NextAuth or similar. Good enough for demoing RBAC.

**CI** — GitHub Actions workflow isn't wired up yet. The plan was to run `npm test` + `npm run build` + Playwright on push.

---

## License

MIT
