/**
 * Server-side Payment Validation Middleware
 * Provides comprehensive payment security and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyPaymentSignature, verifyWebhookSignature } from '@/lib/payments/razorpay';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
  order?: any;
  user?: any;
}

/**
 * Validates payment verification requests
 */
export async function validatePaymentVerification(
  request: NextRequest
): Promise<PaymentValidationResult> {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId 
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        isValid: false,
        error: 'Missing required payment verification fields',
        code: 'MISSING_FIELDS'
      };
    }

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isSignatureValid) {
      return {
        isValid: false,
        error: 'Invalid payment signature',
        code: 'INVALID_SIGNATURE'
      };
    }

    // Connect to database and validate order
    await connectDB();
    
    const order = await Order.findOne({ 
      razorpayOrderId: razorpay_order_id 
    }).populate('userId');

    if (!order) {
      return {
        isValid: false,
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      };
    }

    // Validate order belongs to the user (if userId provided)
    if (userId && order.userId._id.toString() !== userId) {
      return {
        isValid: false,
        error: 'Order does not belong to user',
        code: 'ORDER_USER_MISMATCH'
      };
    }

    // Check if order is already processed
    if (order.status === 'completed') {
      return {
        isValid: false,
        error: 'Order already processed',
        code: 'ORDER_ALREADY_PROCESSED'
      };
    }

    // Validate order amount and currency
    if (order.status === 'failed' || order.status === 'refunded') {
      return {
        isValid: false,
        error: 'Order is in invalid state for payment',
        code: 'INVALID_ORDER_STATE'
      };
    }

    return {
      isValid: true,
      order,
      user: order.userId
    };

  } catch (error) {
    console.error('Payment validation error:', error);
    return {
      isValid: false,
      error: 'Payment validation failed',
      code: 'VALIDATION_ERROR'
    };
  }
}

/**
 * Validates webhook requests from Razorpay
 */
export async function validateWebhookRequest(
  request: NextRequest
): Promise<PaymentValidationResult> {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return {
        isValid: false,
        error: 'Missing webhook signature or secret',
        code: 'MISSING_WEBHOOK_AUTH'
      };
    }

    // Get raw body for signature verification
    const body = await request.text();
    
    // Verify webhook signature
    const isSignatureValid = verifyWebhookSignature(
      body,
      signature,
      webhookSecret
    );

    if (!isSignatureValid) {
      return {
        isValid: false,
        error: 'Invalid webhook signature',
        code: 'INVALID_WEBHOOK_SIGNATURE'
      };
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    
    // Validate webhook event structure
    if (!payload.event || !payload.payload) {
      return {
        isValid: false,
        error: 'Invalid webhook payload structure',
        code: 'INVALID_WEBHOOK_PAYLOAD'
      };
    }

    return {
      isValid: true,
      order: payload.payload
    };

  } catch (error) {
    console.error('Webhook validation error:', error);
    return {
      isValid: false,
      error: 'Webhook validation failed',
      code: 'WEBHOOK_VALIDATION_ERROR'
    };
  }
}

/**
 * Validates order creation requests
 */
export async function validateOrderCreation(
  request: NextRequest,
  userId: string
): Promise<PaymentValidationResult> {
  try {
    const body = await request.json();
    const { items, totalAmount } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        isValid: false,
        error: 'Invalid or empty items array',
        code: 'INVALID_ITEMS'
      };
    }

    if (!totalAmount || totalAmount <= 0) {
      return {
        isValid: false,
        error: 'Invalid total amount',
        code: 'INVALID_AMOUNT'
      };
    }

    // Validate user exists
    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        isValid: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      };
    }

    // Validate each item in the order
    let calculatedTotal = 0;
    
    for (const item of items) {
      if (!item.type || !item.itemId || !item.price || !item.title) {
        return {
          isValid: false,
          error: 'Invalid item structure',
          code: 'INVALID_ITEM_STRUCTURE'
        };
      }

      // Validate item type
      const validTypes = ['course', 'book', 'material', 'test', 'bundle'];
      if (!validTypes.includes(item.type)) {
        return {
          isValid: false,
          error: `Invalid item type: ${item.type}`,
          code: 'INVALID_ITEM_TYPE'
        };
      }

      // Validate price is positive
      if (item.price <= 0) {
        return {
          isValid: false,
          error: 'Item price must be positive',
          code: 'INVALID_ITEM_PRICE'
        };
      }

      calculatedTotal += item.price;
    }

    // Validate total amount matches sum of items
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return {
        isValid: false,
        error: 'Total amount does not match sum of items',
        code: 'AMOUNT_MISMATCH'
      };
    }

    // Check for duplicate purchases (optional business rule)
    const existingOrders = await Order.find({
      userId,
      status: 'completed',
      'items.itemId': { $in: items.map(item => item.itemId) }
    });

    if (existingOrders.length > 0) {
      const duplicateItems = existingOrders.flatMap(order => 
        order.items.filter((orderItem: any) => 
          items.some(newItem => newItem.itemId === orderItem.itemId.toString())
        )
      );

      if (duplicateItems.length > 0) {
        return {
          isValid: false,
          error: 'Some items are already purchased',
          code: 'DUPLICATE_PURCHASE'
        };
      }
    }

    return {
      isValid: true,
      user
    };

  } catch (error) {
    console.error('Order creation validation error:', error);
    return {
      isValid: false,
      error: 'Order validation failed',
      code: 'ORDER_VALIDATION_ERROR'
    };
  }
}

