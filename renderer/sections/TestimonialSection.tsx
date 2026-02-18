import type { TestimonialProps } from '@/lib/schema/page';

export function TestimonialSection({ quote, author }: TestimonialProps) {
    return (
        <section className="py-12" aria-label="Testimonial">
            <blockquote className="mx-auto max-w-lg text-center">
                <p className="text-lg font-medium italic leading-relaxed text-foreground/80">
                    &ldquo;{quote}&rdquo;
                </p>
                <footer className="mt-4">
                    <cite className="text-sm font-medium text-muted-foreground not-italic">
                        — {author}
                    </cite>
                </footer>
            </blockquote>
        </section>
    );
}
