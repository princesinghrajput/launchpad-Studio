import type { DiffResult } from './diff';

export type BumpType = 'major' | 'minor' | 'patch' | 'none';

/**
 * Determines the SemVer bump level from a diff result.
 *
 * Rules (fixed per assignment):
 *  - patch  → text/prop changes only
 *  - minor  → any section added
 *  - major  → any section removed or type changed
 *
 * Highest level wins when multiple change types are mixed.
 */
export function calculateBump(diff: DiffResult): BumpType {
    if (!diff.hasChanges) return 'none';

    let level: BumpType = 'patch';

    for (const change of diff.changes) {
        switch (change.changeType) {
            case 'remove':
            case 'type-change':
                return 'major'; // can't go higher, return early
            case 'add':
                level = 'minor';
                break;
            case 'text':
                // stays patch unless promoted
                break;
        }
    }

    return level;
}

/**
 * Applies a bump to a semver string.
 * E.g. applyBump('1.2.3', 'minor') → '1.3.0'
 */
export function applyBump(version: string, bump: BumpType): string {
    const [major, minor, patch] = version.split('.').map(Number);

    switch (bump) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        case 'none':
            return version;
    }
}
