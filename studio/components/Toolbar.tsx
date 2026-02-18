'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useStudioStore';
import { addSection, clearDraft } from '../store/slices/draftPageSlice';
import { publishDraft, resetPublish } from '../store/slices/publishSlice';
import type { SectionType } from '@/lib/schema/page';

const SECTION_TYPES: { value: SectionType; label: string }[] = [
    { value: 'hero', label: 'Hero' },
    { value: 'featureGrid', label: 'Feature Grid' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'cta', label: 'CTA' },
];

interface ToolbarProps {
    slug: string;
    canPublish: boolean;
}

export function Toolbar({ slug, canPublish }: ToolbarProps) {
    const [selectedType, setSelectedType] = useState<SectionType>('hero');
    const dispatch = useAppDispatch();
    const publishState = useAppSelector((s) => s.publish);
    const isDirty = useAppSelector((s) => s.draftPage.isDirty);

    return (
        <div className="flex flex-col gap-2.5 border-b p-3">
            {/* Add section row */}
            <div className="flex gap-1.5">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as SectionType)}
                    aria-label="Section type"
                    className="flex-1 rounded-lg border bg-white px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                    {SECTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => dispatch(addSection({ type: selectedType }))}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                    + Add
                </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-1.5">
                {isDirty && (
                    <button
                        type="button"
                        onClick={() => { dispatch(clearDraft()); window.location.reload(); }}
                        className="rounded-lg border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.97]"
                    >
                        Reset
                    </button>
                )}
                {canPublish && (
                    <button
                        type="button"
                        onClick={() => dispatch(publishDraft(slug))}
                        disabled={publishState.status === 'loading'}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                    >
                        {publishState.status === 'loading' ? 'Publishing…' : 'Publish'}
                    </button>
                )}
            </div>

            {/* Status messages */}
            {publishState.status === 'success' && publishState.result && (
                <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                            ✓ Published <strong>v{publishState.result.version}</strong>
                        </span>
                        <button onClick={() => dispatch(resetPublish())} className="text-[10px] text-emerald-600 underline hover:no-underline">
                            dismiss
                        </button>
                    </div>
                    {publishState.result.changelog && (
                        <div className="mt-2 border-t border-emerald-200 pt-2 dark:border-emerald-800">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                                Changelog
                            </span>
                            <ul className="mt-1 space-y-0.5">
                                {publishState.result.changelog.split('\n').filter(Boolean).map((line, i) => (
                                    <li key={i} className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            {publishState.status === 'error' && (
                <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-1.5 dark:bg-red-950/20" role="alert">
                    <span className="text-[11px] text-red-600">{publishState.error}</span>
                    <button onClick={() => dispatch(resetPublish())} className="text-[10px] text-red-500 underline hover:no-underline">
                        dismiss
                    </button>
                </div>
            )}
        </div>
    );
}
