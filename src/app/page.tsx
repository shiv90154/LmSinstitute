import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, FileText, Users, Award, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-12 sm:space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-6 sm:space-y-8 py-12 sm:py-16">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 rounded-full p-4">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Welcome to{' '}
              <span className="text-blue-600">Career Path Institute</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Your comprehensive learning management system for competitive exam preparation.
              Master the Patwari exam with expert guidance and proven strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link href="/courses">
                <Button size="lg" className="px-8 py-3 text-lg w-full sm:w-auto">
                  Explore Courses
                </Button>
              </Link>
              <Link href="/books">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg w-full sm:w-auto">
                  Browse Books
                </Button>
              </Link>
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/courses" className="group">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">
                  Online Courses
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Structured learning paths with HD video content, study materials, and expert guidance
                </p>
                <p className="text-sm text-blue-600 text-center font-medium">
                  Access comprehensive courses designed for competitive exam success →
                </p>
              </div>
            </Link>

            <Link href="/mock-tests" className="group">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-green-200">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">
                  Mock Tests
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Practice with timed tests, performance analytics, and detailed solutions
                </p>
                <p className="text-sm text-green-600 text-center font-medium">
                  Simulate real exam conditions with our advanced testing system →
                </p>
              </div>
            </Link>

            <Link href="/books" className="group md:col-span-2 lg:col-span-1">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-purple-200">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">
                  Study Materials
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Expert-authored books, PDFs, and current affairs content
                </p>
                <p className="text-sm text-purple-600 text-center font-medium">
                  Comprehensive study resources to supplement your learning →
                </p>
              </div>
            </Link>
          </section>

          {/* Stats Section */}
          <section className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Career Path Institute?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of successful students who have achieved their career goals with our proven methodology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">5000+</div>
                <div className="text-gray-600 font-medium">Students Enrolled</div>
                <p className="text-sm text-gray-500 mt-2">
                  Growing community of dedicated learners
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Award className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
                <p className="text-sm text-gray-500 mt-2">
                  Proven track record of student success
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Hours of Content</div>
                <p className="text-sm text-gray-500 mt-2">
                  Comprehensive curriculum coverage
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join Career Path Institute today and take the first step towards achieving your career goals in government service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg w-full sm:w-auto">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/mock-tests">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                  Take a Practice Test
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
