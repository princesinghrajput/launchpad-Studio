# Launchpad Studio — Sprint Tickets (5h Budget)

> Scope is intentionally tight. Every feature must work, not every edge case handled.
> Cut corners on polish, not on architecture. The structure must be correct even if the UI is bare.

---

## Realistic Time Budget

| Ticket | What | Time |
|---|---|---|
| LS-001 | Scaffold + Zod schemas | 30m |
| LS-002 | Renderer + preview route | 45m |
| LS-003 | Contentful client + adapter | 45m |
| LS-004 | Redux + studio editor | 75m |
| LS-005 | RBAC middleware | 20m |
| LS-006 | Publish flow + API | 45m |
| LS-007 | Tests + CI | 30m |
| LS-008 | README + a11y basics | 10m |
| | **Total** | **~5h** |

---

## What Gets Cut (document in README "incomplete" section)

- Drag-to-reorder → replaced with Up/Down buttons (keyboard accessible, far simpler)
- FeatureGrid and Testimonial prop editing → brief only required Hero and CTA, skip
- Axe audit covers `/preview` only — one page is enough to show the pattern
- Snapshots use local filesystem — Vercel limitation documented, not solved
- Auth is a role cookie — no real session, just set manually for demo
- No `redux-persist` — localStorage sync done manually in ~10 lines

---

## LS-001 · Scaffold + Zod schemas
**Time:** 30m

**Do this:**
- `npx create-next-app@latest` — App Router, TypeScript strict, no src/ dir
- Install shadcn/ui, configure Tailwind
- Create dirs: `renderer/`, `content/`, `studio/`, `publish/`, `rbac/`, `lib/schema/`
- Write `lib/schema/index.ts`

```ts
// lib/schema/index.ts
import { z } from 'zod'

const HeroPropsSchema = z.object({ heading: z.string(), subheading: z.string().optional() })
const CtaPropsSchema = z.object({ label: z.string(), url: z.string() })
const FeatureGridPropsSchema = z.object({
  features: z.array(z.object({ title: z.string(), body: z.string() })),
})
const TestimonialPropsSchema = z.object({ quote: z.string(), author: z.string() })

export const SectionSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string(), type: z.literal('hero'), props: HeroPropsSchema }),
  z.object({ id: z.string(), type: z.literal('featureGrid'), props: FeatureGridPropsSchema }),
  z.object({ id: z.string(), type: z.literal('testimonial'), props: TestimonialPropsSchema }),
  z.object({ id: z.string(), type: z.literal('cta'), props: CtaPropsSchema }),
])

export const PageSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(SectionSchema),
})

export type Page = z.infer<typeof PageSchema>
export type Section = z.infer<typeof SectionSchema>
export type SectionType = Section['type']
```

**Commits:**
```
init next.js with typescript and tailwind
add zod schemas for page and section types
```

---

## LS-002 · Renderer + `/preview/[slug]`
**Time:** 45m

**Do this:**

`renderer/sectionRegistry.ts`:
```ts
import type { SectionType } from '@/lib/schema'

// Record<SectionType, ...> means TS errors if a type is missing from the map
type SectionRegistry = Record<SectionType, React.ComponentType<any>>

export const sectionRegistry: SectionRegistry = {
  hero: HeroSection,
  featureGrid: FeatureGridSection,
  testimonial: TestimonialSection,
  cta: CtaSection,
}
```

`renderer/PageRenderer.tsx` — iterate sections, look up registry, render or fall back to `<UnsupportedSection>`. Wrap in a simple error boundary class component so crashes don't bubble.

Section components — keep markup minimal:
- `HeroSection` → `<h2>` + `<p>`
- `FeatureGridSection` → `<ul>` of items
- `TestimonialSection` → `<blockquote>` + `<cite>`
- `CtaSection` → `<a data-testid="cta-button" href={url}>` styled as button
- `UnsupportedSection` → `<p>Unknown section: {type}</p>`

`app/preview/[slug]/page.tsx`:
```ts
const raw = await getPageBySlug(slug)
if (!raw) return notFound()
const result = PageSchema.safeParse(raw)
if (!result.success) return <div>Invalid page data</div>
return (
  <main>
    <h1>{result.data.title}</h1>
    <PageRenderer page={result.data} />
  </main>
)
```

**Commits:**
```
add typed section registry and PageRenderer with error boundary
add section components: hero, featureGrid, testimonial, cta
add preview route with Zod validation and notFound handling
```

---

## LS-003 · Contentful integration
**Time:** 45m

**Do this:**

Set up in Contentful dashboard (5 min):
- **Page** content type: `pageId` (Short text), `slug` (Short text, unique), `title` (Short text), `sections` (References, many)
- **Section** content type: `sectionId` (Short text), `type` (Short text), `props` (JSON)
- Create at least 1-2 real Page entries covering all four section types

`content/contentfulClient.ts`:
```ts
import { createClient } from 'contentful'

export const getClient = (preview = false) =>
  createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: preview
      ? process.env.CONTENTFUL_PREVIEW_TOKEN!
      : process.env.CONTENTFUL_ACCESS_TOKEN!,
    host: preview ? 'preview.contentful.com' : 'cdn.contentful.com',
  })
```

