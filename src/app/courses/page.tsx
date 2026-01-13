import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import CoursesGrid from '@/components/features/CoursesGrid';
import { GraduationCap, Play, Users, Clock } from 'lucide-react';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';

export const metadata: Metadata = {
    title: 'Courses - Career Path Institute',
    description: 'Comprehensive online courses for Patwari exam preparation with video lectures, study materials, and practice tests.',
};

async function getCourses() {
    try {
        await connectDB();
        const courses = await Course.find({ isActive: true })
            .select('title description price thumbnail sections createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return courses.map(course => ({
            id: course._id.toString(),
            title: course.title,
            description: course.description,
            price: course.price,
            thumbnail: course.thumbnail,
            instructor: 'Career Path Institute',
            duration: `${Math.ceil(course.sections?.length * 2 || 1)} months`,
            lectures: course.sections?.reduce((total: number, section: any) => total + (section.videos?.length || 0), 0) || 0,
            students: Math.floor(Math.random() * 1000) + 100, // Will be replaced with actual enrollment data
            rating: 4.5 + Math.random() * 0.5, // Will be replaced with actual ratings
            level: 'All Levels',
            language: 'Hindi & English',
            subjects: course.sections?.map((section: any) => section.title) || [],
            features: [
                'HD Video Lectures',
                'Downloadable Study Materials',
                'Practice Tests',
                'Mobile Access',
                'Lifetime Access'
            ],
            sections: course.sections?.map((section: any) => ({
                id: section._id.toString(),
                title: section.title,
                lectures: section.videos?.length || 0,
                duration: `${(section.videos?.length || 0) * 0.5} hours`,
                topics: section.videos?.map((video: any) => video.title) || []
            })) || []
        }));
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

export default async function CoursesPage() {
    const session = await getServerSession(authOptions);
    const courses = await getCourses();

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
                {courses.length > 0 ? (
                    <CoursesGrid courses={courses} isAuthenticated={!!session} />
                ) : (
                    <div className="text-center py-12">
                        <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No courses available
                        </h3>
                        <p className="text-gray-600">
                            Check back later for new courses.
                        </p>
                    </div>
                )}
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
