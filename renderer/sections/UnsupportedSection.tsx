interface UnsupportedSectionProps {
    type: string;
}

export function UnsupportedSection({ type }: UnsupportedSectionProps) {
    return (
        <section
            className="mx-6 my-4 rounded-md border border-dashed border-yellow-500 bg-yellow-50 p-6 text-center dark:bg-yellow-950/20"
            role="status"
            aria-label={`Unsupported section type: ${type}`}
        >
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Unknown section type: <code className="font-mono font-semibold">{type}</code>
            </p>
        </section>
    );
}
