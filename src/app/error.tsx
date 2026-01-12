'use client';

/**
 * Global Error Boundary for Application Errors
 * Handles unexpected errors and provides recovery options
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to monitoring service
        console.error('Application error:', {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });

        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            // errorTrackingService.captureException(error);
        }
    }, [error]);

    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <CardTitle className="text-2xl text-destructive">
                        Something went wrong
                    </CardTitle>
                    <CardDescription className="text-base">
                        We encountered an unexpected error. Our team has been notified and is working on a fix.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {isDevelopment && (
                        <Alert variant="destructive">
                            <AlertDescription className="text-sm font-mono break-all">
                                <strong>Error:</strong> {error.message}
                                {error.digest && (
                                    <>
                                        <br />
                                        <strong>Digest:</strong> {error.digest}
                                    </>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-3">
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={reset}
                                variant="default"
                                className="w-full"
                            >
                                Try Again
                            </Button>

                            <Button asChild variant="outline" className="w-full">
                                <Link href="/">
                                    Go to Homepage
                                </Link>
                            </Button>

                            <Button asChild variant="outline" className="w-full">
                                <Link href="/student">
                                    Go to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t text-center">
                        <p className="text-xs text-muted-foreground">
                            Error ID: {error.digest || 'Unknown'}
                            <br />
                            Time: {new Date().toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            If this problem persists, please{' '}
                            <Link
                                href="/contact"
                                className="text-primary hover:underline"
                            >
                                contact support
                            </Link>{' '}
                            with the error ID above.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
