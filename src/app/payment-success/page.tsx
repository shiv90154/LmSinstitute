'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, BookOpen, FileText, Loader2 } from 'lucide-react';

interface OrderDetails {
    _id: string;
    totalAmount: number;
    status: string;
    items: Array<{
        title: string;
        type: string;
        price: number;
        itemId: string;
    }>;
    createdAt: string;
    razorpayPaymentId: string;
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [orderDetails] = useState<OrderDetails>({
        _id: 'sample-order-id',
        totalAmount: 999,
        status: 'completed',
        items: [
            {
                title: 'Sample Course',
                type: 'course',
                price: 999,
                itemId: 'sample-course-id'
            }
        ],
        createdAt: new Date().toISOString(),
        razorpayPaymentId: 'sample-payment-id'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            // Simulate redirect
            console.log('No order ID provided');
        }
        setLoading(false);
    }, [orderId]);

    const handleDownloadInvoice = async () => {
        console.log('Download invoice functionality will be implemented');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !orderDetails) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardContent className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
                        <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
                        <Button>
                            Go Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600">
                    Thank you for your purchase. Your content has been unlocked.
                </p>
            </div>

            {/* Order Details */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>
                        Order #{orderDetails._id}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Payment Status</span>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                {orderDetails.status}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-semibold">₹{orderDetails.totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Payment ID</span>
                            <span className="font-mono text-sm">{orderDetails.razorpayPaymentId}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Date</span>
                            <span>{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Purchased Items */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Purchased Items</CardTitle>
                    <CardDescription>
                        Your new content is now available
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {orderDetails.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        {item.type === 'course' ? (
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{item.title}</h4>
                                        <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium">₹{item.price.toFixed(2)}</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="ml-3"
                                    >
                                        Access
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    onClick={handleDownloadInvoice}
                    variant="outline"
                    className="flex items-center space-x-2"
                >
                    <Download className="h-4 w-4" />
                    <span>Download Invoice</span>
                </Button>

                <Button
                    className="flex items-center space-x-2"
                >
                    <BookOpen className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Access your purchased content from your dashboard</li>
                    <li>• Download study materials and start learning</li>
                    <li>• Track your progress as you complete courses</li>
                    <li>• Contact support if you need any assistance</li>
                </ul>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            }>
                <PaymentSuccessContent />
            </Suspense>
        </div>
    );
}