'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Plus, Edit, Trash2, Eye, Calendar, Search, Globe } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    category: string;
    tags: string[];
    author: string;
    isPublished: boolean;
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
    };
    createdAt: string;
    updatedAt: string;
}

interface BlogPostForm {
    title: string;
    content: string;
    excerpt: string;
    featuredImage: string;
    category: string;
    tags: string;
    isPublished: boolean;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
}

const initialForm: BlogPostForm = {
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
};

const categories = [
    'Exam Preparation',
    'Study Tips',
    'Current Affairs',
    'Career Guidance',
    'Success Stories',
    'Educational News',
    'Government Jobs',
    'Competitive Exams',
    'General Knowledge',
    'Announcements',
];

export default function AdminBlogPostsPage() {
    const { data: session } = useSession();
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<BlogPostForm>(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const fetchBlogPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: '50',
            });

            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory) params.append('category', selectedCategory);

            const response = await fetch(`/api/admin/blog?${params}`);
            const data = await response.json();

            if (data.success) {
                setBlogPosts(data.data.posts);
            }
        } catch (error) {
            console.error('Error fetching blog posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchBlogPosts();
        }
    }, [session, searchTerm, selectedCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (session?.user?.role !== 'admin') return;

        setSubmitting(true);
        try {
            const slug = generateSlug(formData.title);
            const payload = {
                ...formData,
                slug,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                seo: {
                    metaTitle: formData.metaTitle || formData.title,
                    metaDescription: formData.metaDescription || formData.excerpt,
                    keywords: formData.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean),
                },
            };

            const url = editingPost
                ? `/api/admin/blog/${editingPost._id}`
                : '/api/admin/blog';

            const method = editingPost ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setIsDialogOpen(false);
                setEditingPost(null);
                setFormData(initialForm);
                fetchBlogPosts();
            } else {
                alert(data.error || 'Failed to save blog post');
            }
        } catch (error) {
            console.error('Error saving blog post:', error);
            alert('Failed to save blog post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (post: BlogPost) => {
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
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (session?.user?.role !== 'admin') return;
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            const response = await fetch(`/api/admin/blog/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                fetchBlogPosts();
            } else {
                alert(data.error || 'Failed to delete blog post');
            }
        } catch (error) {
            console.error('Error deleting blog post:', error);
            alert('Failed to delete blog post');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (session?.user?.role !== 'admin') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Blog Posts Management</h1>
                    <p className="text-muted-foreground">Create and manage blog content with SEO optimization</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingPost(null);
                            setFormData(initialForm);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Blog Post
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}
                            </DialogTitle>
                            <DialogDescription>
                                Create or update blog content with rich text formatting and SEO optimization.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                    {formData.title && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Slug: {generateSlug(formData.title)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="excerpt">Excerpt *</Label>
                                <Input
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                    placeholder="Brief description of the blog post"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tags">Tags</Label>
                                    <Input
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                        placeholder="Comma-separated tags"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                                    <Input
                                        id="featuredImage"
                                        value={formData.featuredImage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Content *</Label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                                    placeholder="Write your blog post content..."
                                    minHeight="400px"
                                />
                            </div>

                            {/* SEO Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Globe className="h-5 w-5 mr-2" />
                                    SEO Settings
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="metaTitle">Meta Title</Label>
                                        <Input
                                            id="metaTitle"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                            placeholder="SEO title (defaults to post title)"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="metaDescription">Meta Description</Label>
                                        <Input
                                            id="metaDescription"
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                            placeholder="SEO description (defaults to excerpt)"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="keywords">SEO Keywords</Label>
                                        <Input
                                            id="keywords"
                                            value={formData.keywords}
                                            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                                            placeholder="Comma-separated SEO keywords"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                                    className="rounded"
                                />
                                <Label htmlFor="isPublished">Publish immediately</Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingPost ? 'Update' : 'Create')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search blog posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Blog Posts List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-3 bg-muted rounded"></div>
                                    <div className="h-3 bg-muted rounded w-5/6"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : blogPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <Card key={post._id} className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={post.isPublished ? "default" : "secondary"}>
                                        {post.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                    <Badge variant="outline">
                                        {post.category}
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                <CardDescription className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {formatDate(post.createdAt)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {post.excerpt}
                                </p>

                                {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {post.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {post.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{post.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(post)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(post._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No blog posts found.</p>
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-4"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Blog Post
                    </Button>
                </div>
            )}
        </div>
    );
}
