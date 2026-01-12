import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import CoursesGrid from '@/components/features/CoursesGrid';
import { Button } from '@/components/ui/button';
import { GraduationCap, Play, Users, Clock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Courses - Career Path Institute',
    description: 'Comprehensive online courses for Patwari exam preparation with video lectures, study materials, and practice tests.',
};

// Mock courses data - in real app, this would come from database
const courses = [
    {
        id: '1',
        title: 'Complete Patwari Exam Preparation 2024',
        description: 'Comprehensive course covering all subjects with 200+ video lectures, study materials, and mock tests.',
        price: 2999,
        originalPrice: 4999,
        thumbnail: '/images/courses/complete-patwari.jpg',
        instructor: 'Career Path Institute Team',
        duration: '6 months',
        lectures: 250,
        students: 1250,
        rating: 4.8,
        level: 'Beginner to Advanced',
        language: 'Hindi & English',
        subjects: [
            'General Studies',
            'Himachal Pradesh GK',
            'English Language',
            'Hindi Language',
            'Mathematics',
            'Reasoning',
            'Computer Knowledge',
            'Current Affairs'
        ],
        features: [
            '250+ HD Video Lectures',
            'Downloadable Study Materials',
            '50+ Mock Tests',
            'Previous Year Papers',
            'Live Doubt Sessions',
            'Mobile App Access',
            'Certificate of Completion',
            'Lifetime Access'
        ],
        sections: [
            {
                id: '1',
                title: 'General Studies',
                lectures: 45,
                duration: '30 hours',
                topics: ['History', 'Geography', 'Polity', 'Economics', 'Science']
            },
            {
                id: '2',
                title: 'Himachal Pradesh GK',
                lectures: 35,
                duration: '25 hours',
                topics: ['History', 'Geography', 'Culture', 'Government Schemes', 'Current Affairs']
            },
            {
                id: '3',
                title: 'Mathematics',
                lectures: 40,
                duration: '28 hours',
                topics: ['Arithmetic', 'Algebra', 'Geometry', 'Mensuration', 'Statistics']
            },
            {
                id: '4',
                title: 'Reasoning',
                lectures: 30,
                duration: '20 hours',
                topics: ['Logical Reasoning', 'Analytical Reasoning', 'Verbal Reasoning']
            }
        ]
    },
    {
        id: '2',
        title: 'Himachal Pradesh GK Masterclass',
        description: 'Specialized course focusing on Himachal Pradesh General Knowledge with latest updates and current affairs.',
        price: 1499,
        originalPrice: 2499,
        thumbnail: '/images/courses/hp-gk-masterclass.jpg',
        instructor: 'HP GK Experts',
        duration: '3 months',
        lectures: 80,
        students: 850,
        rating: 4.9,
        level: 'All Levels',
        language: 'Hindi',
        subjects: [
            'HP History',
            'HP Geography',
            'HP Culture & Traditions',
            'HP Government & Politics',
            'HP Economy',
            'HP Current Affairs'
        ],
        features: [
            '80+ Detailed Video Lectures',
            'Interactive Maps & Charts',
            'Monthly Current Affairs Updates',
            'Practice MCQs',
            'Quick Revision Notes',
            'Mobile Friendly Content'
        ]
    },
    {
        id: '3',
        title: 'Mathematics & Reasoning Crash Course',
        description: 'Intensive course for Mathematics and Reasoning with shortcuts, tricks, and extensive practice.',
        price: 1299,
        originalPrice: 1999,
        thumbnail: '/images/courses/math-reasoning.jpg',
        instructor: 'Math & Reasoning Experts',
        duration: '2 months',
        lectures: 60,
        students: 650,
        rating: 4.7,
        level: 'Beginner to Intermediate',
        language: 'Hindi & English',
        subjects: [
            'Arithmetic',
            'Algebra',
            'Geometry',
            'Logical Reasoning',
            'Analytical Reasoning',
            'Data Interpretation'
        ],
        features: [
            'Shortcut Methods & Tricks',
            'Step-by-step Solutions',
            'Practice Worksheets',
            'Time Management Tips',
            'Weekly Assessments'
        ]
    },
    {
        id: '4',
        title: 'English & Hindi Language Course',
        description: 'Complete language preparation covering grammar, vocabulary, comprehension, and writing skills.',
        price: 999,
        originalPrice: 1499,
        thumbnail: '/images/courses/language-course.jpg',
        instructor: 'Language Experts',
        duration: '2 months',
        lectures: 50,
        students: 450,
        rating: 4.6,
        level: 'All Levels',
        language: 'Hindi & English',
        subjects: [
            'English Grammar',
            'English Vocabulary',
            'Reading Comprehension',
            'Hindi Grammar',
            'Hindi Literature',
            'Translation Skills'
        ],
        features: [
            'Grammar Rules & Examples',
            'Vocabulary Building Exercises',
            'Comprehension Practice',
            'Writing Skills Development',
            'Translation Practice'
        ]
    }
];

export default async function CoursesPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <GraduationCap className="h-12 w-12 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Online Courses
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Master the Patwari exam with our comprehensive online courses.
                            Expert-designed curriculum with video lectures, study materials, and practice tests.
                        </p>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <CoursesGrid courses={courses} isAuthenticated={!!session} />
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose Our Courses?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Learn from the best with our comprehensive online courses
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Play className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                HD Video Lectures
                            </h3>
                            <p className="text-gray-600">
                                Crystal clear video lectures with expert explanations
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Expert Instructors
                            </h3>
                            <p className="text-gray-600">
                                Learn from experienced teachers and subject matter experts
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Lifetime Access
                            </h3>
                            <p className="text-gray-600">
                                Access your courses anytime, anywhere with lifetime validity
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <GraduationCap className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Complete Curriculum
                            </h3>
                            <p className="text-gray-600">
                                Comprehensive coverage of entire syllabus with practice tests
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