/**
 * Validates refund requests
 */
export async function validateRefundRequest(
  request: NextRequest,
  userId: string,
  isAdmin: boolean = false
): Promise<PaymentValidationResult> {
  try {
    const body = await request.json();
    const { orderId, reason, amount } = body;

    if (!orderId) {
      return {
        isValid: false,
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID'
      };
    }

    await connectDB();
    
    const order = await Order.findById(orderId).populate('userId');
    
    if (!order) {
      return {
        isValid: false,
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      };
    }

    // Check if user owns the order (unless admin)
    if (!isAdmin && order.userId._id.toString() !== userId) {
      return {
        isValid: false,
        error: 'Order does not belong to user',
        code: 'ORDER_ACCESS_DENIED'
      };
    }

    // Check if order can be refunded
    if (order.status !== 'completed') {
      return {
        isValid: false,
        error: 'Only completed orders can be refunded',
        code: 'INVALID_ORDER_STATUS'
      };
    }

    // Check refund amount if specified
    if (amount && (amount <= 0 || amount > order.totalAmount)) {
      return {
        isValid: false,
        error: 'Invalid refund amount',
        code: 'INVALID_REFUND_AMOUNT'
      };
    }

    // Check refund time limit (e.g., 30 days)
    const refundTimeLimit = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const orderAge = Date.now() - order.createdAt.getTime();
    
    if (!isAdmin && orderAge > refundTimeLimit) {
      return {
        isValid: false,
        error: 'Refund time limit exceeded',
        code: 'REFUND_TIME_EXPIRED'
      };
    }

    return {
      isValid: true,
      order,
      user: order.userId
    };

  } catch (error) {
    console.error('Refund validation error:', error);
    return {
      isValid: false,
      error: 'Refund validation failed',
      code: 'REFUND_VALIDATION_ERROR'
    };
  }
}

/**
 * Rate limiting for payment operations
 */
const paymentAttempts = new Map<string, { count: number; resetTime: number }>();

export function checkPaymentRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `payment_${identifier}`;
  
  const current = paymentAttempts.get(key);
  
  if (!current || now > current.resetTime) {
    const resetTime = now + windowMs;
    paymentAttempts.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxAttempts - 1, resetTime };
  }
  
  if (current.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  paymentAttempts.set(key, current);
  
  return { 
    allowed: true, 
    remaining: maxAttempts - current.count, 
    resetTime: current.resetTime 
  };
}

/**
 * Logs payment validation attempts for security monitoring
 */
export function logPaymentValidation(
  type: 'verification' | 'webhook' | 'order_creation' | 'refund',
  success: boolean,
  userId?: string,
  orderId?: string,
  error?: string,
  request?: NextRequest
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    success,
    userId: userId || 'anonymous',
    orderId: orderId || 'unknown',
    error,
    ip: request?.headers.get('x-forwarded-for') || 
        request?.headers.get('x-real-ip') || 'unknown',
    userAgent: request?.headers.get('user-agent') || 'unknown'
  };

  // Log to console (in production, send to logging service)
  console.log('Payment validation:', logEntry);
  
  // Log security events
  if (!success && error) {
    console.warn('Payment validation failed:', logEntry);
  }
}
