export type Role = 'viewer' | 'editor' | 'publisher';

export const ROLE_PERMISSIONS = {
    viewer: { canPreview: true, canEdit: false, canPublish: false },
    editor: { canPreview: true, canEdit: true, canPublish: false },
    publisher: { canPreview: true, canEdit: true, canPublish: true },
} as const satisfies Record<Role, { canPreview: boolean; canEdit: boolean; canPublish: boolean }>;

export function isValidRole(value: string | undefined): value is Role {
    return value === 'viewer' || value === 'editor' || value === 'publisher';
}
