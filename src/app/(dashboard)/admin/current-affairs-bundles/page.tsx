'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, Calendar, IndianRupee, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CurrentAffairsBundle {
    _id: string;
    title: string;
    description: string;
    type: 'monthly' | 'yearly';
    month?: number;
    year: number;
    price: number;
    currentAffairsIds: any[];
    isActive: boolean;
    purchaseCount: number;
    createdAt: string;
    updatedAt: string;
}

interface CurrentAffairs {
    _id: string;
    title: string;
    date: string;
    category: string;
    month: number;
    year: number;
}

interface BundleForm {
    title: string;
    description: string;
    type: 'monthly' | 'yearly';
    month: string;
    year: string;
    price: string;
    currentAffairsIds: string[];
}

const initialForm: BundleForm = {
    title: '',
    description: '',
    type: 'monthly',
    month: '',
    year: new Date().getFullYear().toString(),
    price: '',
    currentAffairsIds: [],
};

export default function AdminCurrentAffairsBundlesPage() {
    const { data: session } = useSession();
    const [bundles, setBundles] = useState<CurrentAffairsBundle[]>([]);
    const [availableCurrentAffairs, setAvailableCurrentAffairs] = useState<CurrentAffairs[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState<CurrentAffairsBundle | null>(null);
    const [formData, setFormData] = useState<BundleForm>(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const fetchBundles = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: '50',
            });

            if (selectedType) params.append('type', selectedType);

            const response = await fetch(`/api/current-affairs/bundles?${params}`);
            const data = await response.json();

            if (data.success) {
                setBundles(data.data.bundles);
            }
        } catch (error) {
            console.error('Error fetching bundles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableCurrentAffairs = async () => {
        try {
            const response = await fetch('/api/current-affairs?limit=1000');
            const data = await response.json();

            if (data.success) {
                setAvailableCurrentAffairs(data.data.currentAffairs);
            }
        } catch (error) {
            console.error('Error fetching current affairs:', error);
        }
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchBundles();
            fetchAvailableCurrentAffairs();
        }
    }, [session, selectedType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (session?.user?.role !== 'admin') return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                month: formData.type === 'monthly' ? parseInt(formData.month) : undefined,
                year: parseInt(formData.year),
                price: parseFloat(formData.price),
            };

            const url = editingBundle
                ? `/api/current-affairs/bundles/${editingBundle._id}`
                : '/api/current-affairs/bundles';

            const method = editingBundle ? 'PUT' : 'POST';

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
                setEditingBundle(null);
                setFormData(initialForm);
                fetchBundles();
            } else {
                alert(data.error || 'Failed to save bundle');
            }
        } catch (error) {
            console.error('Error saving bundle:', error);
            alert('Failed to save bundle');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (bundle: CurrentAffairsBundle) => {
        setEditingBundle(bundle);
        setFormData({
            title: bundle.title,
            description: bundle.description,
            type: bundle.type,
            month: bundle.month?.toString() || '',
            year: bundle.year.toString(),
            price: bundle.price.toString(),
            currentAffairsIds: bundle.currentAffairsIds.map(item => item._id || item),
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (session?.user?.role !== 'admin') return;
        if (!confirm('Are you sure you want to delete this bundle?')) return;

        try {
            const response = await fetch(`/api/current-affairs/bundles/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                fetchBundles();
            } else {
                alert(data.error || 'Failed to delete bundle');
            }
        } catch (error) {
            console.error('Error deleting bundle:', error);
            alert('Failed to delete bundle');
        }
    };

    const getFilteredCurrentAffairs = () => {
        if (formData.type === 'yearly') {
            return availableCurrentAffairs.filter(item => item.year === parseInt(formData.year));
        } else if (formData.type === 'monthly' && formData.month && formData.year) {
            return availableCurrentAffairs.filter(
                item => item.month === parseInt(formData.month) && item.year === parseInt(formData.year)
            );
        }
        return [];
    };

    const handleCurrentAffairsToggle = (id: string) => {
        setFormData(prev => ({
            ...prev,
            currentAffairsIds: prev.currentAffairsIds.includes(id)
                ? prev.currentAffairsIds.filter(itemId => itemId !== id)
                : [...prev.currentAffairsIds, id]
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getBundleTitle = (bundle: CurrentAffairsBundle) => {
        if (bundle.type === 'monthly' && bundle.month) {
            const monthName = months.find(m => m.value === bundle.month?.toString())?.label;
            return `${monthName} ${bundle.year}`;
        }
        return `Year ${bundle.year}`;
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
                    <h1 className="text-3xl font-bold">Current Affairs Bundles</h1>
                    <p className="text-muted-foreground">Create and manage current affairs bundles</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingBundle(null);
                            setFormData(initialForm);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Bundle
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBundle ? 'Edit Bundle' : 'Add New Bundle'}
                            </DialogTitle>
                            <DialogDescription>
                                Create monthly or yearly current affairs bundles.
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
                                    <Label htmlFor="type">Bundle Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: 'monthly' | 'yearly') => setFormData(prev => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.type === 'monthly' && (
                                    <div>
                                        <Label htmlFor="month">Month *</Label>
                                        <Select
                                            value={formData.month}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem key={month.value} value={month.value}>
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="year">Year *</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                        min="2020"
                                        max={new Date().getFullYear() + 1}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="price">Price (₹) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Bundle description"
                                    required
                                />
                            </div>

                            {/* Current Affairs Selection */}
                            {(formData.year && (formData.type === 'yearly' || formData.month)) && (
                                <div>
                                    <Label>Select Current Affairs Articles</Label>
                                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                                        {getFilteredCurrentAffairs().length > 0 ? (
                                            <div className="space-y-2">
                                                {getFilteredCurrentAffairs().map((item) => (
                                                    <div key={item._id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={item._id}
                                                            checked={formData.currentAffairsIds.includes(item._id)}
                                                            onChange={() => handleCurrentAffairsToggle(item._id)}
                                                            className="rounded"
                                                        />
                                                        <label htmlFor={item._id} className="flex-1 text-sm cursor-pointer">
                                                            <div className="font-medium">{item.title}</div>
                                                            <div className="text-muted-foreground">
                                                                {item.category} • {formatDate(item.date)}
                                                            </div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-4">
                                                No current affairs articles found for the selected period.
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Selected: {formData.currentAffairsIds.length} articles
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingBundle ? 'Update' : 'Create')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search bundles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bundles List */}
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
            ) : bundles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bundles.map((bundle) => (
                        <Card key={bundle._id} className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={bundle.type === 'monthly' ? 'default' : 'secondary'}>
                                        {bundle.type === 'monthly' ? 'Monthly' : 'Yearly'}
                                    </Badge>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Package className="h-3 w-3 mr-1" />
                                        {bundle.currentAffairsIds.length}
                                    </div>
                                </div>
                                <CardTitle className="line-clamp-2">
                                    {bundle.title || getBundleTitle(bundle)}
                                </CardTitle>
                                <CardDescription className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {getBundleTitle(bundle)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {bundle.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center font-semibold text-lg">
                                        <IndianRupee className="h-4 w-4" />
                                        {bundle.price}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {bundle.purchaseCount} sold
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(bundle)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(bundle._id)}
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
                    <p className="text-muted-foreground">No bundles found.</p>
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-4"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Bundle
                    </Button>
                </div>
            )}
        </div>
    );
}
