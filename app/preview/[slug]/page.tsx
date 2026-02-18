import { notFound } from 'next/navigation';
import { PageSchema } from '@/lib/schema/page';
import { getPageBySlug } from '@/content/getPageBySlug';
import { PageRenderer } from '@/renderer/PageRenderer';

interface PreviewPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
    const { slug } = await params;
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

    return (
        <main className="mx-auto max-w-5xl">
            <h1 className="px-6 pt-12 text-3xl font-bold tracking-tight">
                {result.data.title}
            </h1>
            <PageRenderer page={result.data} />
        </main>
    );
}
