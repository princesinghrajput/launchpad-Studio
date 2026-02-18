import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const role = request.cookies.get('role')?.value ?? 'viewer';
    const { pathname } = request.nextUrl;

    // Viewers cannot access the studio
    if (pathname.startsWith('/studio')) {
        if (role === 'viewer') {
            const slug = pathname.split('/')[2] ?? 'home';
            return NextResponse.redirect(new URL(`/preview/${slug}`, request.url));
        }
    }

    // Only publishers can hit the publish API
    if (pathname.startsWith('/api/publish')) {
        if (role !== 'publisher') {
            return NextResponse.json(
                { error: 'Forbidden: publisher role required' },
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/studio/:path*', '/api/publish'],
};
