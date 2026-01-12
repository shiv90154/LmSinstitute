'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft, Eye, Share2 } from 'lucide-react';
import Link from 'next/link';

interface CurrentAffairs {
    _id: string;
    title: string;
    content: string;
    summary: string;
    category: string;
    tags: string[];
    date: string;
    month: number;
    year: number;
    source?: string;
    imageUrl?: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function CurrentAffairsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [currentAffairs, setCurrentAffairs] = useState<CurrentAffairs | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCurrentAffairs = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/current-affairs/${params.id}`);
                const data = await response.json();

                if (data.success) {
                    setCurrentAffairs(data.data);
                } else {
                    setError(data.error || 'Failed to fetch current affairs');
                }
            } catch (error) {
                console.error('Error fetching current affairs:', error);
                setError('Failed to fetch current affairs');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchCurrentAffairs();
        }
    }, [params.id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleShare = async () => {
        if (navigator.share && currentAffairs) {
            try {
                await navigator.share({
                    title: currentAffairs.title,
                    text: currentAffairs.summary,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
                    <div className="h-64 bg-muted rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                        <div className="h-4 bg-muted rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !currentAffairs) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Current Affairs Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        {error || 'The current affairs article you are looking for does not exist.'}
                    </p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Navigation */}
            <div className="mb-6">
                <Link href="/current-affairs">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Current Affairs
                    </Button>
                </Link>
            </div>

            {/* Article Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-sm">
                        {currentAffairs.category}
                    </Badge>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {currentAffairs.viewCount} views
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                        </Button>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {currentAffairs.title}
                </h1>

                <div className="flex items-center text-muted-foreground mb-6">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(currentAffairs.date)}</span>
                    {currentAffairs.source && (
                        <>
                            <span className="mx-2">•</span>
                            <span>Source: {currentAffairs.source}</span>
                        </>
                    )}
                </div>

                {currentAffairs.imageUrl && (
                    <div className="aspect-video relative overflow-hidden rounded-lg mb-6">
                        <img
                            src={currentAffairs.imageUrl}
                            alt={currentAffairs.title}
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}
            </div>

            {/* Article Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6">
                                {currentAffairs.summary}
                            </p>

                            <div className="prose prose-gray max-w-none">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: currentAffairs.content.replace(/\n/g, '<br />')
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Article Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Category</h4>
                                <Badge variant="outline">{currentAffairs.category}</Badge>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Date</h4>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(currentAffairs.date)}
                                </p>
                            </div>

                            {currentAffairs.tags.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {currentAffairs.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentAffairs.source && (
                                <div>
                                    <h4 className="font-semibold mb-2">Source</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {currentAffairs.source}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-semibold mb-2">Views</h4>
                                <p className="text-sm text-muted-foreground">
                                    {currentAffairs.viewCount} views
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Related Articles Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="text-center py-8 text-muted-foreground">
                    <p>Related articles feature coming soon...</p>
                </div>
            </div>
        </div>
    );
}