'use client';

import { useEffect } from 'react';

interface PerformanceMonitorProps {
    children: React.ReactNode;
}

export default function PerformanceMonitorComponent({ children }: PerformanceMonitorProps) {
    useEffect(() => {
        // Simple performance monitoring without complex dependencies
        if (typeof window !== 'undefined') {
            // Monitor Core Web Vitals if available
            import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
                const reportWebVital = (metric: any) => {
                    // Send to monitoring service in production
                    if (process.env.NODE_ENV === 'production') {
                        // monitoring.track('web-vital', { name: metric.name, value: metric.value });
                    }
                };

                onCLS(reportWebVital);
                onINP(reportWebVital);
                onFCP(reportWebVital);
                onLCP(reportWebVital);
                onTTFB(reportWebVital);
            }).catch(() => {
                // Silently fail if web-vitals is not available
            });
        }
    }, []);

    return <>{children}</>;
}