`content/contentAdapter.ts` — transform raw entries into clean domain objects. Don't export any Contentful types. Handle null fields without throwing. This is ~30 lines.

`content/index.ts`:
```ts
export async function getPageBySlug(slug: string, preview = false): Promise<Page | null>
export async function getAllPageSlugs(): Promise<string[]>
```

No Contentful import outside `content/` — if you catch yourself typing `import { ... } from 'contentful'` in a component file, stop and move that logic into the adapter.

**Commits:**
```
set up Contentful space with Page and Section content types
add Contentful client with delivery/preview toggle
add content adapter and getPageBySlug
```

---

## LS-004 · Redux store + studio editor
**Time:** 75m — timebox this strictly

**Do this:**

Install: `npm install @reduxjs/toolkit react-redux`

`studio/store/draftPageSlice.ts`:
```ts
// Actions needed: loadPage, addSection, removeSection, moveSection, updateSectionProps
// localStorage sync: on loadPage check if localStorage has a newer draft for this slug
// on every mutation: write sections to localStorage['draft:{slug}']
// Keep it manual — no redux-persist needed
```

`studio/store/uiSlice.ts`:
```ts
// selectedSectionId: string | null
// selectSection(id), deselectSection()
// that's it
```

`studio/store/publishSlice.ts`:
```ts
// status: 'idle' | 'loading' | 'success' | 'error'
// result: { version, changelog } | null
// publishDraft(slug) async thunk → POST /api/publish with { slug, draft: currentPage }
```

`app/studio/[slug]/page.tsx` — server component, fetch page, pass to `<StudioEditor initialPage={page} />`

`studio/StudioEditor.tsx` — `'use client'`, on mount dispatch `loadPage(initialPage)` if no draft in localStorage:
```tsx
// Two column layout:
// Left (1/3): <SectionList /> + <SectionEditor />
// Right (2/3): <PageRenderer page={draftPage} />
```

`studio/SectionList.tsx`:
```tsx
// <ul> of sections
// Each item: type label + [Up] [Down] buttons + [Delete] button
// Click on item: dispatch selectSection(id)
// Up/Down: dispatch moveSection({ id, direction: 'up' | 'down' })
```

`studio/SectionEditor.tsx`:
```tsx
// Selected section = hero → show heading input, subheading input
// Selected section = cta → show label input, url input
// Nothing selected → <p>Select a section to edit</p>
// onChange → dispatch updateSectionProps immediately
// Every input needs a <label htmlFor>
```

`studio/Toolbar.tsx`:
```tsx
// "Add Section" → <select> of types + "Add" button → dispatch addSection with default props
// "Publish" → dispatch publishDraft(slug) → show status below button
// Hide publish if role !== 'publisher' (pass role as prop)
```

**Commits:**
```
add Redux store with draftPage, ui, and publish slices
add manual localStorage persistence for draft state
add studio route and StudioEditor with split-pane layout
add SectionList with up/down reorder and delete
add SectionEditor for hero and cta props
add Toolbar with add section and publish
```

---

## LS-005 · RBAC middleware
**Time:** 20m

**Do this:**

`rbac/getRole.ts`:
```ts
import { cookies } from 'next/headers'

export type Role = 'viewer' | 'editor' | 'publisher'

export function getRole(): Role {
  const role = cookies().get('role')?.value
  if (role === 'publisher' || role === 'editor') return role
  return 'viewer'
}
```

`middleware.ts` (root level):
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value ?? 'viewer'
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/studio')) {
    if (role === 'viewer') {
      const slug = pathname.split('/')[2]
      return NextResponse.redirect(new URL(`/preview/${slug}`, request.url))
    }
  }

  if (pathname.startsWith('/api/publish')) {
    if (role !== 'publisher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
    }
  }

  return NextResponse.next()
}
```

Add a tiny `app/api/set-role/route.ts` that sets the cookie and redirects — makes testing the three roles trivial without touching devtools.

**Commits:**
```
add role-based middleware for studio and publish routes
add set-role endpoint for dev testing
```

---

## LS-006 · Publish flow + `/api/publish`
**Time:** 45m

**Do this:**

`publish/diff.ts`:
```ts
export type ChangeType = 'text' | 'add' | 'remove' | 'type-change'
export type DiffResult = {
  hasChanges: boolean
  changes: Array<{ sectionId: string; changeType: ChangeType }>
}

