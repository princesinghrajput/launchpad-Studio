import type { HeroProps } from '@/lib/schema/page';

export function HeroSection({ heading, subheading }: HeroProps) {
    return (
        <section
            className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center"
            aria-labelledby="hero-heading"
        >
            <h2 id="hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
                {heading}
            </h2>
            {subheading && (
                <p className="max-w-2xl text-lg text-muted-foreground">{subheading}</p>
            )}
        </section>
    );
}
