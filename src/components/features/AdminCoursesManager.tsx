'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    sections: any[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminCoursesManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        thumbnail: '',
        isActive: true,
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses');
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses || []);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
            const method = editingCourse ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchCourses();
                resetForm();
                setIsCreateDialogOpen(false);
                setEditingCourse(null);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to save course');
            }
        } catch (error) {
            console.error('Failed to save course:', error);
            alert('Failed to save course');
        }
    };

    const handleDelete = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchCourses();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete course');
            }
        } catch (error) {
            console.error('Failed to delete course:', error);
            alert('Failed to delete course');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: 0,
            thumbnail: '',
            isActive: true,
        });
    };

    const openEditDialog = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            price: course.price,
            thumbnail: course.thumbnail,
            isActive: course.isActive,
        });
        setIsCreateDialogOpen(true);
    };

    if (loading) {
        return <div className="animate-pulse">Loading courses...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Courses</h2>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCourse ? 'Edit Course' : 'Create New Course'}
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
                            <div>
                                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                                <Input
                                    id="thumbnail"
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
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
                                        setEditingCourse(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingCourse ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course._id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{course.title}</CardTitle>
                                <div className="flex space-x-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditDialog(course)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(course._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {course.description}
                            </p>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">₹{course.price}</span>
                                <span className={`px-2 py-1 rounded text-xs ${course.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {course.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                {course.sections.length} sections
                            </p>
                            <p className="text-xs text-gray-500">
                                Created: {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {courses.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-500">No courses found. Create your first course!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
