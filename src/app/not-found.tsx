/**
 * Custom 404 Not Found Page
 * Provides user-friendly error handling for missing pages
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-destructive">404</span>
                    </div>
                    <CardTitle className="text-2xl">Page Not Found</CardTitle>
                    <CardDescription className="text-base">
                        The page you're looking for doesn't exist or has been moved.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Here are some helpful links instead:
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button asChild variant="default" className="w-full">
                                <Link href="/">
                                    Go to Homepage
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/courses">
                                    Browse Courses
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/blog">
                                    Read Blog
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            If you believe this is an error, please{' '}
                            <Link
                                href="/contact"
                                className="text-primary hover:underline"
                            >
                                contact support
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
