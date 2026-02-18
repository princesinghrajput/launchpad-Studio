import type { Page, Section } from '@/lib/schema/page';
import type { ContentfulPageFields, ContentfulSectionFields } from './types';

/**
 * Transforms a raw Contentful Page entry into our domain Page model.
 * Handles missing fields gracefully — returns null if the entry
 * can't be mapped rather than throwing.
 */
export function adaptPage(entry: { fields: ContentfulPageFields }): Page | null {
    try {
        const fields = entry.fields;

        if (!fields.slug || !fields.title) return null;

        const sections: Section[] = (fields.sections ?? [])
            .map((ref) => adaptSection(ref?.fields))
            .filter((s): s is Section => s !== null);

        return {
            pageId: fields.pageId ?? fields.slug,
            slug: fields.slug,
            title: fields.title,
            sections,
        };
    } catch {
        console.error('[contentAdapter] Failed to adapt page entry');
        return null;
    }
}

function adaptSection(fields: ContentfulSectionFields | undefined): Section | null {
    if (!fields || !fields.type || !fields.props) return null;

    return {
        id: fields.sectionId ?? crypto.randomUUID(),
        type: fields.type as Section['type'],
        props: fields.props as Section['props'],
    };
}
