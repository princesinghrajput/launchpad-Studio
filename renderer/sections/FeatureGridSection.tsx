import type { FeatureGridProps } from '@/lib/schema/page';

export function FeatureGridSection({ features }: FeatureGridProps) {
    return (
        <section className="px-6 py-16" aria-label="Features">
            <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {features.map((feature, i) => (
                    <li
                        key={`${feature.title}-${i}`}
                        className="rounded-lg border bg-card p-6 shadow-sm"
                    >
                        <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.body}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
