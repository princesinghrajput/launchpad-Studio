import type { TestimonialProps } from '@/lib/schema/page';

export function TestimonialSection({ quote, author }: TestimonialProps) {
    return (
        <section className="px-6 py-16" aria-label="Testimonial">
            <blockquote className="mx-auto max-w-2xl text-center">
                <p className="text-xl italic text-foreground">&ldquo;{quote}&rdquo;</p>
                <footer className="mt-4">
                    <cite className="text-sm font-medium text-muted-foreground not-italic">
                        &mdash; {author}
                    </cite>
                </footer>
            </blockquote>
        </section>
    );
}
