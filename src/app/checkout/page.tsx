'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, ShoppingBag, AlertCircle } from 'lucide-react';

interface CheckoutFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
}

interface CartItem {
    id: string;
    type: 'course' | 'book' | 'material' | 'test';
    title: string;
    price: number;
}

interface Cart {
    items: CartItem[];
    totalAmount: number;
}

export default function CheckoutPage() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [formData, setFormData] = useState<CheckoutFormData>({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        fetchCartData();
    }, []);

    const fetchCartData = async () => {
        try {
            // Get cart from localStorage or session
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                setCart(JSON.parse(cartData));
            } else {
                setCart({ items: [], totalAmount: 0 });
            }
        } catch (err) {
            setError('Failed to load cart data');
        } finally {
            setIsValidating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePayment = async () => {
        if (!formData.name || !formData.email || !formData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        setError('Payment functionality will be implemented soon');
    };

    if (isValidating || !cart) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardContent className="text-center py-12">
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                            <p className="text-gray-600 mb-6">Add some courses or study materials to proceed with checkout</p>
                            <Button>
                                Browse Courses
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                <p className="text-gray-600">Complete your purchase</p>
            </div>

            {error && (
                <Alert className="mb-6" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Billing Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Billing Information</CardTitle>
                        <CardDescription>
                            Please provide your billing details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your address (optional)"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <CardDescription>
                            Review your items before payment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {cart.items.map((item: CartItem) => (
                                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.title}</h4>
                                        <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                                    </div>
                                    <span className="font-medium">₹{item.price.toFixed(2)}</span>
                                </div>
                            ))}

                            <Separator />

                            <div className="flex items-center justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>₹{cart.totalAmount.toFixed(2)}</span>
                            </div>

                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full"
                                size="lg"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Pay ₹{cart.totalAmount.toFixed(2)}
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-gray-500 text-center">
                                Secure payment powered by Razorpay
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}