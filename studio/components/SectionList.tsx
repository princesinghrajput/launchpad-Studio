'use client';

import { useAppDispatch, useAppSelector } from '../hooks/useStudioStore';
import { removeSection, moveSection } from '../store/slices/draftPageSlice';
import { selectSection, deselectSection } from '../store/slices/uiSlice';
import { Type, LayoutGrid, MessageSquareQuote, MousePointerClick, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { SectionType } from '@/lib/schema/page';
import type { ComponentType } from 'react';

const SECTION_CONFIG: Record<SectionType, { icon: ComponentType<{ className?: string }>; label: string; color: string }> = {
    hero: { icon: Type, label: 'Hero', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    featureGrid: { icon: LayoutGrid, label: 'Feature Grid', color: 'bg-violet-50 text-violet-600 border-violet-200' },
    testimonial: { icon: MessageSquareQuote, label: 'Testimonial', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    cta: { icon: MousePointerClick, label: 'CTA', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

export function SectionList() {
    const sections = useAppSelector((s) => s.draftPage.page?.sections ?? []);
    const selectedId = useAppSelector((s) => s.ui.selectedSectionId);
    const dispatch = useAppDispatch();

    return (
        <div className="p-3">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Sections ({sections.length})
            </span>

            {sections.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                    No sections yet — click <strong>+ Add</strong> above
                </p>
            ) : (
                <ul className="flex flex-col gap-1" role="list" aria-label="Page sections">
                    {sections.map((section, idx) => {
                        const isSelected = section.id === selectedId;
                        const config = SECTION_CONFIG[section.type];
                        const Icon = config?.icon ?? Type;

                        return (
                            <li key={section.id}>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => dispatch(isSelected ? deselectSection() : selectSection(section.id))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') dispatch(isSelected ? deselectSection() : selectSection(section.id)); }}
                                    className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all ${isSelected
                                            ? 'bg-primary/8 ring-1 ring-primary/25 shadow-sm'
                                            : 'hover:bg-muted/50'
                                        }`}
                                    aria-pressed={isSelected}
                                >
                                    {/* Icon */}
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${config?.color ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>

                                    {/* Label */}
                                    <span className="flex-1 text-[13px] font-medium">
                                        {config?.label ?? section.type}
                                    </span>

                                    {/* Actions */}
                                    <span className={`flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {idx > 0 && (
                                            <button
                                                type="button"
                                                aria-label="Move up"
                                                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                onClick={(e) => { e.stopPropagation(); dispatch(moveSection({ id: section.id, direction: 'up' })); }}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </button>
                                        )}
                                        {idx < sections.length - 1 && (
                                            <button
                                                type="button"
                                                aria-label="Move down"
                                                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                onClick={(e) => { e.stopPropagation(); dispatch(moveSection({ id: section.id, direction: 'down' })); }}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            aria-label="Remove section"
                                            className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                                            onClick={(e) => { e.stopPropagation(); dispatch(removeSection(section.id)); if (isSelected) dispatch(deselectSection()); }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
