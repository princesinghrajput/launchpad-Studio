import type { HeroProps } from '@/lib/schema/page';

export function HeroSection({ heading, subheading }: HeroProps) {
    return (
        <section className="py-16 text-center" aria-labelledby="hero-heading">
            <h2 id="hero-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
                {heading}
            </h2>
            {subheading && (
                <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
                    {subheading}
                </p>
            )}
        </section>
    );
}
