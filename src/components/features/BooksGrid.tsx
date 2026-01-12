'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from '@/components/features/AddToCartButton';
import { BookOpen, Users, FileText, Star } from 'lucide-react';

interface Book {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    author: string;
    pages: number;
    language: string;
    subjects: string[];
    features: string[];
}

interface BooksGridProps {
    books: Book[];
    isAuthenticated: boolean;
}

export default function BooksGrid({ books, isAuthenticated }: BooksGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', name: 'All Books' },
        { id: 'complete', name: 'Complete Guides' },
        { id: 'subject', name: 'Subject-wise' },
        { id: 'practice', name: 'Practice Books' },
    ];

    const filteredBooks = selectedCategory === 'all'
        ? books
        : books.filter(book => {
            switch (selectedCategory) {
                case 'complete':
                    return book.title.toLowerCase().includes('complete') || book.title.toLowerCase().includes('guide');
                case 'subject':
                    return book.subjects.length <= 2;
                case 'practice':
                    return book.features.some(feature => feature.toLowerCase().includes('practice'));
                default:
                    return true;
            }
        });

    return (
        <div className="space-y-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category.id)}
                        className="rounded-full"
                    >
                        {category.name}
                    </Button>
                ))}
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                    <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="p-0">
                            <div className="relative">
                                <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-indigo-200 rounded-t-lg flex items-center justify-center">
                                    <BookOpen className="h-16 w-16 text-blue-600" />
                                </div>
                                {book.originalPrice && (
                                    <Badge className="absolute top-2 right-2 bg-red-500">
                                        {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% OFF
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-4">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                {book.title}
                            </h3>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {book.description}
                            </p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{book.author}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-500">
                                    <FileText className="h-4 w-4 mr-1" />
                                    <span>{book.pages} pages • {book.language}</span>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                {book.subjects.slice(0, 3).map((subject) => (
                                    <Badge key={subject} variant="secondary" className="text-xs">
                                        {subject}
                                    </Badge>
                                ))}
                                {book.subjects.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{book.subjects.length - 3} more
                                    </Badge>
                                )}
                            </div>

                            {/* Features */}
                            <div className="space-y-1 mb-4">
                                {book.features.slice(0, 2).map((feature) => (
                                    <div key={feature} className="flex items-center text-xs text-gray-600">
                                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl font-bold text-gray-900">
                                    ₹{book.price}
                                </span>
                                {book.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ₹{book.originalPrice}
                                    </span>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                            <AddToCartButton
                                item={{
                                    id: book.id,
                                    type: 'book',
                                    title: book.title,
                                    price: book.price,
                                    thumbnail: book.thumbnail,
                                    description: book.description,
                                }}
                                className="w-full"
                            />
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No books found
                    </h3>
                    <p className="text-gray-600">
                        Try selecting a different category or check back later for new books.
                    </p>
                </div>
            )}
        </div>
    );
}
