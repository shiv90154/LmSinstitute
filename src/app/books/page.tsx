import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import BooksGrid from '@/components/features/BooksGrid';
import { Button } from '@/components/ui/button';
import { BookOpen, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Books - Career Path Institute',
    description: 'Browse and purchase comprehensive study books for Patwari exam preparation.',
};

// Mock books data - in real app, this would come from database
const books = [
    {
        id: '1',
        title: 'Complete Patwari Exam Guide 2024',
        description: 'Comprehensive guide covering all subjects for Patwari exam with practice questions and mock tests.',
        price: 599,
        originalPrice: 799,
        thumbnail: '/images/books/patwari-guide.jpg',
        author: 'Career Path Institute',
        pages: 850,
        language: 'Hindi & English',
        subjects: ['General Studies', 'Himachal GK', 'Mathematics', 'Reasoning'],
        features: [
            '2000+ Practice Questions',
            'Previous Year Papers',
            'Detailed Solutions',
            'Subject-wise Coverage'
        ]
    },
    {
        id: '2',
        title: 'Himachal Pradesh General Knowledge',
        description: 'Complete coverage of Himachal Pradesh history, geography, culture, and current affairs.',
        price: 399,
        originalPrice: 499,
        thumbnail: '/images/books/hp-gk.jpg',
        author: 'HP Experts Team',
        pages: 650,
        language: 'Hindi',
        subjects: ['Himachal GK', 'History', 'Geography', 'Culture'],
        features: [
            'Latest Updates',
            'Maps & Diagrams',
            'Quick Revision Notes',
            'Practice MCQs'
        ]
    },
    {
        id: '3',
        title: 'Mathematics & Reasoning for Patwari',
        description: 'Focused preparation material for Mathematics and Reasoning sections with shortcuts and tricks.',
        price: 449,
        originalPrice: 599,
        thumbnail: '/images/books/math-reasoning.jpg',
        author: 'Math Experts',
        pages: 550,
        language: 'Hindi & English',
        subjects: ['Mathematics', 'Reasoning', 'Quantitative Aptitude'],
        features: [
            'Shortcut Methods',
            'Step-by-step Solutions',
            'Practice Sets',
            'Time-saving Tricks'
        ]
    },
    {
        id: '4',
        title: 'English & Hindi Language Guide',
        description: 'Complete language preparation covering grammar, vocabulary, and comprehension.',
        price: 349,
        originalPrice: 449,
        thumbnail: '/images/books/language-guide.jpg',
        author: 'Language Experts',
        pages: 450,
        language: 'Hindi & English',
        subjects: ['English', 'Hindi', 'Grammar', 'Vocabulary'],
        features: [
            'Grammar Rules',
            'Vocabulary Building',
            'Comprehension Practice',
            'Translation Exercises'
        ]
    }
];

export default async function BooksPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <BookOpen className="h-12 w-12 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Study Books
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Comprehensive study materials and books designed specifically for Patwari exam preparation.
                            Get expert-authored content with practice questions and detailed explanations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Books Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BooksGrid books={books} isAuthenticated={!!session} />
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose Our Books?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Expert-authored content designed for success
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Expert Authors
                            </h3>
                            <p className="text-gray-600">
                                Written by subject matter experts with years of teaching experience
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Updated Content
                            </h3>
                            <p className="text-gray-600">
                                Latest syllabus coverage with current affairs and recent changes
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Practice Questions
                            </h3>
                            <p className="text-gray-600">
                                Thousands of practice questions with detailed solutions
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Affordable Pricing
                            </h3>
                            <p className="text-gray-600">
                                Quality education at prices that won't break the bank
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
