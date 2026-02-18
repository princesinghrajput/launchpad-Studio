'use client';

import { useEffect } from 'react';
import type { Page } from '@/lib/schema/page';
import { useAppDispatch, useAppSelector } from '../hooks/useStudioStore';
import { loadPage } from '../store/slices/draftPageSlice';
import { PageRenderer } from '@/renderer/PageRenderer';
import { Toolbar } from './Toolbar';
import { SectionList } from './SectionList';
import { SectionEditor } from './SectionEditor';
import Link from 'next/link';

interface StudioEditorProps {
    initialPage: Page;
    role: string;
}

export function StudioEditor({ initialPage, role }: StudioEditorProps) {
    const dispatch = useAppDispatch();
    const draftPage = useAppSelector((s) => s.draftPage.page);

    const isDirty = useAppSelector((s) => s.draftPage.isDirty);
    const publishStatus = useAppSelector((s) => s.publish.status);

    useEffect(() => {
        dispatch(loadPage(initialPage));
    }, [dispatch, initialPage]);

    if (!draftPage) return null;

    const canPublish = role === 'publisher';

    return (
        <div className="flex h-screen flex-col bg-[#f8f9fb]">
            {/* Top bar */}
            <header className="flex h-11 shrink-0 items-center justify-between border-b bg-white px-4">
                <div className="flex items-center gap-2 text-sm">
                    <Link href="/" className="font-semibold text-foreground hover:underline">
                        Launchpad Studio
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{draftPage.title}</span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    {publishStatus === 'success' ? (
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published ✓
                        </span>
                    ) : isDirty ? (
                        <span className="flex items-center gap-1.5 text-[11px] text-amber-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft saved
                        </span>
                    ) : (
                        <span className="text-[11px] text-muted-foreground">No changes</span>
                    )}
                    <span className="text-muted-foreground">·</span>
                    <Link
                        href={`/preview/${draftPage.slug}`}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        Open Preview →
                    </Link>
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {role}
                    </span>
                </div>
            </header>

            {/* Main area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar */}
                <aside className="flex w-[280px] shrink-0 flex-col border-r bg-white" aria-label="Editor panel">
                    <Toolbar slug={draftPage.slug} canPublish={canPublish} />
                    <div className="flex-1 overflow-y-auto">
                        <SectionList />
                        <SectionEditor />
                    </div>
                </aside>

                {/* Preview area */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-3xl">
                        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                            <div className="flex items-center gap-1.5 border-b bg-[#fafafa] px-4 py-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                                <span className="ml-3 text-[11px] text-muted-foreground">
                                    /{draftPage.slug}
                                </span>
                            </div>
                            <div className="p-8">
                                <PageRenderer page={draftPage} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
