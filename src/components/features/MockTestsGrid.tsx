'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from '@/components/features/AddToCartButton';
import {
    FileText,
    Clock,
    Users,
    Target,
    Trophy,
    CheckCircle,
    AlertCircle,
    BarChart3
} from 'lucide-react';

interface MockTest {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    duration: number; // minutes
    questions: number;
    maxMarks: number;
    subjects: Array<{
        name: string;
        questions: number;
    }>;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    attempts: number;
    averageScore: number;
    features: string[];
    instructions?: string[];
}

interface MockTestsGridProps {
    tests: MockTest[];
    isAuthenticated: boolean;
}

export default function MockTestsGrid({ tests, isAuthenticated }: MockTestsGridProps) {
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    const difficulties = [
        { id: 'all', name: 'All Levels' },
        { id: 'easy', name: 'Easy' },
        { id: 'medium', name: 'Medium' },
        { id: 'hard', name: 'Hard' },
    ];

    const types = [
        { id: 'all', name: 'All Tests' },
        { id: 'full', name: 'Full Tests' },
        { id: 'sectional', name: 'Sectional' },
        { id: 'previous', name: 'Previous Year' },
        { id: 'speed', name: 'Speed Tests' },
    ];

    const filteredTests = tests.filter(test => {
        const difficultyMatch = selectedDifficulty === 'all' ||
            test.difficulty.toLowerCase() === selectedDifficulty;

        const typeMatch = selectedType === 'all' ||
            (selectedType === 'full' && test.questions >= 80) ||
            (selectedType === 'sectional' && test.subjects.length <= 2) ||
            (selectedType === 'previous' && test.title.toLowerCase().includes('previous')) ||
            (selectedType === 'speed' && test.duration <= 45);

        return difficultyMatch && typeMatch;
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return <CheckCircle className="h-4 w-4" />;
            case 'medium': return <AlertCircle className="h-4 w-4" />;
            case 'hard': return <Target className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-sm font-medium text-gray-700 flex items-center mr-4">
                        Difficulty:
                    </span>
                    {difficulties.map((difficulty) => (
                        <Button
                            key={difficulty.id}
                            variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedDifficulty(difficulty.id)}
                            className="rounded-full"
                        >
                            {difficulty.name}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-sm font-medium text-gray-700 flex items-center mr-4">
                        Type:
                    </span>
                    {types.map((type) => (
                        <Button
                            key={type.id}
                            variant={selectedType === type.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType(type.id)}
                            className="rounded-full"
                        >
                            {type.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                    <Card key={test.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                        {test.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {test.description}
                                    </p>
                                </div>
                                {test.originalPrice && (
                                    <Badge className="bg-red-500 text-white ml-2">
                                        {Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% OFF
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Test Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>{test.duration} min</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <FileText className="h-4 w-4 mr-2 text-green-500" />
                                    <span>{test.questions} questions</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Target className="h-4 w-4 mr-2 text-purple-500" />
                                    <span>{test.maxMarks} marks</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="h-4 w-4 mr-2 text-orange-500" />
                                    <span>{test.attempts} attempts</span>
                                </div>
                            </div>

                            {/* Difficulty Badge */}
                            <div className="flex items-center gap-2">
                                <Badge className={`${getDifficultyColor(test.difficulty)} flex items-center gap-1`}>
                                    {getDifficultyIcon(test.difficulty)}
                                    {test.difficulty}
                                </Badge>
                                <div className="flex items-center text-sm text-gray-600">
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    <span>Avg: {test.averageScore}%</span>
                                </div>
                            </div>

                            {/* Subjects Breakdown */}
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">Subject Distribution:</h4>
                                <div className="space-y-1">
                                    {test.subjects.map((subject) => (
                                        <div key={subject.name} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{subject.name}</span>
                                            <span className="font-medium">{subject.questions} Q</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Features */}
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">Features:</h4>
                                <div className="space-y-1">
                                    {test.features.slice(0, 3).map((feature) => (
                                        <div key={feature} className="flex items-center text-xs text-gray-600">
                                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {test.features.length > 3 && (
                                        <div className="text-xs text-blue-600">
                                            +{test.features.length - 3} more features
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 pt-2 border-t">
                                <span className="text-2xl font-bold text-gray-900">
                                    ₹{test.price}
                                </span>
                                {test.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ₹{test.originalPrice}
                                    </span>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="pt-0 space-y-2">
                            <AddToCartButton
                                item={{
                                    id: test.id,
                                    type: 'test',
                                    title: test.title,
                                    price: test.price,
                                    thumbnail: '',
                                    description: test.description,
                                }}
                                className="w-full"
                            />

                            <Button variant="outline" className="w-full" size="sm">
                                <Trophy className="h-4 w-4 mr-2" />
                                View Leaderboard
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredTests.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No tests found
                    </h3>
                    <p className="text-gray-600">
                        Try adjusting your filters or check back later for new tests.
                    </p>
                </div>
            )}
        </div>
    );
}
