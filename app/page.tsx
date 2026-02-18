import Link from 'next/link';
import { Layers, Eye, Pencil, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-tight">Launchpad Studio</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/preview/home"
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Preview
            </Link>
            <Link
              href="/api/set-role?role=publisher&redirect=/studio/home"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open Studio
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center justify-center gap-6 px-6 py-28 text-center">
          <div className="rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            Schema-Driven Page Builder
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Build, edit, and publish
            <br />
            <span className="text-primary">landing pages</span> with confidence
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            A studio for creating immutable page releases with Zod validation,
            automated SemVer, and role-based access control.
          </p>
          <div className="flex gap-3 pt-4">
            <Link
              href="/api/set-role?role=publisher&redirect=/studio/home"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pencil className="h-4 w-4" />
              Open Studio
            </Link>
            <Link
              href="/preview/home"
              className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Eye className="h-4 w-4" />
              View Preview
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 px-6 py-20">
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold">Schema-Driven</h2>
              <p className="text-sm text-muted-foreground">
                Zod-validated sections with typed registry. Invalid CMS data
                is caught before render.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold">Version Control</h2>
              <p className="text-sm text-muted-foreground">
                Automated SemVer with deterministic diffing. Every publish
                creates an immutable JSON snapshot.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Pencil className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold">WYSIWYG-Lite</h2>
              <p className="text-sm text-muted-foreground">
                Edit sections and see changes in the live preview panel.
                Add, reorder, and remove sections visually.
              </p>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="border-t px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Quick Role Switcher</h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Set your role to test different access levels (enforced via middleware).
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/api/set-role?role=viewer&redirect=/preview/home"
                className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                👁 Viewer
              </Link>
              <Link
                href="/api/set-role?role=editor&redirect=/studio/home"
                className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ✏️ Editor
              </Link>
              <Link
                href="/api/set-role?role=publisher&redirect=/studio/home"
                className="rounded-md border bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-green-950/30 dark:text-green-400"
              >
                🚀 Publisher
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Launchpad Studio — Schema-driven page builder
      </footer>
    </div>
  );
}
