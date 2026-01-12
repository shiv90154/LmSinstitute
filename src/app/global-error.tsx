'use client';

/**
 * Global Error Handler for Root Layout Errors
 * Handles errors that occur in the root layout or during hydration
 */

import { useEffect } from 'react';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log critical error
        console.error('Critical application error:', {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        });

        // In production, send to error tracking service immediately
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            // errorTrackingService.captureException(error, { level: 'fatal' });
        }
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    fontFamily: 'system-ui, sans-serif',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2rem',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            backgroundColor: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                        }}>
                            ⚠️
                        </div>

                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#dc2626',
                            marginBottom: '0.5rem'
                        }}>
                            Critical Error
                        </h1>

                        <p style={{
                            color: '#6b7280',
                            marginBottom: '1.5rem',
                            lineHeight: '1.5'
                        }}>
                            A critical error occurred that prevented the application from loading properly.
                            Our team has been automatically notified.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                textAlign: 'left'
                            }}>
                                <strong style={{ color: '#dc2626' }}>Development Error:</strong>
                                <pre style={{
                                    fontSize: '0.875rem',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    margin: '0.5rem 0 0 0',
                                    color: '#374151'
                                }}>
                                    {error.message}
                                </pre>
                                {error.digest && (
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: '#6b7280',
                                        margin: '0.5rem 0 0 0'
                                    }}>
                                        <strong>Digest:</strong> {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                            <button
                                onClick={reset}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '4px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                }}
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '4px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                Go to Homepage
                            </button>
                        </div>

                        <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #e5e7eb',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                        }}>
                            <p>Error ID: {error.digest || 'Unknown'}</p>
                            <p>Time: {new Date().toLocaleString()}</p>
                            <p style={{ marginTop: '0.5rem' }}>
                                If this problem persists, please contact support with the error ID above.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
