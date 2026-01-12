export interface CartItem {
  id: string;
  type: 'course' | 'book' | 'material' | 'test';
  title: string;
  price: number;
  description?: string;
  thumbnail?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: Date;
}

const CART_STORAGE_KEY = 'career_path_cart';

/**
 * Get cart from localStorage
 */
export function getCartFromStorage(): Cart {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return createEmptyCart();
    }

    const cart = JSON.parse(stored);
    return {
      ...cart,
      updatedAt: new Date(cart.updatedAt),
    };
  } catch (error) {
    console.error('Error reading cart from storage:', error);
    return createEmptyCart();
  }
}

/**
 * Save cart to localStorage
 */
export function saveCartToStorage(cart: Cart): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
}

/**
 * Create empty cart
 */
export function createEmptyCart(): Cart {
  return {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    updatedAt: new Date(),
  };
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]): { totalItems: number; totalAmount: number } {
  const totalItems = items.length;
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  
  return { totalItems, totalAmount };
}

/**
 * Add item to cart
 */
export function addItemToCart(cart: Cart, item: CartItem): Cart {
  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    (cartItem) => cartItem.id === item.id && cartItem.type === item.type
  );

  let newItems: CartItem[];
  
  if (existingItemIndex >= 0) {
    // Item already exists, don't add duplicate
    newItems = [...cart.items];
  } else {
    // Add new item
    newItems = [...cart.items, item];
  }

  const { totalItems, totalAmount } = calculateCartTotals(newItems);

  const updatedCart: Cart = {
    items: newItems,
    totalItems,
    totalAmount,
    updatedAt: new Date(),
  };

  saveCartToStorage(updatedCart);
  return updatedCart;
}

/**
 * Remove item from cart
 */
export function removeItemFromCart(cart: Cart, itemId: string, itemType: string): Cart {
  const newItems = cart.items.filter(
    (item) => !(item.id === itemId && item.type === itemType)
  );

  const { totalItems, totalAmount } = calculateCartTotals(newItems);

  const updatedCart: Cart = {
    items: newItems,
    totalItems,
    totalAmount,
    updatedAt: new Date(),
  };

  saveCartToStorage(updatedCart);
  return updatedCart;
}

/**
 * Clear entire cart
 */
export function clearCart(): Cart {
  const emptyCart = createEmptyCart();
  saveCartToStorage(emptyCart);
  return emptyCart;
}

/**
 * Check if item is in cart
 */
export function isItemInCart(cart: Cart, itemId: string, itemType: string): boolean {
  return cart.items.some(
    (item) => item.id === itemId && item.type === itemType
  );
}

/**
 * Get cart item count
 */
export function getCartItemCount(cart: Cart): number {
  return cart.totalItems;
}

/**
 * Get cart total amount
 */
export function getCartTotalAmount(cart: Cart): number {
  return cart.totalAmount;
}

/**
 * Validate cart items (check if prices are still valid)
 */
export function validateCartItems(cart: Cart, validationData: Record<string, number>): {
  isValid: boolean;
  invalidItems: CartItem[];
  updatedCart: Cart;
} {
  const invalidItems: CartItem[] = [];
  const validItems: CartItem[] = [];

  cart.items.forEach((item) => {
    const currentPrice = validationData[`${item.type}_${item.id}`];
    
    if (currentPrice === undefined) {
      // Item no longer exists
      invalidItems.push(item);
    } else if (Math.abs(currentPrice - item.price) > 0.01) {
      // Price has changed
      invalidItems.push(item);
      validItems.push({ ...item, price: currentPrice });
    } else {
      // Item is still valid
      validItems.push(item);
    }
  });

  const { totalItems, totalAmount } = calculateCartTotals(validItems);
  
  const updatedCart: Cart = {
    items: validItems,
    totalItems,
    totalAmount,
    updatedAt: new Date(),
  };

  if (invalidItems.length > 0) {
    saveCartToStorage(updatedCart);
  }

  return {
    isValid: invalidItems.length === 0,
    invalidItems,
    updatedCart,
  };
}
