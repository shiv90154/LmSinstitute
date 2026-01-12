'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, Clock, Eye } from 'lucide-react';
import Link from 'next/link';

interface CurrentAffairs {
    _id: string;
    title: string;
    summary: string;
    category: string;
    tags: string[];
    date: string;
    month: number;
    year: number;
    imageUrl?: string;
    viewCount: number;
}

interface FilterOptions {
    categories: string[];
    years: number[];
    tags: string[];
}

export default function CurrentAffairsPage() {
    const [currentAffairs, setCurrentAffairs] = useState<CurrentAffairs[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        categories: [],
        years: [],
        tags: [],
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const fetchCurrentAffairs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '12',
            });

            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedYear) params.append('year', selectedYear);
            if (selectedMonth) params.append('month', selectedMonth);

            const response = await fetch(`/api/current-affairs?${params}`);
            const data = await response.json();

            if (data.success) {
                setCurrentAffairs(data.data.currentAffairs);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching current affairs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            // This would be a separate API endpoint for filter options
            // For now, we'll extract from the current data
            const response = await fetch('/api/current-affairs?limit=1000');
            const data = await response.json();

            if (data.success) {
                const affairs = data.data.currentAffairs;
                const categories = Array.from(new Set(affairs.map((item: CurrentAffairs) => item.category))) as string[];
                const years = (Array.from(new Set(affairs.map((item: CurrentAffairs) => item.year))) as number[]).sort((a, b) => b - a);
                const tags = Array.from(new Set(affairs.flatMap((item: CurrentAffairs) => item.tags))) as string[];

                setFilterOptions({
                    categories: categories.sort(),
                    years,
                    tags: tags.sort(),
                });
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    useEffect(() => {
        fetchCurrentAffairs();
    }, [currentPage, searchTerm, selectedCategory, selectedYear, selectedMonth]);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCurrentAffairs();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedYear('');
        setSelectedMonth('');
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Current Affairs</h1>
                <p className="text-muted-foreground">
                    Stay updated with the latest current affairs and news relevant to your exam preparation.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search current affairs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <div className="flex flex-wrap gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {filterOptions.categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Years</SelectItem>
                            {filterOptions.years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Months</SelectItem>
                            {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={clearFilters}>
                        <Filter className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Current Affairs Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-3 bg-muted rounded"></div>
                                    <div className="h-3 bg-muted rounded w-5/6"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : currentAffairs.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentAffairs.map((item) => (
                            <Link key={item._id} href={`/current-affairs/${item._id}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    {item.imageUrl && (
                                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="secondary">{item.category}</Badge>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Eye className="h-3 w-3 mr-1" />
                                                {item.viewCount}
                                            </div>
                                        </div>
                                        <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                                        <CardDescription className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {formatDate(item.date)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {item.summary}
                                        </p>
                                        {item.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {item.tags.slice(0, 3).map((tag) => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {item.tags.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{item.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No current affairs found matching your criteria.</p>
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
