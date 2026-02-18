'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Catches rendering errors in child tree so a single broken
 * section doesn't take down the entire page.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div
                        role="alert"
                        className="mx-6 my-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
                    >
                        <p className="font-medium">Something went wrong rendering this section.</p>
                        {this.state.error && (
                            <pre className="mt-2 overflow-auto text-xs">{this.state.error.message}</pre>
                        )}
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
