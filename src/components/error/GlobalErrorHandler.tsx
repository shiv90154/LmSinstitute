'use client';

/**
 * Global Client-Side Error Handler
 * Catches unhandled promise rejections and global JavaScript errors
 */

import { useEffect } from 'react';

// Simplified error handler without external dependencies for now
function handleGlobalError(error: Error, context: Record<string, any> = {}) {
    console.error('Global error:', error, context);

    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
        // Example: Send to error tracking service
        // errorTrackingService.captureException(error, context);
    }
}

export default function GlobalErrorHandler() {
    useEffect(() => {
        // Handle unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled promise rejection:', event.reason);

            const error = event.reason instanceof Error
                ? event.reason
                : new Error(String(event.reason));

            handleGlobalError(error, {
                action: 'unhandled_promise_rejection',
                route: window.location.pathname,
            });

            // Prevent the default browser behavior
            event.preventDefault();
        };

        // Handle global JavaScript errors
        const handleGlobalJSError = (event: ErrorEvent) => {
            console.error('Global JavaScript error:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });

            const error = event.error instanceof Error
                ? event.error
                : new Error(event.message);

            handleGlobalError(error, {
                action: 'global_javascript_error',
                route: window.location.pathname,
            });
        };

        // Handle resource loading errors
        const handleResourceError = (event: Event) => {
            const target = event.target as HTMLElement;

            if (target) {
                console.error('Resource loading error:', {
                    tagName: target.tagName,
                    src: (target as any).src || (target as any).href,
                    type: event.type
                });

                const error = new Error(`Failed to load resource: ${target.tagName}`);

                handleGlobalError(error, {
                    action: 'resource_loading_error',
                    route: window.location.pathname,
                });
            }
        };

        // Add event listeners
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleGlobalJSError);
        window.addEventListener('error', handleResourceError, true); // Capture phase for resource errors

        // Cleanup event listeners
        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleGlobalJSError);
            window.removeEventListener('error', handleResourceError, true);
        };
    }, []);

    // This component doesn't render anything
    return null;
}

/**
 * Hook for manual error reporting
 */
export function useErrorReporting() {
    const reportError = (error: Error, context?: {
        action?: string;
        userId?: string;
        additionalData?: Record<string, any>;
    }) => {
        handleGlobalError(error, {
            route: window.location.pathname,
            action: context?.action || 'manual_report',
            userId: context?.userId,
            ...context?.additionalData
        });
    };

    return { reportError };
}
