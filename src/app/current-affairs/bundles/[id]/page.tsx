'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Package, IndianRupee, FileText, ShoppingCart, Eye } from 'lucide-react';
import Link from 'next/link';

interface CurrentAffairs {
    _id: string;
    title: string;
    summary: string;
    category: string;
    date: string;
    viewCount: number;
    imageUrl?: string;
}

interface CurrentAffairsBundle {
    _id: string;
    title: string;
    description: string;
    type: 'monthly' | 'yearly';
    month?: number;
    year: number;
    price: number;
    currentAffairsIds: CurrentAffairs[];
    isActive: boolean;
    purchaseCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function BundleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [bundle, setBundle] = useState<CurrentAffairsBundle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const fetchBundle = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/current-affairs/bundles/${params.id}`);
                const data = await response.json();

                if (data.success) {
                    setBundle(data.data);
                } else {
                    setError(data.error || 'Failed to fetch bundle');
                }
            } catch (error) {
                console.error('Error fetching bundle:', error);
                setError('Failed to fetch bundle');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchBundle();
        }
    }, [params.id]);

    const handlePurchase = async () => {
        if (!bundle) return;

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
                        itemId: bundle._id,
                        price: bundle.price,
                        title: bundle.title || getBundleTitle(bundle)
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getBundleTitle = (bundle: CurrentAffairsBundle) => {
        if (bundle.type === 'monthly' && bundle.month) {
            return `${months[bundle.month - 1]} ${bundle.year} Current Affairs`;
        }
        return `${bundle.year} Current Affairs`;
    };

    const groupByCategory = (items: CurrentAffairs[]) => {
        return items.reduce((groups, item) => {
            const category = item.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {} as Record<string, CurrentAffairs[]>);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
                    <div className="h-64 bg-muted rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                        <div className="h-4 bg-muted rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !bundle) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Bundle Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        {error || 'The current affairs bundle you are looking for does not exist.'}
                    </p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const groupedItems = groupByCategory(bundle.currentAffairsIds);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Navigation */}
            <div className="mb-6">
                <Link href="/current-affairs/bundles">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Bundles
                    </Button>
                </Link>
            </div>

            {/* Bundle Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge variant={bundle.type === 'monthly' ? 'default' : 'secondary'} className="text-sm">
                            {bundle.type === 'monthly' ? 'Monthly Bundle' : 'Yearly Bundle'}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Package className="h-4 w-4 mr-1" />
                            {bundle.currentAffairsIds.length} articles
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        {bundle.title || getBundleTitle(bundle)}
                    </h1>

                    <div className="flex items-center text-muted-foreground mb-6">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                            {bundle.type === 'monthly' && bundle.month
                                ? `${months[bundle.month - 1]} ${bundle.year}`
                                : `Year ${bundle.year}`
                            }
                        </span>
                        <span className="mx-2">•</span>
                        <span>{bundle.purchaseCount} students enrolled</span>
                    </div>

                    <p className="text-lg text-muted-foreground mb-6">
                        {bundle.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{bundle.currentAffairsIds.length}</div>
                            <div className="text-sm text-muted-foreground">Articles</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{Object.keys(groupedItems).length}</div>
                            <div className="text-sm text-muted-foreground">Categories</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">₹{(bundle.price / bundle.currentAffairsIds.length).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Per Article</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{bundle.purchaseCount}</div>
                            <div className="text-sm text-muted-foreground">Purchased</div>
                        </div>
                    </div>
                </div>

                {/* Purchase Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Purchase Bundle</span>
                                <div className="flex items-center font-bold text-2xl">
                                    <IndianRupee className="h-6 w-6" />
                                    {bundle.price}
                                </div>
                            </CardTitle>
                            <CardDescription>
                                One-time payment for lifetime access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Articles included:</span>
                                    <span>{bundle.currentAffairsIds.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Price per article:</span>
                                    <span>₹{(bundle.price / bundle.currentAffairsIds.length).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Total:</span>
                                    <span>{formatPrice(bundle.price)}</span>
                                </div>
                            </div>

                            <Button className="w-full" onClick={handlePurchase}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Buy Now for {formatPrice(bundle.price)}
                            </Button>

                            <div className="text-xs text-center text-muted-foreground">
                                Secure payment powered by Razorpay
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bundle Contents */}
            <div className="space-y-8">
                <h2 className="text-2xl font-bold">What's Included</h2>

                {Object.entries(groupedItems).map(([category, items]) => (
                    <Card key={category}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{category}</span>
                                <Badge variant="outline">{items.length} articles</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map((item) => (
                                    <div key={item._id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium line-clamp-2 mb-1">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                {item.summary}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{formatDate(item.date)}</span>
                                                <div className="flex items-center">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    {item.viewCount}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-16 bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">How long do I have access to the content?</h3>
                        <p className="text-muted-foreground">
                            Once purchased, you have lifetime access to all articles in this bundle.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Can I download the articles?</h3>
                        <p className="text-muted-foreground">
                            Articles can be viewed online anytime. Offline reading features may be available in the future.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
                        <p className="text-muted-foreground">
                            We offer a 7-day money-back guarantee if you're not satisfied with the content quality.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}