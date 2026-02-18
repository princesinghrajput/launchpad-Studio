import { NextResponse } from 'next/server';
import { PageSchema, type Page } from '@/lib/schema/page';
import { diffPages } from '@/publish/diff';
import { calculateBump, applyBump } from '@/publish/semver';
import { writeSnapshot, getLatestSnapshot } from '@/publish/snapshot';
import { generateChangelog } from '@/publish/changelog';

const EMPTY_PAGE: Page = {
    pageId: '',
    slug: '',
    title: '',
    sections: [],
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slug, draft } = body;

        if (!slug || !draft) {
            return NextResponse.json(
                { error: 'Missing slug or draft in request body' },
                { status: 400 }
            );
        }

        // Validate draft against schema
        const result = PageSchema.safeParse(draft);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid draft data', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const validDraft = result.data;

        // Get last published version (or empty page for first publish)
        const latest = await getLatestSnapshot(slug);
        const previousPage = latest?.page ?? EMPTY_PAGE;
        const previousVersion = latest?.version ?? '0.0.0';

        // Compute diff
        const diff = diffPages(validDraft, previousPage);

        // Idempotent: no changes → return existing version
        if (!diff.hasChanges) {
            return NextResponse.json({
                version: previousVersion,
                changelog: 'No changes detected.',
                idempotent: true,
            });
        }

        // Calculate version bump
        const bump = calculateBump(diff);
        const newVersion = applyBump(previousVersion, bump);
        const changelog = generateChangelog(diff);

        // Write immutable snapshot
        await writeSnapshot(slug, newVersion, validDraft, changelog);

        return NextResponse.json({
            version: newVersion,
            changelog,
            bump,
        });
    } catch (err) {
        console.error('[publish] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
