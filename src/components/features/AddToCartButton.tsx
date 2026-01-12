'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CartItem } from '@/lib/hooks/useCart';

interface AddToCartButtonProps {
    item: CartItem;
    className?: string;
    variant?: 'default' | 'outline' | 'secondary';
    size?: 'sm' | 'default' | 'lg';
}

export function AddToCartButton({
    item,
    className,
    variant = 'default',
    size = 'default'
}: AddToCartButtonProps) {
    const { addItem, isInCart, isLoading } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const inCart = isInCart(item.id, item.type);

    const handleAddToCart = async () => {
        if (inCart || isAdding) return;

        setIsAdding(true);
        try {
            addItem(item);
            // Brief delay to show feedback
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    if (inCart) {
        return (
            <Button
                variant="outline"
                size={size}
                className={className}
                disabled
            >
                <Check className="h-4 w-4 mr-2" />
                In Cart
            </Button>
        );
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleAddToCart}
            disabled={isLoading || isAdding}
            className={className}
        >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
    );
}

export default AddToCartButton;
