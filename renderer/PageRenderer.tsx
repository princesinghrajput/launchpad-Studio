'use client';

import type { Page, Section } from '@/lib/schema/page';
import { sectionRegistry } from './sectionRegistry';
import { UnsupportedSection } from './sections/UnsupportedSection';
import { ErrorBoundary } from './ErrorBoundary';

interface PageRendererProps {
    page: Page;
}

/**
 * Iterates over page sections, looks up each type in the registry,
 * and renders the matching component. Unknown types get a visible
 * fallback. Each section is wrapped in an ErrorBoundary so one
 * broken component can't crash the whole page.
 */
export function PageRenderer({ page }: PageRendererProps) {
    return (
        <div className="flex flex-col">
            {page.sections.map((section) => (
                <ErrorBoundary key={section.id}>
                    <SectionSlot section={section} />
                </ErrorBoundary>
            ))}
        </div>
    );
}

function SectionSlot({ section }: { section: Section }) {
    const Component = sectionRegistry[section.type];

    if (!Component) {
        return <UnsupportedSection type={section.type} />;
    }

    return <Component {...section.props} />;
}
