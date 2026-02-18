import { NextResponse } from 'next/server';
import { type Role, isValidRole } from '@/rbac/roles';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') ?? 'viewer';
    const redirect = searchParams.get('redirect') ?? '/';

    const validRole: Role = isValidRole(role) ? role : 'viewer';

    const response = NextResponse.redirect(new URL(redirect, request.url));
    response.cookies.set('role', validRole, {
        path: '/',
        httpOnly: false, // readable by client for UI display
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
}