// match sections by id
// in draft not published → add
// in published not draft → remove
// both present, type changed → type-change
// both present, same type, different props → text
export function diffPages(draft: Page, published: Page): DiffResult
```

`publish/semver.ts`:
```ts
// patch = text changes only
// minor = any add
// major = any remove or type-change (highest wins in mixed)
export function calculateBump(diff: DiffResult): 'major' | 'minor' | 'patch' | 'none'
export function applyBump(version: string, bump: string): string
// applyBump('1.2.3', 'minor') → '1.3.0'
```

`publish/snapshot.ts`:
```ts
// write to releases/<slug>/<version>.json
// getLatestSnapshot: read directory, sort semver, return highest
export async function writeSnapshot(slug: string, version: string, page: Page, changelog: string): Promise<void>
export async function getLatestSnapshot(slug: string): Promise<{ version: string; page: Page } | null>
```

`publish/changelog.ts`:
```ts
// "Added 1 section. Updated hero text. Removed cta section."
export function generateChangelog(diff: DiffResult): string
```

`app/api/publish/route.ts`:
```ts
// POST { slug, draft }
// 1. role check → 401
// 2. PageSchema.safeParse(draft) → 400 on fail
// 3. getLatestSnapshot → diff against it (or empty page if first publish)
// 4. no changes → return existing version (idempotent)
// 5. bump → new version → changelog → writeSnapshot
// 6. return { version, changelog }
```

**Commits:**
```
add diff engine for page comparison
add semver calculator with fixed bump rules
add snapshot writer and changelog generator
add publish API route with full pipeline
```

---

## LS-007 · Tests + CI
**Time:** 30m

**Unit tests — Vitest, two files only:**

Install: `npm install -D vitest`

`publish/__tests__/diff.test.ts` — 4 tests: no changes, text change, add, remove

`publish/__tests__/semver.test.ts` — 4 tests: patch, minor, major, applyBump

That's it for unit tests. Cover the business logic, not the UI.

**E2E + axe — one spec file:**

Install: `npm install -D @playwright/test axe-playwright`

`e2e/smoke.spec.ts`:
```ts
test('preview page renders h1', async ({ page }) => {
  await page.goto('/preview/home')
  await expect(page.locator('h1')).toBeVisible()
})

test('CTA button is visible and keyboard focusable', async ({ page }) => {
  await page.goto('/preview/home')
  const cta = page.locator('[data-testid="cta-button"]')
  await expect(cta).toBeVisible()
  await cta.focus()
  await expect(cta).toBeFocused()
})

test('preview passes axe audit', async ({ page }) => {
  await page.goto('/preview/home')
  await injectAxe(page)
  const results = await checkA11y(page, null, {
    runOptions: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
  })
  fs.writeFileSync('a11y-report.json', JSON.stringify(results, null, 2))
})
```

**CI:**

`.github/workflows/ci.yml`:
```yaml
name: CI
on: [push]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          CONTENTFUL_SPACE_ID: ${{ secrets.CONTENTFUL_SPACE_ID }}
          CONTENTFUL_ACCESS_TOKEN: ${{ secrets.CONTENTFUL_ACCESS_TOKEN }}
          CONTENTFUL_PREVIEW_TOKEN: ${{ secrets.CONTENTFUL_PREVIEW_TOKEN }}
          NEXT_PUBLIC_APP_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: a11y-report, path: a11y-report.json }
```

**Commits:**
```
add vitest with diff and semver unit tests
add Playwright smoke tests and axe audit for preview
add GitHub Actions CI with artifact upload
```

---

## LS-008 · README + a11y basics
**Time:** 10m (+ fix anything axe flags)

**A11y — don't do a full audit pass, just make sure as you build:**
- `<label htmlFor>` on every input in SectionEditor
- `focus-visible:ring-2` on all buttons and links (one Tailwind class, add it globally)
- Single `<h1>` per page
- CTA is `<a>`, not `<button>`
- `aria-required="true"` on required inputs

**README — six sections, write honestly, keep it short:**

1. Architecture overview + ASCII diagram
2. Redux slice responsibilities (what each owns, what it doesn't)
3. Contentful model + adapter (the two content types, why the adapter boundary exists)
4. Publish + SemVer logic (the pipeline, the three rules, idempotency)
5. Accessibility evidence (what's in place, link to a11y-report.json)
6. What is incomplete and why — be specific and honest:

```md
## What Is Incomplete and Why

**Drag-to-reorder**: replaced with Up/Down buttons. Drag-and-drop libraries
add significant complexity; the keyboard alternative is more accessible anyway.

**FeatureGrid and Testimonial prop editing**: the brief specifies Hero text and
CTA label/URL as the required editable props. These section types render correctly
from CMS data but their props can't be edited in the studio.

**Snapshot persistence on Vercel**: writeSnapshot uses fs.writeFileSync which
works locally but the Vercel serverless filesystem is ephemeral. Production would
need Vercel Blob or writing snapshots to a GitHub branch via API.

**Authentication**: role is stored in a plain cookie with no signing or session
management. This is demo-only. Real auth would use NextAuth or a similar provider.

**Axe coverage**: the automated audit runs on /preview only. The studio would
follow the same pattern but was deprioritised given time constraints.
```

**Commits:**
```
complete README with all six required sections
add focus-visible styles and basic aria attributes
```

---

## How to make commits look natural

- Don't push everything at once — commit as you finish each logical piece
- It's fine to have fixup commits: `fix url not being passed to cta href`
- Don't make the history look like a requirements doc
- Mix sizes: some commits are 200 lines, some are 5
- Write messages like you're leaving notes for yourself, not presenting to a committee