'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    BookOpen,
    PlayCircle,
    FileText,
    Trophy,
    User,
    Clock,
    TrendingUp
} from 'lucide-react';

interface ProfileData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    joinedAt: string;
}

interface DashboardData {
    courses: Array<{
        _id: string;
        title: string;
        thumbnail: string;
        progress: number;
        totalSections: number;
        completedSections: number;
        lastAccessed: string;
    }>;
    books: Array<{
        _id: string;
        title: string;
        type: string;
        purchaseDate: string;
    }>;
    studyMaterials: Array<{
        _id: string;
        title: string;
        type: string;
        purchaseDate: string;
    }>;
    testHistory: Array<{
        _id: string;
        testTitle: string;
        score: number;
        totalMarks: number;
        percentage: number;
        completedAt: string;
        timeSpent: number;
    }>;
    paymentHistory: Array<{
        _id: string;
        totalAmount: number;
        status: string;
        items: Array<{
            title: string;
            type: string;
            price: number;
        }>;
        createdAt: string;
    }>;
    profile: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        joinedAt: string;
    };
}

export default function StudentDashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleProfileUpdate = (updatedProfile: ProfileData) => {
        if (dashboardData) {
            setDashboardData({
                ...dashboardData,
                profile: updatedProfile
            });
        }
    };

    useEffect(() => {
        // Simulate loading for now
        setTimeout(() => {
            setDashboardData({
                courses: [],
                books: [],
                studyMaterials: [],
                testHistory: [],
                paymentHistory: [],
                profile: {
                    name: 'Student User',
                    email: 'student@example.com',
                    joinedAt: new Date().toISOString()
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/student/dashboard');

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={fetchDashboardData} className="w-full">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { courses, books, studyMaterials, testHistory, paymentHistory, profile } = dashboardData;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {profile.name}!
                    </h1>
                    <p className="text-gray-600">
                        Track your learning progress and manage your courses
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Enrolled Courses</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{courses.length}</p>
                                </div>
                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Study Materials</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{books.length + studyMaterials.length}</p>
                                </div>
                                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Tests Taken</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{testHistory.length}</p>
                                </div>
                                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Score</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {testHistory.length > 0
                                            ? Math.round(testHistory.reduce((sum, test) => sum + test.percentage, 0) / testHistory.length)
                                            : 0}%
                                    </p>
                                </div>
                                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Enrolled Courses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlayCircle className="h-5 w-5" />
                                My Courses
                            </CardTitle>
                            <CardDescription>
                                Continue your learning journey
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {courses.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No courses enrolled yet. Browse our course catalog to get started!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {courses.slice(0, 3).map((course) => (
                                        <div key={course._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {course.completedSections} of {course.totalSections} sections completed
                                                </p>
                                                <Progress value={course.progress} className="mt-2" />
                                            </div>
                                            <Button size="sm" variant="outline">
                                                Continue
                                            </Button>
                                        </div>
                                    ))}
                                    {courses.length > 3 && (
                                        <Button variant="ghost" className="w-full">
                                            View All Courses ({courses.length})
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Test Results */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Recent Test Results
                            </CardTitle>
                            <CardDescription>
                                Your latest performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {testHistory.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No tests taken yet. Start with a mock test to assess your knowledge!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {testHistory.slice(0, 3).map((test) => (
                                        <div key={test._id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{test.testTitle}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(test.completedAt).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">{test.timeSpent} min</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={test.percentage >= 70 ? "default" : test.percentage >= 50 ? "secondary" : "destructive"}>
                                                        {test.percentage}%
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {test.score}/{test.totalMarks}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {testHistory.length > 3 && (
                                        <Button variant="ghost" className="w-full">
                                            View All Results ({testHistory.length})
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Study Materials */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Study Materials
                            </CardTitle>
                            <CardDescription>
                                Books and resources you own
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {books.length === 0 && studyMaterials.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No study materials purchased yet. Check out our books and resources!
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {[...books, ...studyMaterials].slice(0, 4).map((material) => (
                                        <div key={material._id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{material.title}</h4>
                                                    <p className="text-sm text-gray-500 capitalize">{material.type}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                Access
                                            </Button>
                                        </div>
                                    ))}
                                    {(books.length + studyMaterials.length) > 4 && (
                                        <Button variant="ghost" className="w-full">
                                            View All Materials ({books.length + studyMaterials.length})
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Profile & Payment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile & Orders
                            </CardTitle>
                            <CardDescription>
                                Your account information and purchase history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Profile Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-500">Email:</span> {profile.email}</p>
                                        {profile.phone && <p><span className="text-gray-500">Phone:</span> {profile.phone}</p>}
                                        <p><span className="text-gray-500">Member since:</span> {new Date(profile.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="mt-2">
                                        Edit Profile
                                    </Button>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Recent Orders</h4>
                                    {paymentHistory.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No orders yet</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {paymentHistory.slice(0, 2).map((order) => (
                                                <div key={order._id} className="p-3 border rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                                            {order.status}
                                                        </Badge>
                                                        <span className="text-sm font-medium">₹{order.totalAmount}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                            {paymentHistory.length > 2 && (
                                                <Button size="sm" variant="ghost" className="w-full">
                                                    View All Orders ({paymentHistory.length})
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
