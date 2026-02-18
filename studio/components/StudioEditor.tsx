'use client';

import { useEffect } from 'react';
import type { Page } from '@/lib/schema/page';
import { useAppDispatch, useAppSelector } from '../hooks/useStudioStore';
import { loadPage } from '../store/slices/draftPageSlice';
import { PageRenderer } from '@/renderer/PageRenderer';
import { Toolbar } from './Toolbar';
import { SectionList } from './SectionList';
import { SectionEditor } from './SectionEditor';

interface StudioEditorProps {
    initialPage: Page;
    role: string;
}

export function StudioEditor({ initialPage, role }: StudioEditorProps) {
    const dispatch = useAppDispatch();
    const draftPage = useAppSelector((s) => s.draftPage.page);

    useEffect(() => {
        dispatch(loadPage(initialPage));
    }, [dispatch, initialPage]);

    if (!draftPage) return null;

    const canPublish = role === 'publisher';

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Left panel — editor controls */}
            <aside className="flex w-80 flex-col border-r bg-background" aria-label="Editor panel">
                <Toolbar slug={draftPage.slug} canPublish={canPublish} />
                <div className="flex-1 overflow-y-auto">
                    <div className="border-b p-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Sections
                        </h2>
                    </div>
                    <SectionList />
                    <div className="border-t">
                        <SectionEditor />
                    </div>
                </div>
            </aside>

            {/* Right panel — live preview */}
            <main className="flex-1 overflow-y-auto bg-muted/30 p-8">
                <div className="mx-auto max-w-4xl rounded-lg border bg-background shadow-sm">
                    <div className="border-b px-6 py-3">
                        <span className="text-xs font-medium text-muted-foreground">Preview</span>
                    </div>
                    <div className="p-0">
                        <h1 className="px-6 pt-8 text-3xl font-bold tracking-tight">
                            {draftPage.title}
                        </h1>
                        <PageRenderer page={draftPage} />
                    </div>
                </div>
            </main>
        </div>
    );
}
