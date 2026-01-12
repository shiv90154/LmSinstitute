'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, Tag } from 'lucide-react';

interface BlogPost {
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
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
    };
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 9;

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        filterPosts();
    }, [posts, searchTerm, categoryFilter]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/blog');
            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPosts = () => {
        let filtered = posts;

        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(post => post.category === categoryFilter);
        }

        setFilteredPosts(filtered);
        setCurrentPage(1);
    };

    const getUniqueCategories = () => {
        const categories = posts.map(post => post.category);
        return Array.from(new Set(categories));
    };

    const getPaginatedPosts = () => {
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        return filteredPosts.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Career Path Institute Blog</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Stay updated with the latest exam preparation tips, study guides, and educational insights
                    to help you succeed in your competitive exams.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getUniqueCategories().map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {getPaginatedPosts().map((post) => (
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
                                    <CardHeader>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline">{post.category}</Badge>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <User className="h-3 w-3 mr-1" />
                                                {post.author?.name || 'Career Path Institute'}
                                            </div>
                                            {post.tags.length > 0 && (
                                                <div className="flex items-center">
                                                    <Tag className="h-3 w-3 mr-1 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {post.tags.slice(0, 2).join(', ')}
                                                        {post.tags.length > 2 && '...'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 text-sm border rounded-md ${currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="px-2">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Search className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-500">
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Check back later for new articles.'}
                    </p>
                </div>
            )}
        </div>
    );
}
