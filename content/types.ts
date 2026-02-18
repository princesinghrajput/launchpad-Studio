/**
 * Contentful-specific field shapes. These types stay inside content/
 * and never leak into the rest of the application.
 */

export interface ContentfulSectionFields {
    sectionId: string;
    type: string;
    props: Record<string, unknown>;
}

export interface ContentfulPageFields {
    pageId: string;
    slug: string;
    title: string;
    sections: Array<{
        fields: ContentfulSectionFields;
    }>;
}
