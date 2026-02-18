import deepEqual from 'deep-equal';
import type { Page, Section } from '@/lib/schema/page';

export type ChangeType = 'text' | 'add' | 'remove' | 'type-change';

export interface Change {
    sectionId: string;
    changeType: ChangeType;
    description: string;
}

export interface DiffResult {
    hasChanges: boolean;
    changes: Change[];
}

/**
 * Computes a deterministic diff between draft and published page.
 * Matches sections by id. Changes are categorised for SemVer:
 *  - text    → props changed, type same
 *  - add     → section exists in draft but not published
 *  - remove  → section exists in published but not draft
 *  - type-change → same id, different type
 */
export function diffPages(draft: Page, published: Page): DiffResult {
    const publishedMap = new Map<string, Section>();
    for (const s of published.sections) {
        publishedMap.set(s.id, s);
    }

    const draftMap = new Map<string, Section>();
    for (const s of draft.sections) {
        draftMap.set(s.id, s);
    }

    const changes: Change[] = [];

    // Sections in draft
    for (const section of draft.sections) {
        const prev = publishedMap.get(section.id);

        if (!prev) {
            changes.push({
                sectionId: section.id,
                changeType: 'add',
                description: `Added ${section.type} section`,
            });
            continue;
        }

        if (prev.type !== section.type) {
            changes.push({
                sectionId: section.id,
                changeType: 'type-change',
                description: `Changed section type from ${prev.type} to ${section.type}`,
            });
            continue;
        }

        if (!deepEqual(prev.props, section.props)) {
            changes.push({
                sectionId: section.id,
                changeType: 'text',
                description: `Updated ${section.type} content`,
            });
        }
    }

    // Sections removed (in published but not in draft)
    for (const section of published.sections) {
        if (!draftMap.has(section.id)) {
            changes.push({
                sectionId: section.id,
                changeType: 'remove',
                description: `Removed ${section.type} section`,
            });
        }
    }

    return {
        hasChanges: changes.length > 0,
        changes,
    };
}
