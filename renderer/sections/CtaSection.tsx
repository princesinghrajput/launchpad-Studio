import type { CtaProps } from '@/lib/schema/page';

export function CtaSection({ label, url }: CtaProps) {
    return (
        <section className="flex justify-center px-6 py-16" aria-label="Call to action">
            <a
                href={url}
                data-testid="cta-button"
                className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                {label}
            </a>
        </section>
    );
}
