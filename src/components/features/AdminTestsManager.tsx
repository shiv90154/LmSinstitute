'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, Users } from 'lucide-react';

interface MockTest {
    _id: string;
    title: string;
    description: string;
    duration: number;
    sections: Array<{
        _id: string;
        title: string;
        questions: Array<{
            _id: string;
            text: string;
            options: string[];
            correctAnswer: number;
            explanation?: string;
            marks: number;
        }>;
        timeLimit?: number;
    }>;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminTestsManager() {
    const [tests, setTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<MockTest | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        price: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await fetch('/api/tests');
            if (response.ok) {
                const data = await response.json();
                setTests(data.tests || []);
            }
        } catch (error) {
            console.error('Failed to fetch tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingTest ? `/api/tests/${editingTest._id}` : '/api/tests';
            const method = editingTest ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchTests();
                resetForm();
                setIsCreateDialogOpen(false);
                setEditingTest(null);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to save test');
            }
        } catch (error) {
            console.error('Failed to save test:', error);
            alert('Failed to save test');
        }
    };

    const handleDelete = async (testId: string) => {
        if (!confirm('Are you sure you want to delete this test?')) return;

        try {
            const response = await fetch(`/api/tests/${testId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchTests();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete test');
            }
        } catch (error) {
            console.error('Failed to delete test:', error);
            alert('Failed to delete test');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            duration: 60,
            price: 0,
            isActive: true,
        });
    };

    const openEditDialog = (test: MockTest) => {
        setEditingTest(test);
        setFormData({
            title: test.title,
            description: test.description,
            duration: test.duration,
            price: test.price,
            isActive: test.isActive,
        });
        setIsCreateDialogOpen(true);
    };

    const getTotalQuestions = (test: MockTest) => {
        return test.sections.reduce((total, section) => total + section.questions.length, 0);
    };

    if (loading) {
        return <div className="animate-pulse">Loading tests...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Mock Tests</h2>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Test
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingTest ? 'Edit Mock Test' : 'Create New Mock Test'}
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
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setEditingTest(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingTest ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                    <Card key={test._id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{test.title}</CardTitle>
                                <div className="flex space-x-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditDialog(test)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(test._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {test.description}
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Duration:</span>
                                    <span className="font-medium">{test.duration} min</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Price:</span>
                                    <span className="font-semibold">₹{test.price}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Questions:</span>
                                    <span className="font-medium">{getTotalQuestions(test)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Sections:</span>
                                    <span className="font-medium">{test.sections.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <span className={`px-2 py-1 rounded text-xs ${test.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {test.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Created: {new Date(test.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {tests.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-500">No mock tests found. Create your first test!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
