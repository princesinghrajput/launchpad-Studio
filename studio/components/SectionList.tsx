'use client';

import { useAppDispatch, useAppSelector } from '../hooks/useStudioStore';
import {
    removeSection,
    moveSection,
} from '../store/slices/draftPageSlice';
import { selectSection, deselectSection } from '../store/slices/uiSlice';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
    hero: 'Hero',
    featureGrid: 'Feature Grid',
    testimonial: 'Testimonial',
    cta: 'Call to Action',
};

export function SectionList() {
    const sections = useAppSelector((s) => s.draftPage.page?.sections ?? []);
    const selectedId = useAppSelector((s) => s.ui.selectedSectionId);
    const dispatch = useAppDispatch();

    if (sections.length === 0) {
        return (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No sections yet. Add one above.
            </p>
        );
    }

    return (
        <ul className="flex flex-col gap-1" role="list" aria-label="Page sections">
            {sections.map((section, idx) => {
                const isSelected = section.id === selectedId;

                return (
                    <li key={section.id}>
                        <button
                            type="button"
                            onClick={() =>
                                dispatch(isSelected ? deselectSection() : selectSection(section.id))
                            }
                            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                            aria-pressed={isSelected}
                        >
                            <span className="flex-1 truncate font-medium">
                                {TYPE_LABELS[section.type] ?? section.type}
                            </span>

                            <span className="flex items-center gap-0.5">
                                <span
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Move ${TYPE_LABELS[section.type]} up`}
                                    className="rounded p-0.5 hover:bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(moveSection({ id: section.id, direction: 'up' }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dispatch(moveSection({ id: section.id, direction: 'up' }));
                                        }
                                    }}
                                >
                                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                                </span>

                                <span
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Move ${TYPE_LABELS[section.type]} down`}
                                    className="rounded p-0.5 hover:bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(moveSection({ id: section.id, direction: 'down' }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dispatch(moveSection({ id: section.id, direction: 'down' }));
                                        }
                                    }}
                                >
                                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                </span>

                                <span
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Remove ${TYPE_LABELS[section.type]}`}
                                    className="rounded p-0.5 text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(removeSection(section.id));
                                        if (isSelected) dispatch(deselectSection());
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dispatch(removeSection(section.id));
                                            if (isSelected) dispatch(deselectSection());
                                        }
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
