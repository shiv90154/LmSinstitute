import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import Order from '@/models/Order';
import connectDB from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export interface RetryPaymentRequest {
  orderId: string;
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
    const body: RetryPaymentRequest = await request.json();
    const { orderId } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the failed order
    const order = await Order.findOne({
      _id: orderId,
      userId: session.user.id,
      status: 'failed',
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Failed order not found' },
        { status: 404 }
      );
    }

    // Create new Razorpay order for retry
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `retry_${Date.now()}_${order._id}`,
      notes: {
        userId: session.user.id,
        originalOrderId: order._id.toString(),
        retryAttempt: 'true',
        itemCount: order.items.length.toString(),
      },
    });

    // Update order with new Razorpay order details
    order.status = 'pending';
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentDetails = {
      ...order.paymentDetails,
      retryDetails: {
        retriedAt: new Date(),
        newRazorpayOrderId: razorpayOrder.id,
        previousError: order.paymentDetails.error,
      },
      // Clear previous error
      error: undefined,
    };

    await order.save();

    // Return new order details for frontend
    return NextResponse.json({
      success: true,
      message: 'Payment retry initiated',
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error retrying payment:', error);
    return NextResponse.json(
      { error: 'Failed to retry payment' },
      { status: 500 }
    );
  }
}
