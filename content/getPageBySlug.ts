import type { Page } from '@/lib/schema/page';
import { getClient } from './contentfulClient';
import { adaptPage } from './contentAdapter';
import type { ContentfulPageFields } from './types';

const USE_MOCK = !process.env.CONTENTFUL_SPACE_ID;

/**
 * Fetches a page by slug from Contentful and returns a clean domain object.
 * Falls back to mock data when Contentful credentials are not configured.
 */
export async function getPageBySlug(
    slug: string,
    preview = false
): Promise<Page | null> {
    if (USE_MOCK) {
        return getMockPage(slug);
    }

    try {
        const client = getClient(preview);
        const entries = await client.getEntries({
            content_type: 'page',
            'fields.slug': slug,
            include: 2,
            limit: 1,
        });

        const entry = entries.items[0];
        if (!entry) return null;

        return adaptPage(entry as unknown as { fields: ContentfulPageFields });
    } catch (err) {
        console.error(`[getPageBySlug] Failed to fetch "${slug}":`, err);
        return null;
    }
}

/**
 * Returns all published page slugs for static generation.
 */
export async function getAllPageSlugs(): Promise<string[]> {
    if (USE_MOCK) {
        return ['home'];
    }

    try {
        const client = getClient();
        const entries = await client.getEntries({
            content_type: 'page',
            select: ['fields.slug'],
        });

        return entries.items.map(
            (e) => (e.fields as unknown as { slug: string }).slug
        );
    } catch (err) {
        console.error('[getAllPageSlugs] Failed:', err);
        return [];
    }
}

/* ── Mock data for local development without Contentful ─────────── */

function getMockPage(slug: string): Page | null {
    const pages: Record<string, Page> = {
        home: {
            pageId: 'mock-home',
            slug: 'home',
            title: 'Welcome to Launchpad',
            sections: [
                {
                    id: 's1',
                    type: 'hero',
                    props: {
                        heading: 'Build landing pages, fast',
                        subheading:
                            'A schema-driven studio for creating, editing, and publishing immutable page releases.',
                    },
                },
                {
                    id: 's2',
                    type: 'featureGrid',
                    props: {
                        features: [
                            { title: 'Schema-Driven', body: 'Zod-validated sections with typed registry.' },
                            { title: 'Version Control', body: 'Automated SemVer with immutable snapshots.' },
                            { title: 'WYSIWYG-Lite', body: 'Edit sections and preview changes in real time.' },
                        ],
                    },
                },
                {
                    id: 's3',
                    type: 'testimonial',
                    props: {
                        quote: 'Launchpad Studio changed how we ship landing pages.',
                        author: 'Engineering Lead',
                    },
                },
                {
                    id: 's4',
                    type: 'cta',
                    props: {
                        label: 'Get Started',
                        url: '/api/set-role?role=publisher&redirect=/studio/home',
                    },
                },
            ],
        },
    };

    return pages[slug] ?? null;
}
