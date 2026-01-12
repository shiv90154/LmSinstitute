'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from '@/components/features/AddToCartButton';
import {
    GraduationCap,
    Users,
    Clock,
    Play,
    Star,
    BookOpen,
    Award,
    Smartphone
} from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    instructor: string;
    duration: string;
    lectures: number;
    students: number;
    rating: number;
    level: string;
    language: string;
    subjects: string[];
    features: string[];
    sections?: Array<{
        id: string;
        title: string;
        lectures: number;
        duration: string;
        topics: string[];
    }>;
}

interface CoursesGridProps {
    courses: Course[];
    isAuthenticated: boolean;
}

export default function CoursesGrid({ courses, isAuthenticated }: CoursesGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');

    const categories = [
        { id: 'all', name: 'All Courses' },
        { id: 'complete', name: 'Complete Preparation' },
        { id: 'subject', name: 'Subject-wise' },
        { id: 'crash', name: 'Crash Courses' },
    ];

    const levels = [
        { id: 'all', name: 'All Levels' },
        { id: 'beginner', name: 'Beginner' },
        { id: 'intermediate', name: 'Intermediate' },
        { id: 'advanced', name: 'Advanced' },
    ];

    const filteredCourses = courses.filter(course => {
        const categoryMatch = selectedCategory === 'all' ||
            (selectedCategory === 'complete' && course.title.toLowerCase().includes('complete')) ||
            (selectedCategory === 'subject' && course.subjects.length <= 3) ||
            (selectedCategory === 'crash' && course.title.toLowerCase().includes('crash'));

        const levelMatch = selectedLevel === 'all' ||
            course.level.toLowerCase().includes(selectedLevel);

        return categoryMatch && levelMatch;
    });

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-sm font-medium text-gray-700 flex items-center mr-4">
                        Category:
                    </span>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className="rounded-full"
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-sm font-medium text-gray-700 flex items-center mr-4">
                        Level:
                    </span>
                    {levels.map((level) => (
                        <Button
                            key={level.id}
                            variant={selectedLevel === level.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedLevel(level.id)}
                            className="rounded-full"
                        >
                            {level.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="relative">
                                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                                    <GraduationCap className="h-16 w-16 text-blue-600" />
                                </div>
                                {course.originalPrice && (
                                    <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                                        {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                                    </Badge>
                                )}
                                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                    {course.level}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < Math.floor(course.rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">
                                        {course.rating} ({course.students} students)
                                    </span>
                                </div>
                            </div>

                            <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
                                {course.title}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-2">
                                {course.description}
                            </p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>{course.instructor}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Play className="h-4 w-4 mr-1" />
                                        <span>{course.lectures} lectures</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>{course.duration}</span>
                                    </div>
                                </div>

                                <div className="flex items-center text-sm text-gray-500">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    <span>{course.language}</span>
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="space-y-2 mb-4">
                                <h4 className="font-semibold text-sm text-gray-900">Key Features:</h4>
                                <div className="space-y-1">
                                    {course.features.slice(0, 3).map((feature) => (
                                        <div key={feature} className="flex items-center text-xs text-gray-600">
                                            <Award className="h-3 w-3 mr-2 text-green-500" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {course.features.length > 3 && (
                                        <div className="text-xs text-blue-600">
                                            +{course.features.length - 3} more features
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subjects */}
                            <div className="mb-4">
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">Subjects Covered:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {course.subjects.slice(0, 4).map((subject) => (
                                        <Badge key={subject} variant="secondary" className="text-xs">
                                            {subject}
                                        </Badge>
                                    ))}
                                    {course.subjects.length > 4 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{course.subjects.length - 4} more
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl font-bold text-gray-900">
                                    ₹{course.price.toLocaleString()}
                                </span>
                                {course.originalPrice && (
                                    <span className="text-lg text-gray-500 line-through">
                                        ₹{course.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="p-6 pt-0 space-y-3">
                            <AddToCartButton
                                item={{
                                    id: course.id,
                                    type: 'course',
                                    title: course.title,
                                    price: course.price,
                                    thumbnail: course.thumbnail,
                                    description: course.description,
                                }}
                                className="w-full"
                            />

                            <Button variant="outline" className="w-full" size="sm">
                                View Details
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No courses found
                    </h3>
                    <p className="text-gray-600">
                        Try adjusting your filters or check back later for new courses.
                    </p>
                </div>
            )}
        </div>
    );
}
