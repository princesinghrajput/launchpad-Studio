import type { ComponentType } from 'react';
import type { SectionType } from '@/lib/schema/page';

import { HeroSection } from './sections/HeroSection';
import { FeatureGridSection } from './sections/FeatureGridSection';
import { TestimonialSection } from './sections/TestimonialSection';
import { CtaSection } from './sections/CtaSection';

/**
 * Maps each section type to its render component.
 *
 * Using Record<SectionType, ...> guarantees a TS error
 * whenever a new type is added to the schema but not registered here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionRegistry: Record<SectionType, ComponentType<any>> = {
    hero: HeroSection,
    featureGrid: FeatureGridSection,
    testimonial: TestimonialSection,
    cta: CtaSection,
};
