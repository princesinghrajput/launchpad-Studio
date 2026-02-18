import fs from 'fs';
import path from 'path';
import type { Page } from '@/lib/schema/page';

const RELEASES_DIR = path.join(process.cwd(), 'releases');

interface Snapshot {
    version: string;
    page: Page;
    changelog: string;
    publishedAt: string;
}

/**
 * Writes an immutable snapshot to releases/<slug>/<version>.json
 */
export async function writeSnapshot(
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

/**
 * Reads the latest published snapshot for a given slug.
 * Sorts versions by semver and returns the highest.
 */
export async function getLatestSnapshot(
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

function compareSemver(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
}
