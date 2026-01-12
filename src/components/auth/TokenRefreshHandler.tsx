'use client';

import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface TokenRefreshHandlerProps {
    children: ReactNode;
}

export default function TokenRefreshHandler({ children }: TokenRefreshHandlerProps) {
    const { data: session, update } = useSession();

    useEffect(() => {
        if (!session?.user) return;

        // Set up periodic token refresh check
        const checkTokenExpiry = async () => {
            if (session?.expires) {
                const expiryTime = new Date(session.expires).getTime();
                const now = Date.now();
                const timeUntilExpiry = expiryTime - now;
                const fiveMinutes = 5 * 60 * 1000;

                if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
                    try {
                        const response = await fetch('/api/auth/refresh', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (response.ok) {
                            const data = await response.json();
                            await update({
                                ...session,
                                user: data.user,
                                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                            });
                        }
                    } catch (error) {
                        console.error('Periodic token refresh failed:', error);
                    }
                }
            }
        };

        // Check immediately and then every 2 minutes
        checkTokenExpiry();
        const interval = setInterval(checkTokenExpiry, 2 * 60 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [session, update]);

    // Render children
    return <>{children}</>;
}
