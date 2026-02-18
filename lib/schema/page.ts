import { z } from 'zod';

/* ──────────────────────────────────────────────
 * Per-section prop schemas (discriminated union)
 * ────────────────────────────────────────────── */

export const HeroPropsSchema = z.object({
    heading: z.string().min(1, 'Heading is required'),
    subheading: z.string().optional(),
});

export const FeatureGridPropsSchema = z.object({
    features: z.array(
        z.object({
            title: z.string(),
            body: z.string(),
        })
    ),
});

export const TestimonialPropsSchema = z.object({
    quote: z.string().min(1, 'Quote is required'),
    author: z.string().min(1, 'Author is required'),
});

export const CtaPropsSchema = z.object({
    label: z.string().min(1, 'Label is required'),
    url: z.string().url('Must be a valid URL'),
});

/* ──────────────────────────────────────────────
 * Section schema — discriminated union on `type`
 * ────────────────────────────────────────────── */

export const SectionSchema = z.discriminatedUnion('type', [
    z.object({ id: z.string(), type: z.literal('hero'), props: HeroPropsSchema }),
    z.object({ id: z.string(), type: z.literal('featureGrid'), props: FeatureGridPropsSchema }),
    z.object({ id: z.string(), type: z.literal('testimonial'), props: TestimonialPropsSchema }),
    z.object({ id: z.string(), type: z.literal('cta'), props: CtaPropsSchema }),
]);

/* ──────────────────────────────────────────────
 * Page schema
 * ────────────────────────────────────────────── */

export const PageSchema = z.object({
    pageId: z.string(),
    slug: z.string(),
    title: z.string(),
    sections: z.array(SectionSchema),
});

/* ──────────────────────────────────────────────
 * Inferred types — single source of truth
 * ────────────────────────────────────────────── */

export type Page = z.infer<typeof PageSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section['type'];

export type HeroProps = z.infer<typeof HeroPropsSchema>;
export type FeatureGridProps = z.infer<typeof FeatureGridPropsSchema>;
export type TestimonialProps = z.infer<typeof TestimonialPropsSchema>;
export type CtaProps = z.infer<typeof CtaPropsSchema>;
