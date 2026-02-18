import { notFound } from 'next/navigation';
import { PageSchema } from '@/lib/schema/page';
import { getPageBySlug } from '@/content/getPageBySlug';
import { getLatestSnapshot } from '@/publish/snapshot';
import { DraftPreview } from '@/renderer/DraftPreview';

interface PreviewPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
    const { slug } = await params;

    // 1. Try loading the latest published release first
    const latest = await getLatestSnapshot(slug);
    if (latest) {
        const result = PageSchema.safeParse(latest.page);
        if (result.success) {
            return <DraftPreview slug={slug} fallbackPage={result.data} />;
        }
    }

    // 2. Fall back to CMS / mock data if nothing published yet
    const raw = await getPageBySlug(slug);
    if (!raw) return notFound();

    const result = PageSchema.safeParse(raw);

    if (!result.success) {
        return (
            <main className="flex min-h-screen items-center justify-center p-8">
                <div role="alert" className="max-w-md rounded-lg border border-red-300 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
                    <h1 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
                        Invalid Page Data
                    </h1>
                    <p className="text-sm text-red-600 dark:text-red-400">
                        The page data from the CMS failed validation. Please check the content model.
                    </p>
                </div>
            </main>
        );
    }

    return <DraftPreview slug={slug} fallbackPage={result.data} />;
}
