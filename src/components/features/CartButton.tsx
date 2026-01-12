'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart';

interface CartButtonProps {
    onClick?: () => void;
    className?: string;
}

export function CartButton({ onClick, className }: CartButtonProps) {
    const { itemCount, isLoading } = useCart();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={className}
            disabled={isLoading}
        >
            <ShoppingCart className="h-4 w-4" />
            {!isLoading && itemCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                    {itemCount}
                </span>
            )}
        </Button>
    );
}
