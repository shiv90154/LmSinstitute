import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import MockTestsGrid from '@/components/features/MockTestsGrid';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Trophy, Target } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mock Tests - Career Path Institute',
    description: 'Practice with realistic mock tests for Patwari exam. Timed tests with instant results and performance analysis.',
};

// Mock tests data - in real app, this would come from database
const mockTests: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    duration: number;
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
}> = [
        {
            id: '1',
            title: 'Patwari Full Mock Test - 1',
            description: 'Complete mock test covering all subjects as per latest exam pattern with 100 questions.',
            price: 199,
            originalPrice: 299,
            duration: 120, // minutes
            questions: 100,
            maxMarks: 100,
            subjects: [
                { name: 'General Studies', questions: 25 },
                { name: 'Himachal GK', questions: 25 },
                { name: 'Mathematics', questions: 20 },
                { name: 'Reasoning', questions: 15 },
                { name: 'English', questions: 10 },
                { name: 'Hindi', questions: 5 }
            ],
            difficulty: 'Medium',
            attempts: 1250,
            averageScore: 68,
            features: [
                'Latest Exam Pattern',
                'Detailed Solutions',
                'Performance Analysis',
                'All India Ranking',
                'Subject-wise Breakdown',
                'Time Management Tips'
            ],
            instructions: [
                'Total duration: 2 hours (120 minutes)',
                'Each question carries 1 mark',
                'No negative marking',
                'Questions will be shuffled for each attempt',
                'Auto-submit when time expires'
            ]
        },
        {
            id: '2',
            title: 'Himachal GK Sectional Test',
            description: 'Focused test on Himachal Pradesh General Knowledge with 50 questions covering all important topics.',
            price: 99,
            originalPrice: 149,
            duration: 60,
            questions: 50,
            maxMarks: 50,
            subjects: [
                { name: 'HP History', questions: 15 },
                { name: 'HP Geography', questions: 15 },
                { name: 'HP Culture', questions: 10 },
                { name: 'HP Government', questions: 10 }
            ],
            difficulty: 'Medium',
            attempts: 850,
            averageScore: 72,
            features: [
                'HP Specific Content',
                'Latest Updates',
                'Detailed Explanations',
                'Quick Revision Notes'
            ]
        },
        {
            id: '3',
            title: 'Mathematics & Reasoning Test',
            description: 'Comprehensive test for Mathematics and Reasoning sections with shortcuts and time-saving techniques.',
            price: 149,
            originalPrice: 199,
            duration: 90,
            questions: 60,
            maxMarks: 60,
            subjects: [
                { name: 'Arithmetic', questions: 20 },
                { name: 'Algebra', questions: 10 },
                { name: 'Geometry', questions: 10 },
                { name: 'Logical Reasoning', questions: 15 },
                { name: 'Analytical Reasoning', questions: 5 }
            ],
            difficulty: 'Hard',
            attempts: 650,
            averageScore: 58,
            features: [
                'Shortcut Methods',
                'Step-by-step Solutions',
                'Time Management Focus',
                'Difficulty Level Analysis'
            ]
        },
        {
            id: '4',
            title: 'General Studies Mock Test',
            description: 'Comprehensive General Studies test covering History, Geography, Polity, Economics, and Science.',
            price: 129,
            originalPrice: 179,
            duration: 75,
            questions: 50,
            maxMarks: 50,
            subjects: [
                { name: 'History', questions: 12 },
                { name: 'Geography', questions: 12 },
                { name: 'Polity', questions: 10 },
                { name: 'Economics', questions: 8 },
                { name: 'Science', questions: 8 }
            ],
            difficulty: 'Medium',
            attempts: 750,
            averageScore: 65,
            features: [
                'NCERT Based Questions',
                'Current Affairs Integration',
                'Conceptual Clarity Focus',
                'Previous Year Analysis'
            ]
        },
        {
            id: '5',
            title: 'Previous Year Paper 2023',
            description: 'Actual previous year question paper with authentic questions and marking scheme.',
            price: 79,
            originalPrice: 99,
            duration: 120,
            questions: 100,
            maxMarks: 100,
            subjects: [
                { name: 'All Subjects', questions: 100 }
            ],
            difficulty: 'Medium',
            attempts: 950,
            averageScore: 71,
            features: [
                'Authentic Questions',
                'Official Marking Scheme',
                'Trend Analysis',
                'Expected Cutoff'
            ]
        },
        {
            id: '6',
            title: 'Speed Test - Quick Practice',
            description: 'Quick 30-minute test with 30 questions for rapid practice and time management.',
            price: 49,
            originalPrice: 79,
            duration: 30,
            questions: 30,
            maxMarks: 30,
            subjects: [
                { name: 'Mixed Topics', questions: 30 }
            ],
            difficulty: 'Easy',
            attempts: 1150,
            averageScore: 78,
            features: [
                'Quick Practice',
                'Time Pressure Training',
                'Instant Results',
                'Speed Analysis'
            ]
        }
    ];

export default async function MockTestsPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <FileText className="h-12 w-12 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Mock Tests
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Practice with realistic mock tests designed to simulate the actual Patwari exam.
                            Get instant results, detailed analysis, and improve your performance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mock Tests Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <MockTestsGrid tests={mockTests} isAuthenticated={!!session} />
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Practice with Our Mock Tests?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Comprehensive testing experience designed for success
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Clock className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Timed Practice
                            </h3>
                            <p className="text-gray-600">
                                Real exam conditions with automatic time management and submission
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Instant Results
                            </h3>
                            <p className="text-gray-600">
                                Get immediate feedback with detailed performance analysis
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Trophy className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                All India Ranking
                            </h3>
                            <p className="text-gray-600">
                                Compare your performance with thousands of other aspirants
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <FileText className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Latest Pattern
                            </h3>
                            <p className="text-gray-600">
                                Tests designed as per the latest exam pattern and syllabus
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
