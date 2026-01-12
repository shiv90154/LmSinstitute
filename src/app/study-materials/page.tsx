'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, FileText, Calendar, IndianRupee } from 'lucide-react';
import Link from 'next/link';

interface StudyMaterial {
    _id: string;
    title: string;
    description: string;
    type: 'previous-year-paper' | 'study-bundle' | 'notes' | 'reference-material';
    category: string;
    subject?: string;
    year?: number;
    price: number;
    fileType: 'pdf' | 'document' | 'zip';
    fileSize: number;
    thumbnail?: string;
    tags: string[];
    downloadCount: number;
}

interface FilterOptions {
    types: string[];
    categories: string[];
    subjects: string[];
    years: number[];
}

export default function StudyMaterialsPage() {
    const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        types: [],
        categories: [],
        subjects: [],
        years: [],
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const typeLabels = {
        'previous-year-paper': 'Previous Year Paper',
        'study-bundle': 'Study Bundle',
        'notes': 'Notes',
        'reference-material': 'Reference Material',
    };

    const fetchStudyMaterials = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '12',
            });

            if (searchTerm) params.append('search', searchTerm);
            if (selectedType) params.append('type', selectedType);
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedSubject) params.append('subject', selectedSubject);
            if (selectedYear) params.append('year', selectedYear);

            const response = await fetch(`/api/study-materials?${params}`);
            const data = await response.json();

            if (data.success) {
                setStudyMaterials(data.data.materials);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching study materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            // This would be a separate API endpoint for filter options
            // For now, we'll extract from the current data
            const response = await fetch('/api/study-materials?limit=1000');
            const data = await response.json();

            if (data.success) {
                const materials = data.data.materials;
                const types = Array.from(new Set(materials.map((item: StudyMaterial) => item.type))) as string[];
                const categories = Array.from(new Set(materials.map((item: StudyMaterial) => item.category))) as string[];
                const subjects = Array.from(new Set(materials.map((item: StudyMaterial) => item.subject).filter(Boolean))) as string[];
                const years = (Array.from(new Set(materials.map((item: StudyMaterial) => item.year).filter(Boolean))) as number[]).sort((a, b) => b - a);

                setFilterOptions({
                    types: types.sort(),
                    categories: categories.sort(),
                    subjects: subjects.sort(),
                    years,
                });
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    useEffect(() => {
        fetchStudyMaterials();
    }, [currentPage, searchTerm, selectedType, selectedCategory, selectedSubject, selectedYear]);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchStudyMaterials();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedCategory('');
        setSelectedSubject('');
        setSelectedYear('');
        setCurrentPage(1);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(price);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Study Materials</h1>
                <p className="text-muted-foreground">
                    Access previous year papers, study bundles, notes, and reference materials for your exam preparation.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search study materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <div className="flex flex-wrap gap-4">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            {filterOptions.types.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {typeLabels[type as keyof typeof typeLabels]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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

                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Subjects</SelectItem>
                            {filterOptions.subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                    {subject}
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

                    <Button variant="outline" onClick={clearFilters}>
                        <Filter className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Study Materials Grid */}
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
            ) : studyMaterials.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studyMaterials.map((material) => (
                            <Card key={material._id} className="h-full hover:shadow-lg transition-shadow">
                                {material.thumbnail && (
                                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                        <img
                                            src={material.thumbnail}
                                            alt={material.title}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary">
                                            {typeLabels[material.type]}
                                        </Badge>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Download className="h-3 w-3 mr-1" />
                                            {material.downloadCount}
                                        </div>
                                    </div>
                                    <CardTitle className="line-clamp-2">{material.title}</CardTitle>
                                    <CardDescription className="flex items-center justify-between">
                                        <span>{material.category}</span>
                                        {material.year && (
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {material.year}
                                            </div>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {material.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4 mr-1" />
                                            {material.fileType.toUpperCase()} • {formatFileSize(material.fileSize)}
                                        </div>
                                        <div className="flex items-center font-semibold text-lg">
                                            <IndianRupee className="h-4 w-4" />
                                            {material.price}
                                        </div>
                                    </div>

                                    {material.subject && (
                                        <div className="mb-3">
                                            <Badge variant="outline" className="text-xs">
                                                {material.subject}
                                            </Badge>
                                        </div>
                                    )}

                                    {material.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {material.tags.slice(0, 3).map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {material.tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{material.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <Button className="w-full">
                                        {material.price > 0 ? `Buy for ${formatPrice(material.price)}` : 'Download Free'}
                                    </Button>
                                </CardContent>
                            </Card>
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
                    <p className="text-muted-foreground">No study materials found matching your criteria.</p>
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
