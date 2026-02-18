import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getPageBySlug } from '@/content/getPageBySlug';
import { getLatestSnapshot } from '@/publish/snapshot';
import { PageSchema } from '@/lib/schema/page';
import { StudioProvider } from '@/studio/store/provider';
import { StudioEditor } from '@/studio/components/StudioEditor';

interface StudioPageProps {
    params: Promise<{ slug: string }>;
}

export default async function StudioPage({ params }: StudioPageProps) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value ?? 'viewer';

    // 1. Try latest published release first
    const latest = await getLatestSnapshot(slug);
    if (latest) {
        const result = PageSchema.safeParse(latest.page);
        if (result.success) {
            return (
                <StudioProvider>
                    <StudioEditor initialPage={result.data} role={role} />
                </StudioProvider>
            );
        }
    }

    // 2. Fall back to CMS / mock data if nothing published yet
    const raw = await getPageBySlug(slug);
    if (!raw) return notFound();

    const result = PageSchema.safeParse(raw);
    if (!result.success) {
        return (
            <main className="flex min-h-screen items-center justify-center p-8">
                <div role="alert" className="max-w-md rounded-lg border border-red-300 bg-red-50 p-6 text-center">
                    <h1 className="mb-2 text-lg font-semibold text-red-700">Invalid Page Data</h1>
                    <p className="text-sm text-red-600">
                        Cannot load this page for editing. The CMS data failed validation.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <StudioProvider>
            <StudioEditor initialPage={result.data} role={role} />
        </StudioProvider>
    );
}
