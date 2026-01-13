import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import BooksGrid from '@/components/features/BooksGrid';
import { BookOpen, ShoppingCart } from 'lucide-react';
import connectDB from '@/lib/db/mongodb';
import Book from '@/models/Book';

export const metadata: Metadata = {
    title: 'Books - Career Path Institute',
    description: 'Browse and purchase comprehensive study books for Patwari exam preparation.',
};

async function getBooks() {
    try {
        await connectDB();
        const books = await Book.find({ isActive: true })
            .select('title description price originalPrice thumbnail author pages language subjects features createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return books.map(book => ({
            id: book._id.toString(),
            title: book.title,
            description: book.description,
            price: book.price,
            originalPrice: book.originalPrice,
            thumbnail: book.thumbnail,
            author: book.author,
            pages: book.pages,
            language: book.language,
            subjects: book.subjects || [],
            features: book.features || []
        }));
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

export default async function BooksPage() {
    const session = await getServerSession(authOptions);
    const books = await getBooks();

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
                {books.length > 0 ? (
                    <BooksGrid books={books} isAuthenticated={!!session} />
                ) : (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No books available
                        </h3>
                        <p className="text-gray-600">
                            Check back later for new books.
                        </p>
                    </div>
                )}
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
