'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, IndianRupee, FileText, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface CurrentAffairsBundle {
    _id: string;
    title: string;
    description: string;
    type: 'monthly' | 'yearly';
    month?: number;
    year: number;
    price: number;
    currentAffairsIds: any[];
    isActive: boolean;
    purchaseCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function CurrentAffairsBundlesPage() {
    const [bundles, setBundles] = useState<CurrentAffairsBundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const fetchBundles = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '12',
            });

            if (selectedType) params.append('type', selectedType);
            if (selectedYear) params.append('year', selectedYear);

            const response = await fetch(`/api/current-affairs/bundles?${params}`);
            const data = await response.json();

            if (data.success) {
                setBundles(data.data.bundles);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching bundles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBundles();
    }, [currentPage, selectedType, selectedYear]);

    const handlePurchase = async (bundleId: string, price: number) => {
        try {
            // Create order for the bundle
            const orderResponse = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [{
                        type: 'current-affairs-bundle',
                        itemId: bundleId,
                        price: price,
                        title: bundles.find(b => b._id === bundleId)?.title || 'Current Affairs Bundle'
                    }]
                }),
            });

            const orderData = await orderResponse.json();

            if (orderData.success) {
                // Redirect to payment or handle Razorpay integration
                window.location.href = `/payment?orderId=${orderData.data.razorpayOrderId}`;
            } else {
                alert(orderData.error || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(price);
    };

    const getBundleTitle = (bundle: CurrentAffairsBundle) => {
        if (bundle.type === 'monthly' && bundle.month) {
            return `${months[bundle.month - 1]} ${bundle.year}`;
        }
        return `Year ${bundle.year}`;
    };

    const clearFilters = () => {
        setSelectedType('');
        setSelectedYear('');
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Current Affairs Bundles</h1>
                <p className="text-muted-foreground">
                    Get comprehensive current affairs packages organized by month and year for systematic preparation.
                </p>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-wrap gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Bundle Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Years</SelectItem>
                        {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                </Button>
            </div>

            {/* Bundles Grid */}
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
            ) : bundles.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bundles.map((bundle) => (
                            <Card key={bundle._id} className="h-full hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant={bundle.type === 'monthly' ? 'default' : 'secondary'}>
                                            {bundle.type === 'monthly' ? 'Monthly' : 'Yearly'}
                                        </Badge>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Package className="h-3 w-3 mr-1" />
                                            {bundle.currentAffairsIds.length} items
                                        </div>
                                    </div>
                                    <CardTitle className="line-clamp-2">
                                        {bundle.title || `Current Affairs - ${getBundleTitle(bundle)}`}
                                    </CardTitle>
                                    <CardDescription className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {getBundleTitle(bundle)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {bundle.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4 mr-1" />
                                            {bundle.currentAffairsIds.length} articles included
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {bundle.purchaseCount} purchased
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center font-semibold text-2xl">
                                            <IndianRupee className="h-5 w-5" />
                                            {bundle.price}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ₹{(bundle.price / bundle.currentAffairsIds.length).toFixed(2)} per article
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            onClick={() => handlePurchase(bundle._id, bundle.price)}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Buy for {formatPrice(bundle.price)}
                                        </Button>

                                        <Link href={`/current-affairs/bundles/${bundle._id}`}>
                                            <Button variant="outline" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
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
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bundles found</h3>
                    <p className="text-muted-foreground mb-4">
                        No current affairs bundles match your selected criteria.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            )}

            {/* Benefits Section */}
            <div className="mt-16 bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Our Current Affairs Bundles?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Comprehensive Coverage</h3>
                        <p className="text-sm text-muted-foreground">
                            Complete coverage of all important current affairs topics organized by time periods.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Time-Organized</h3>
                        <p className="text-sm text-muted-foreground">
                            Monthly and yearly packages help you study systematically and stay updated.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <IndianRupee className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Cost Effective</h3>
                        <p className="text-sm text-muted-foreground">
                            Bundle pricing offers significant savings compared to individual article purchases.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
