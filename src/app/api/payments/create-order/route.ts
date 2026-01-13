import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import Order from '@/models/Order';
import connectDB from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export interface CreateOrderRequest {
  items: Array<{
    type: 'course' | 'book' | 'material' | 'test';
    itemId: string;
    price: number;
    title: string;
  }>;
  totalAmount: number;
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
    const body: CreateOrderRequest = await request.json();
    const { items, totalAmount } = body;

    // Validate request data
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid total amount is required' },
        { status: 400 }
      );
    }

    // Validate that calculated total matches provided total
    const calculatedTotal = items.reduce((sum, item) => sum + item.price, 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount mismatch' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${session.user.id}`,
      notes: {
        userId: session.user.id,
        itemCount: items.length.toString(),
      },
    });

    // Create order in database
    const order = new Order({
      userId: session.user.id,
      items: items.map(item => ({
        type: item.type,
        itemId: item.itemId,
        price: item.price,
        title: item.title,
      })),
      totalAmount,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      paymentDetails: {
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        created_at: razorpayOrder.created_at,
      },
    });

    await order.save();

    // Return order details for frontend
    return NextResponse.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
