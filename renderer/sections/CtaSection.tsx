import type { CtaProps } from '@/lib/schema/page';

export function CtaSection({ label, url }: CtaProps) {
    return (
        <section className="flex justify-center py-12" aria-label="Call to action">
            <a
                href={url}
                data-testid="cta-button"
                className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                {label}
            </a>
        </section>
    );
}
