'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useCallback } from 'react';

export function useTokenRefresh() {
  const { data: session, update } = useSession();

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the session with new token data
        await update({
          ...session,
          user: data.user,
          token: data.token,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, [session, update]);

  useEffect(() => {
    if (!session?.user) return;

    // Check for token refresh header from middleware
    const checkTokenRefresh = () => {
      const shouldRefresh = document.querySelector('meta[name="x-token-refresh"]');
      if (shouldRefresh) {
        refreshToken();
        // Remove the meta tag after processing
        shouldRefresh.remove();
      }
    };

    // Set up interval to check for token refresh needs
    const interval = setInterval(() => {
      checkTokenRefresh();
    }, 60000); // Check every minute

    // Also check immediately
    checkTokenRefresh();

    return () => clearInterval(interval);
  }, [session, refreshToken]);

  // Set up automatic refresh based on token expiration
  useEffect(() => {
    if (!session?.user) return;

    const token = session as any;
    if (token.exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = token.exp - now;
      const refreshTime = Math.max(timeUntilExpiry - 300, 60); // Refresh 5 minutes before expiry, but at least in 1 minute

      if (refreshTime > 0) {
        const timeout = setTimeout(() => {
          refreshToken();
        }, refreshTime * 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, [session, refreshToken]);

  return { refreshToken };
}
