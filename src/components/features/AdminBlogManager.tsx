'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Search, Wand2 } from 'lucide-react';
import { optimizeKeywords, generateMetaDescription } from '@/lib/utils/seo-utils';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    category: string;
    tags: string[];
    author: {
        _id: string;
        name: string;
    };
    isPublished: boolean;
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
    };
    createdAt: string;
    updatedAt: string;
}

export default function AdminBlogManager() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        category: '',
        tags: '',
        isPublished: false,
        metaTitle: '',
        metaDescription: '',
        keywords: '',
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        filterPosts();
    }, [posts, searchTerm, categoryFilter, statusFilter]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/admin/blog');
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
                post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(post => post.category === categoryFilter);
        }

        if (statusFilter !== 'all') {
            const isPublished = statusFilter === 'published';
            filtered = filtered.filter(post => post.isPublished === isPublished);
        }

        setFilteredPosts(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingPost ? `/api/admin/blog/${editingPost._id}` : '/api/admin/blog';
            const method = editingPost ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                seo: {
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription,
                    keywords: formData.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword),
                },
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchPosts();
                resetForm();
                setIsCreateDialogOpen(false);
                setEditingPost(null);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to save post');
            }
        } catch (error) {
            console.error('Failed to save post:', error);
            alert('Failed to save post');
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/admin/blog/${postId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchPosts();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        }
    };

    const handleAutoOptimizeSEO = () => {
        if (formData.title && formData.content) {
            const keywords = optimizeKeywords(formData.content, formData.title);
            const metaDescription = generateMetaDescription(formData.excerpt || formData.content);

            setFormData({
                ...formData,
                metaTitle: formData.title.length <= 60 ? formData.title : formData.title.substring(0, 57) + '...',
                metaDescription,
                keywords: keywords.join(', '),
            });
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            excerpt: '',
            featuredImage: '',
            category: '',
            tags: '',
            isPublished: false,
            metaTitle: '',
            metaDescription: '',
            keywords: '',
        });
    };

    const openEditDialog = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage || '',
            category: post.category,
            tags: post.tags.join(', '),
            isPublished: post.isPublished,
            metaTitle: post.seo.metaTitle,
            metaDescription: post.seo.metaDescription,
            keywords: post.seo.keywords.join(', '),
        });
        setIsCreateDialogOpen(true);
    };

    const getUniqueCategories = () => {
        const categories = posts.map(post => post.category);
        return Array.from(new Set(categories));
    };

    if (loading) {
        return <div className="animate-pulse">Loading blog posts...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {getUniqueCategories().map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tags">Tags (comma separated)</Label>
                                    <Input
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="featuredImage">Featured Image URL</Label>
                                <Input
                                    id="featuredImage"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                />
                            </div>

                            {/* SEO Section */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">SEO Settings</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAutoOptimizeSEO}
                                        disabled={!formData.title || !formData.content}
                                    >
                                        <Wand2 className="h-3 w-3 mr-1" />
                                        Auto-Optimize
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <Label htmlFor="metaTitle">Meta Title</Label>
                                        <Input
                                            id="metaTitle"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="metaDescription">Meta Description</Label>
                                        <Textarea
                                            id="metaDescription"
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="keywords">Keywords (comma separated)</Label>
                                        <Input
                                            id="keywords"
                                            value={formData.keywords}
                                            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                />
                                <Label htmlFor="isPublished">Published</Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setEditingPost(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingPost ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Posts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Title</th>
                                    <th className="text-left p-2">Category</th>
                                    <th className="text-left p-2">Author</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Date</th>
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPosts.map((post) => (
                                    <tr key={post._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">
                                            <div>
                                                <p className="font-medium">{post.title}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <Badge variant="outline">{post.category}</Badge>
                                        </td>
                                        <td className="p-2">{post.author?.name || 'Unknown'}</td>
                                        <td className="p-2">
                                            <Badge className={post.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                {post.isPublished ? 'Published' : 'Draft'}
                                            </Badge>
                                        </td>
                                        <td className="p-2">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex space-x-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(post)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(post._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No blog posts found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
