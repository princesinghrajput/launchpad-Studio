'use client';

import { useEffect, useState } from 'react';
import type { Page } from '@/lib/schema/page';
import { PageSchema } from '@/lib/schema/page';
import { PageRenderer } from '@/renderer/PageRenderer';

interface DraftPreviewProps {
    slug: string;
    fallbackPage: Page;
}

/**
 * Reads draft from localStorage (same key as studio editor).
 * Falls back to the server-fetched page if no draft exists.
 */
export function DraftPreview({ slug, fallbackPage }: DraftPreviewProps) {
    const [page, setPage] = useState<Page>(fallbackPage);
    const [isDraft, setIsDraft] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(`draft:${slug}`);
            if (raw) {
                const parsed = PageSchema.safeParse(JSON.parse(raw));
                if (parsed.success) {
                    setPage(parsed.data);
                    setIsDraft(true);
                }
            }
        } catch {
            // localStorage not available — keep fallback
        }
    }, [slug]);

    return (
        <main className="mx-auto max-w-4xl px-6 py-12">
            {isDraft && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                    <span>⚠</span>
                    <span>Viewing <strong>unsaved draft</strong> — this is not the published version.</span>
                </div>
            )}
            <PageRenderer page={page} />
        </main>
    );
}
