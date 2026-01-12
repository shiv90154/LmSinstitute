'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Cart,
  CartItem,
  getCartFromStorage,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  isItemInCart,
  getCartItemCount,
  getCartTotalAmount,
  validateCartItems,
} from '@/lib/utils/cart';

// Re-export CartItem for use in components
export type { CartItem };

export interface UseCartReturn {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, itemType: string) => void;
  clearCart: () => void;
  isInCart: (itemId: string, itemType: string) => boolean;
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  validateCart: (validationData: Record<string, number>) => {
    isValid: boolean;
    invalidItems: CartItem[];
  };
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart>(() => ({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    updatedAt: new Date(),
  }));
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from storage on mount
  useEffect(() => {
    const storedCart = getCartFromStorage();
    setCart(storedCart);
    setIsLoading(false);
  }, []);

  // Add item to cart
  const addItem = useCallback((item: CartItem) => {
    setCart((currentCart) => {
      const updatedCart = addItemToCart(currentCart, item);
      return updatedCart;
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((itemId: string, itemType: string) => {
    setCart((currentCart) => {
      const updatedCart = removeItemFromCart(currentCart, itemId, itemType);
      return updatedCart;
    });
  }, []);

  // Clear cart
  const handleClearCart = useCallback(() => {
    const emptyCart = clearCart();
    setCart(emptyCart);
  }, []);

  // Check if item is in cart
  const isInCart = useCallback((itemId: string, itemType: string) => {
    return isItemInCart(cart, itemId, itemType);
  }, [cart]);

  // Get item count
  const itemCount = getCartItemCount(cart);

  // Get total amount
  const totalAmount = getCartTotalAmount(cart);

  // Validate cart items
  const validateCart = useCallback((validationData: Record<string, number>) => {
    const result = validateCartItems(cart, validationData);
    
    if (!result.isValid) {
      setCart(result.updatedCart);
    }
    
    return {
      isValid: result.isValid,
      invalidItems: result.invalidItems,
    };
  }, [cart]);

  return {
    cart,
    addItem,
    removeItem,
    clearCart: handleClearCart,
    isInCart,
    itemCount,
    totalAmount,
    isLoading,
    validateCart,
  };
}
