'use client';

/**
 * Higher-Order Component for Error Boundary
 * Wraps components with error boundary functionality
 */

import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface WithErrorBoundaryOptions {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    showDetails?: boolean;
    displayName?: string;
}

/**
 * HOC that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
    Component: ComponentType<P>,
    options: WithErrorBoundaryOptions = {}
) {
    const WrappedComponent = (props: P) => {
        return (
            <ErrorBoundary
                fallback={options.fallback}
                onError={options.onError}
                showDetails={options.showDetails}
            >
                <Component {...props} />
            </ErrorBoundary>
        );
    };

    WrappedComponent.displayName =
        options.displayName ||
        `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
}

/**
 * Hook for error boundary functionality in functional components
 */
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    const captureError = React.useCallback((error: Error) => {
        console.error('Error captured by useErrorHandler:', error);
        setError(error);

        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            // errorTrackingService.captureException(error);
        }
    }, []);

    // Throw error to be caught by error boundary
    if (error) {
        throw error;
    }

    return { captureError, resetError };
}

/**
 * Async error handler for promises and async operations
 */
export function useAsyncErrorHandler() {
    const { captureError } = useErrorHandler();

    const handleAsyncError = React.useCallback(
        function <T>(promise: Promise<T>): Promise<T> {
            return promise.catch((error) => {
                captureError(error instanceof Error ? error : new Error(String(error)));
                throw error; // Re-throw to maintain promise chain behavior
            });
        },
        [captureError]
    );

    return handleAsyncError;
}

export default withErrorBoundary;
