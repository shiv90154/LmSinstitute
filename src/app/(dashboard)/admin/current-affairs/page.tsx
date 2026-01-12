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
import { Plus, Edit, Trash2, Eye, Calendar, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

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
    isActive: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

interface CurrentAffairsForm {
    title: string;
    content: string;
    summary: string;
    category: string;
    tags: string;
    date: string;
    source: string;
    imageUrl: string;
}

const initialForm: CurrentAffairsForm = {
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    imageUrl: '',
};

const categories = [
    'Politics',
    'Economy',
    'Sports',
    'Science & Technology',
    'Environment',
    'International Affairs',
    'Defense',
    'Awards & Honors',
    'Books & Authors',
    'Important Days',
];

export default function AdminCurrentAffairsPage() {
    const { data: session } = useSession();
    const [currentAffairs, setCurrentAffairs] = useState<CurrentAffairs[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CurrentAffairs | null>(null);
    const [formData, setFormData] = useState<CurrentAffairsForm>(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const fetchCurrentAffairs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: '50',
            });

            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory) params.append('category', selectedCategory);

            const response = await fetch(`/api/current-affairs?${params}`);
            const data = await response.json();

            if (data.success) {
                setCurrentAffairs(data.data.currentAffairs);
            }
        } catch (error) {
            console.error('Error fetching current affairs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchCurrentAffairs();
        }
    }, [session, searchTerm, selectedCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (session?.user?.role !== 'admin') return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            };

            const url = editingItem
                ? `/api/current-affairs/${editingItem._id}`
                : '/api/current-affairs';

            const method = editingItem ? 'PUT' : 'POST';

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
                setEditingItem(null);
                setFormData(initialForm);
                fetchCurrentAffairs();
            } else {
                alert(data.error || 'Failed to save current affairs');
            }
        } catch (error) {
            console.error('Error saving current affairs:', error);
            alert('Failed to save current affairs');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: CurrentAffairs) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            summary: item.summary,
            category: item.category,
            tags: item.tags.join(', '),
            date: item.date.split('T')[0],
            source: item.source || '',
            imageUrl: item.imageUrl || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (session?.user?.role !== 'admin') return;
        if (!confirm('Are you sure you want to delete this current affairs item?')) return;

        try {
            const response = await fetch(`/api/current-affairs/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                fetchCurrentAffairs();
            } else {
                alert(data.error || 'Failed to delete current affairs');
            }
        } catch (error) {
            console.error('Error deleting current affairs:', error);
            alert('Failed to delete current affairs');
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
                    <h1 className="text-3xl font-bold">Current Affairs Management</h1>
                    <p className="text-muted-foreground">Create and manage current affairs content</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingItem(null);
                            setFormData(initialForm);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Current Affairs
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Edit Current Affairs' : 'Add New Current Affairs'}
                            </DialogTitle>
                            <DialogDescription>
                                Create or update current affairs content with rich text formatting.
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

                                <div>
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="source">Source</Label>
                                    <Input
                                        id="source"
                                        value={formData.source}
                                        onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                                        placeholder="News source"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="summary">Summary *</Label>
                                <Input
                                    id="summary"
                                    value={formData.summary}
                                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                    placeholder="Brief summary of the current affairs"
                                    required
                                />
                            </div>

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
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div>
                                <Label>Content *</Label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                                    placeholder="Write the detailed current affairs content..."
                                    minHeight="400px"
                                />
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
                                    {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
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
                        placeholder="Search current affairs..."
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

            {/* Current Affairs List */}
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
            ) : currentAffairs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentAffairs.map((item) => (
                        <Card key={item._id} className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={item.isActive ? "default" : "secondary"}>
                                        {item.category}
                                    </Badge>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Eye className="h-3 w-3 mr-1" />
                                        {item.viewCount}
                                    </div>
                                </div>
                                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                                <CardDescription className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {formatDate(item.date)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {item.summary}
                                </p>

                                {item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {item.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {item.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{item.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(item._id)}
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
                    <p className="text-muted-foreground">No current affairs found.</p>
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-4"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Current Affairs
                    </Button>
                </div>
            )}
        </div>
    );
}
