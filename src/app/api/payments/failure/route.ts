import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import Order from '@/models/Order';
import connectDB from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export interface PaymentFailureRequest {
  orderId: string;
  razorpayOrderId?: string;
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: PaymentFailureRequest = await request.json();
    const { orderId, razorpayOrderId, error } = body;

    // Validate required fields
    if (!orderId || !error) {
      return NextResponse.json(
        { error: 'Missing required failure data' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the order
    let query: any = {
      _id: orderId,
      userId: session.user.id,
    };

    if (razorpayOrderId) {
      query.razorpayOrderId = razorpayOrderId;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status to failed
    order.status = 'failed';
    order.paymentDetails = {
      ...order.paymentDetails,
      error: {
        code: error.code,
        description: error.description,
        source: error.source,
        step: error.step,
        reason: error.reason,
        failedAt: new Date(),
      },
    };

    await order.save();

    // Log the failure for monitoring in production
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service: logger.error('Payment failed', { userId, orderId, error });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment failure recorded',
      orderId: order._id,
      status: order.status,
      cartPreserved: true, // Indicate that cart state should be maintained
      retryAllowed: true,
      errorDetails: {
        userMessage: getUserFriendlyErrorMessage(error.code, error.description),
        canRetry: canRetryPayment(error.code),
        suggestedAction: getSuggestedAction(error.code),
      },
    });

  } catch (error) {
    console.error('Error handling payment failure:', error);
    return NextResponse.json(
      { error: 'Failed to process payment failure' },
      { status: 500 }
    );
  }
}

/**
 * Get user-friendly error message based on error code
 */
function getUserFriendlyErrorMessage(code: string, description: string): string {
  const errorMessages: Record<string, string> = {
    'BAD_REQUEST_ERROR': 'There was an issue with your payment request. Please try again.',
    'GATEWAY_ERROR': 'Payment gateway is temporarily unavailable. Please try again in a few minutes.',
    'NETWORK_ERROR': 'Network connection issue. Please check your internet connection and try again.',
    'SERVER_ERROR': 'Payment service is temporarily unavailable. Please try again later.',
    'PAYMENT_DECLINED': 'Your payment was declined by the bank. Please try with a different payment method.',
    'INSUFFICIENT_FUNDS': 'Insufficient funds in your account. Please try with a different payment method.',
    'CARD_EXPIRED': 'Your card has expired. Please use a different card.',
    'INVALID_CARD': 'Invalid card details. Please check your card information and try again.',
    'AUTHENTICATION_ERROR': 'Payment authentication failed. Please try again.',
    'TIMEOUT': 'Payment request timed out. Please try again.',
  };

  return errorMessages[code] || description || 'Payment failed. Please try again or contact support.';
}

/**
 * Check if payment can be retried based on error code
 */
function canRetryPayment(code: string): boolean {
  const nonRetryableCodes = [
    'CARD_EXPIRED',
    'INVALID_CARD',
    'INSUFFICIENT_FUNDS',
  ];

  return !nonRetryableCodes.includes(code);
}

/**
 * Get suggested action based on error code
 */
function getSuggestedAction(code: string): string {
  const suggestions: Record<string, string> = {
    'CARD_EXPIRED': 'Please use a different card or update your card details.',
    'INVALID_CARD': 'Please check your card details and try again.',
    'INSUFFICIENT_FUNDS': 'Please ensure sufficient funds or use a different payment method.',
    'PAYMENT_DECLINED': 'Please contact your bank or try a different payment method.',
    'NETWORK_ERROR': 'Please check your internet connection and try again.',
    'TIMEOUT': 'Please try again. If the issue persists, contact support.',
    'GATEWAY_ERROR': 'Please try again in a few minutes.',
    'SERVER_ERROR': 'Please try again later or contact support if the issue persists.',
  };

  return suggestions[code] || 'Please try again or contact support if the issue persists.';
}
