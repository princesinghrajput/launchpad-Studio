import type { Page, Section, SectionType } from '@/lib/schema/page';
import type { ContentfulPageFields, ContentfulSectionFields } from './types';

const VALID_TYPES = new Set<string>(['hero', 'featureGrid', 'testimonial', 'cta']);

function isValidSectionType(type: string): type is SectionType {
    return VALID_TYPES.has(type);
}

/**
 * Transforms a raw Contentful Page entry into our domain Page model.
 * Handles missing fields gracefully — returns null rather than throwing.
 */
export function adaptPage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entry: Record<string, any>
): Page | null {
    try {
        const fields = entry?.fields;
        if (!fields?.slug || !fields?.title) return null;

        const rawSections = Array.isArray(fields.sections) ? fields.sections : [];

        const sections: Section[] = rawSections
            .map((ref: Record<string, unknown>) => adaptSection(ref?.fields as ContentfulSectionFields))
            .filter((s: Section | null): s is Section => s !== null);

        return {
            pageId: String(fields.pageId ?? fields.slug),
            slug: String(fields.slug),
            title: String(fields.title),
            sections,
        };
    } catch (err) {
        console.error('[contentAdapter] Failed to adapt page entry:', err);
        return null;
    }
}

function adaptSection(fields: ContentfulSectionFields | undefined): Section | null {
    if (!fields?.type || !fields?.props) return null;
    if (!isValidSectionType(fields.type)) return null;

    return {
        id: fields.sectionId || crypto.randomUUID(),
        type: fields.type,
        props: fields.props as Section['props'],
    };
}
