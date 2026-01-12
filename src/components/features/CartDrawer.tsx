'use client';

import { useState } from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout?: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
    const { cart, removeItem, clearCart, totalAmount, itemCount } = useCart();
    const [isClearing, setIsClearing] = useState(false);

    const handleClearCart = async () => {
        setIsClearing(true);
        try {
            clearCart();
            await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
            setIsClearing(false);
        }
    };

    const handleCheckout = () => {
        if (onCheckout) {
            onCheckout();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-xl">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-4 sm:p-6">
                        <h2 className="text-lg font-semibold">Shopping Cart</h2>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {cart.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 mb-2">Your cart is empty</p>
                                <p className="text-sm text-gray-400">Add some items to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="flex items-center space-x-3 border-b pb-3">
                                        {item.thumbnail && (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="h-12 w-12 rounded object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium truncate">{item.title}</h3>
                                            <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                                            <p className="text-sm font-semibold">₹{item.price.toFixed(2)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(item.id, item.type)}
                                            className="flex-shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.items.length > 0 && (
                        <div className="border-t p-4 sm:p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearCart}
                                    disabled={isClearing}
                                >
                                    {isClearing ? 'Clearing...' : 'Clear Cart'}
                                </Button>
                            </div>

                            <div className="flex justify-between items-center text-lg font-semibold">
                                <span>Total:</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleCheckout}
                                disabled={cart.items.length === 0}
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
