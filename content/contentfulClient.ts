import { createClient, type ContentfulClientApi } from 'contentful';

let deliveryClient: ContentfulClientApi<undefined> | null = null;
let previewClient: ContentfulClientApi<undefined> | null = null;

/**
 * Returns a Contentful client configured for either published
 * (Delivery API) or draft (Preview API) content.
 *
 * Clients are cached per mode so we don't re-create on every request.
 */
export function getClient(preview = false): ContentfulClientApi<undefined> {
    if (preview) {
        if (!previewClient) {
            previewClient = createClient({
                space: process.env.CONTENTFUL_SPACE_ID!,
                accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
                host: 'preview.contentful.com',
            });
        }
        return previewClient;
    }

    if (!deliveryClient) {
        deliveryClient = createClient({
            space: process.env.CONTENTFUL_SPACE_ID!,
            accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
            host: 'cdn.contentful.com',
        });
    }
    return deliveryClient;
}
