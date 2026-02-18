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
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Select a section to edit its properties.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Edit {section.type}
            </h3>
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
                    <Field
                        label="Heading"
                        value={section.props.heading}
                        onChange={(v) => update({ heading: v })}
                        required
                    />
                    <Field
                        label="Subheading"
                        value={section.props.subheading ?? ''}
                        onChange={(v) => update({ subheading: v })}
                    />
                </>
            );

        case 'cta':
            return (
                <>
                    <Field
                        label="Button Label"
                        value={section.props.label}
                        onChange={(v) => update({ label: v })}
                        required
                    />
                    <Field
                        label="URL"
                        value={section.props.url}
                        onChange={(v) => update({ url: v })}
                        required
                        type="url"
                    />
                </>
            );

        case 'testimonial':
            return (
                <>
                    <Field
                        label="Quote"
                        value={section.props.quote}
                        onChange={(v) => update({ quote: v })}
                        required
                    />
                    <Field
                        label="Author"
                        value={section.props.author}
                        onChange={(v) => update({ author: v })}
                        required
                    />
                </>
            );

        default:
            return (
                <p className="text-sm text-muted-foreground">
                    Editing not available for this section type.
                </p>
            );
    }
}

interface FieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: string;
}

function Field({ label, value, onChange, required, type = 'text' }: FieldProps) {
    const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
                {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-required={required}
                className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
        </div>
    );
}
