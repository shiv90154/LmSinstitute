'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

interface RelatedPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    category: string;
    tags: string[];
    author: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

interface RelatedPostsProps {
    currentPostId: string;
    category: string;
    tags: string[];
}

export default function RelatedPosts({ currentPostId, category, tags }: RelatedPostsProps) {
    const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRelatedPosts();
    }, [currentPostId, category, tags]);

    const fetchRelatedPosts = async () => {
        try {
            // Build query parameters
            const params = new URLSearchParams({
                postId: currentPostId,
                category: category,
                limit: '3',
            });

            if (tags.length > 0) {
                params.append('tags', tags.join(','));
            }

            const response = await fetch(`/api/blog/related?${params.toString()}`);

            if (response.ok) {
                const data = await response.json();
                setRelatedPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Failed to fetch related posts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (relatedPosts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                    <Link key={post._id} href={`/blog/${post.slug}`}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                            {post.featuredImage && (
                                <div className="aspect-video overflow-hidden rounded-t-lg">
                                    <img
                                        src={post.featuredImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                                    />
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                        {post.category}
                                    </Badge>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <CardTitle className="text-lg line-clamp-2 hover:text-blue-600 transition-colors">
                                    {post.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                    <User className="h-3 w-3 mr-1" />
                                    {post.author?.name || 'Career Path Institute'}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
