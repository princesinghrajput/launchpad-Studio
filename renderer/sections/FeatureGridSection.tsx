import type { FeatureGridProps } from '@/lib/schema/page';

export function FeatureGridSection({ features }: FeatureGridProps) {
    return (
        <section className="py-12" aria-label="Features">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f, i) => (
                    <div
                        key={`${f.title}-${i}`}
                        className="rounded-xl border bg-[#fafafa] p-5 transition-shadow hover:shadow-sm"
                    >
                        <h3 className="text-sm font-semibold">{f.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
