import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Launchpad Studio
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          A schema-driven page builder with Zod validation, automated SemVer,
          and role-based access control.
        </p>

        {/* Primary actions */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/api/set-role?role=publisher&redirect=/studio/home"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            ✏️ Open Studio Editor
          </Link>
          <Link
            href="/preview/home"
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-6 py-3 text-sm font-medium shadow-sm transition-all hover:bg-muted active:scale-[0.97]"
          >
            👁 View Preview
          </Link>
        </div>

        {/* Role switcher */}
        <div className="mt-16 w-full max-w-md">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Try different roles
          </p>
          <div className="flex justify-center gap-2">
            <Link
              href="/api/set-role?role=viewer&redirect=/preview/home"
              className="rounded-lg border bg-white px-4 py-2 text-sm transition-all hover:shadow-sm active:scale-[0.97]"
            >
              👁 Viewer
            </Link>
            <Link
              href="/api/set-role?role=editor&redirect=/studio/home"
              className="rounded-lg border bg-white px-4 py-2 text-sm transition-all hover:shadow-sm active:scale-[0.97]"
            >
              ✏️ Editor
            </Link>
            <Link
              href="/api/set-role?role=publisher&redirect=/studio/home"
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-all hover:shadow-sm active:scale-[0.97]"
            >
              🚀 Publisher
            </Link>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Editors can edit but not publish · Publishers can edit and publish · Viewers are read-only
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid w-full max-w-2xl gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold">Schema-Driven</p>
            <p className="mt-1 text-xs text-muted-foreground">Zod-validated sections with typed registry</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold">Version Control</p>
            <p className="mt-1 text-xs text-muted-foreground">Automated SemVer with immutable JSON snapshots</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold">RBAC</p>
            <p className="mt-1 text-xs text-muted-foreground">Role-based access via middleware</p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        Built by Prince Singh Rajput
      </footer>
    </div>
  );
}
