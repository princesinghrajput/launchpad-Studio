import type { DiffResult } from './diff';

/**
 * Generates a human-readable changelog summary from a diff result.
 */
export function generateChangelog(diff: DiffResult): string {
    if (!diff.hasChanges) return 'No changes.';

    const lines = diff.changes.map((c) => `- ${c.description}`);
    return lines.join('\n');
}
