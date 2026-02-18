'use client';

import { useAppDispatch, useAppSelector } from '../hooks/useStudioStore';
import { updateSectionProps } from '../store/slices/draftPageSlice';
import type { Section } from '@/lib/schema/page';

export function SectionEditor() {
    const selectedId = useAppSelector((s) => s.ui.selectedSectionId);
    const section = useAppSelector((s) =>
        s.draftPage.page?.sections.find((sec) => sec.id === selectedId)
    );

    if (!section) {
        return (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                Select a section to edit
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Properties
            </span>
            <EditorFields section={section} />
        </div>
    );
}

function EditorFields({ section }: { section: Section }) {
    const dispatch = useAppDispatch();

    const update = (props: Record<string, unknown>) => {
        dispatch(updateSectionProps({ id: section.id, props }));
    };

    switch (section.type) {
        case 'hero':
            return (
                <>
                    <Field label="Heading" value={section.props.heading} onChange={(v) => update({ heading: v })} />
                    <Field label="Subheading" value={section.props.subheading ?? ''} onChange={(v) => update({ subheading: v })} />
                </>
            );
        case 'cta':
            return (
                <>
                    <Field label="Label" value={section.props.label} onChange={(v) => update({ label: v })} />
                    <Field label="URL" value={section.props.url} onChange={(v) => update({ url: v })} />
                </>
            );
        case 'testimonial':
            return (
                <>
                    <Field label="Quote" value={section.props.quote} onChange={(v) => update({ quote: v })} />
                    <Field label="Author" value={section.props.author} onChange={(v) => update({ author: v })} />
                </>
            );
        default:
            return <p className="text-xs text-muted-foreground">No editable properties.</p>;
    }
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const id = `prop-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-[11px] font-medium text-muted-foreground">
                {label}
            </label>
            <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border bg-white px-2.5 py-1.5 text-xs shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
        </div>
    );
}
