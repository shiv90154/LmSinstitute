'use client';

/**
 * React Error Boundary Component
 * Catches JavaScript errors in component tree and displays fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    errorId: string;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    showDetails?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state to show error UI
        return {
            hasError: true,
            error,
            errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        };

        console.error('React Error Boundary caught an error:', errorDetails);

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            // errorTrackingService.captureException(error, {
            //   contexts: { react: { componentStack: errorInfo.componentStack } }
            // });
        }

        this.setState({
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="p-4">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <CardTitle className="text-xl text-destructive">
                                Component Error
                            </CardTitle>
                            <CardDescription>
                                An error occurred in this part of the application. You can try to recover or reload the page.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
                                <Alert variant="destructive">
                                    <AlertDescription className="space-y-2">
                                        <div>
                                            <strong>Error:</strong> {this.state.error.message}
                                        </div>
                                        {this.state.errorInfo && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer font-medium">
                                                    Component Stack
                                                </summary>
                                                <pre className="mt-2 text-xs overflow-auto max-h-40 bg-muted p-2 rounded">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </details>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={this.handleReset}
                                    variant="default"
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Reload Page
                                </Button>
                            </div>

                            <div className="text-center pt-4 border-t">
                                <p className="text-xs text-muted-foreground">
                                    Error ID: {this.state.errorId}
                                    <br />
                                    Time: {new Date().toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
