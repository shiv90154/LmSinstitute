'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
    const handleRetry = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <WifiOff className="h-8 w-8 text-gray-400" />
                    </div>
                    <CardTitle>You're Offline</CardTitle>
                    <CardDescription>
                        Please check your internet connection and try again
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                        Some features may not be available while offline.
                        Your progress will be saved when you reconnect.
                    </p>
                    <Button onClick={handleRetry} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
