'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useStudioStore';
import { addSection } from '../store/slices/draftPageSlice';
import { publishDraft, resetPublish } from '../store/slices/publishSlice';
import { clearDraft } from '../store/slices/draftPageSlice';
import type { SectionType } from '@/lib/schema/page';
import { Plus, Upload, RotateCcw } from 'lucide-react';

const SECTION_TYPES: { value: SectionType; label: string }[] = [
    { value: 'hero', label: 'Hero' },
    { value: 'featureGrid', label: 'Feature Grid' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'cta', label: 'Call to Action' },
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

    const handleAdd = () => {
        dispatch(addSection({ type: selectedType }));
    };

    const handlePublish = () => {
        dispatch(publishDraft(slug));
    };

    const handleReset = () => {
        dispatch(clearDraft());
        window.location.reload();
    };

    return (
        <div className="flex flex-col gap-3 border-b p-3">
            {/* Add Section */}
            <div className="flex gap-2">
                <label htmlFor="section-type-select" className="sr-only">
                    Section type
                </label>
                <select
                    id="section-type-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as SectionType)}
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {SECTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add
                </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {isDirty && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        Reset
                    </button>
                )}
                {canPublish && (
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={publishState.status === 'loading'}
                        className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                        {publishState.status === 'loading' ? 'Publishing...' : 'Publish'}
                    </button>
                )}
            </div>

            {/* Publish Result */}
            {publishState.status === 'success' && publishState.result && (
                <div className="rounded-md bg-green-50 p-2 text-xs text-green-700 dark:bg-green-950/20 dark:text-green-400">
                    <p className="font-medium">Published v{publishState.result.version}</p>
                    <p className="mt-0.5">{publishState.result.changelog}</p>
                    <button
                        type="button"
                        onClick={() => dispatch(resetPublish())}
                        className="mt-1 underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {publishState.status === 'error' && (
                <div className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400" role="alert">
                    <p>{publishState.error}</p>
                    <button
                        type="button"
                        onClick={() => dispatch(resetPublish())}
                        className="mt-1 underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
}
