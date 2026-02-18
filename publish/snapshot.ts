import type { Page } from '@/lib/schema/page';

/* ── Snapshot shape ────────────────────────────────────── */

interface Snapshot {
    version: string;
    page: Page;
    changelog: string;
    publishedAt: string;
}

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

/* ══════════════════════════════════════════════════════════
   Vercel Blob implementation
   ══════════════════════════════════════════════════════════ */

async function writeBlobSnapshot(
    slug: string,
    version: string,
    page: Page,
    changelog: string
): Promise<void> {
    const { put } = await import('@vercel/blob');
    const snapshot: Snapshot = {
        version,
        page,
        changelog,
        publishedAt: new Date().toISOString(),
    };
    await put(
        `releases/${slug}/${version}.json`,
        JSON.stringify(snapshot, null, 2),
        { access: 'public', addRandomSuffix: false }
    );
}

async function getLatestBlobSnapshot(
    slug: string
): Promise<{ version: string; page: Page } | null> {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: `releases/${slug}/` });

    if (blobs.length === 0) return null;

    // Extract versions from pathnames, sort descending
    const versions = blobs
        .map((b) => {
            const match = b.pathname.match(/\/(\d+\.\d+\.\d+)\.json$/);
            return match ? { version: match[1], url: b.url } : null;
        })
        .filter(Boolean)
        .sort((a, b) => compareSemver(b!.version, a!.version));

    if (versions.length === 0) return null;

    const latest = versions[0]!;
    const res = await fetch(latest.url);
    const snapshot: Snapshot = await res.json();
    return { version: snapshot.version, page: snapshot.page };
}

/* ══════════════════════════════════════════════════════════
   Filesystem implementation (local dev)
   ══════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';

const RELEASES_DIR = path.join(process.cwd(), 'releases');

async function writeFsSnapshot(
    slug: string,
    version: string,
    page: Page,
    changelog: string
): Promise<void> {
    const dir = path.join(RELEASES_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });

    const snapshot: Snapshot = {
        version,
        page,
        changelog,
        publishedAt: new Date().toISOString(),
    };

    const filePath = path.join(dir, `${version}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
}

async function getLatestFsSnapshot(
    slug: string
): Promise<{ version: string; page: Page } | null> {
    const dir = path.join(RELEASES_DIR, slug);
    if (!fs.existsSync(dir)) return null;

    const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''))
        .sort(compareSemver)
        .reverse();

    if (files.length === 0) return null;

    const latest = files[0];
    const raw = fs.readFileSync(path.join(dir, `${latest}.json`), 'utf-8');
    const snapshot: Snapshot = JSON.parse(raw);
    return { version: snapshot.version, page: snapshot.page };
}

/* ══════════════════════════════════════════════════════════
   Public API — auto-selects Blob vs filesystem
   ══════════════════════════════════════════════════════════ */

export async function writeSnapshot(
    slug: string,
    version: string,
    page: Page,
    changelog: string
): Promise<void> {
    if (useBlob) {
        return writeBlobSnapshot(slug, version, page, changelog);
    }
    return writeFsSnapshot(slug, version, page, changelog);
}

export async function getLatestSnapshot(
    slug: string
): Promise<{ version: string; page: Page } | null> {
    if (useBlob) {
        return getLatestBlobSnapshot(slug);
    }
    return getLatestFsSnapshot(slug);
}

/* ── Helper ────────────────────────────────────────────── */

function compareSemver(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
}
