import { NextRequest, NextResponse } from 'next/server';
import { withPaymentMiddleware, createSuccessResponse, createErrorResponse } from '@/lib/middleware/api-middleware';
import { getPaymentDetails } from '@/lib/payments/razorpay';
import { unlockContentForUser } from '@/lib/utils/content-unlocking';
import { createInvoice } from '@/lib/utils/invoice-generator';
import Order from '@/models/Order';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import connectDB from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

async function verifyPaymentHandler(request: NextRequest, context: any) {
  try {
    const { session, paymentData } = context;
    
    // Parse request body
    const body: VerifyPaymentRequest = await request.json();
    const { razorpay_payment_id, orderId } = body;

    // Payment validation is already done by middleware
    const { order, user: orderUser } = paymentData;

    // Validate that the provided orderId matches the validated order
    if (orderId && order._id.toString() !== orderId) {
      return createErrorResponse(
        'Order ID mismatch',
        'ORDER_ID_MISMATCH',
        400
      );
    }

    // Connect to database
    await connectDB();

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    // Update order with payment details
    order.status = 'completed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentDetails = {
      ...order.paymentDetails,
      ...paymentDetails,
      verifiedAt: new Date(),
    };

    await order.save();

    // Get user details for invoice generation
    const user = await User.findById(session.user.id);
    if (!user) {
      return createErrorResponse(
        'User not found',
        'USER_NOT_FOUND',
        404
      );
    }

    // Update user's purchases
    if (!user.purchases) {
      user.purchases = [];
    }
    if (!user.purchases.includes(order._id)) {
      user.purchases.push(order._id);
    }
    await user.save();

    // Unlock content for the user
    const unlockResult = await unlockContentForUser(session.user.id, order);
    
    if (!unlockResult.success) {
      console.error('Content unlocking errors:', unlockResult.errors);
      // Continue with payment verification even if content unlocking has issues
      // The content can be unlocked manually later if needed
    }

    // Generate invoice
    try {
      const invoice = createInvoice(
        order._id.toString(),
        user._id.toString(),
        {
          name: user.name || 'N/A',
          email: user.email,
          phone: user.profile?.phone,
          address: user.profile?.address,
        },
        order.items.map((item: any) => ({
          type: item.type,
          itemId: item.itemId.toString(),
          title: item.title,
          price: item.price,
        })),
        order.totalAmount,
        {
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: razorpay_payment_id,
          paymentMethod: paymentDetails.method || 'Unknown',
          paidAt: new Date(),
        }
      );

      // Save invoice to database
      const invoiceDoc = new Invoice({
        invoiceNumber: invoice.invoiceNumber,
        orderId: order._id,
        userId: user._id,
        data: invoice.data,
        htmlContent: invoice.htmlContent,
      });

      await invoiceDoc.save();

      return createSuccessResponse({
        orderId: order._id,
        status: order.status,
        invoiceNumber: invoice.invoiceNumber,
        unlockedContent: unlockResult.unlockedItems,
        contentUnlockErrors: unlockResult.errors,
      }, 'Payment verified successfully');

    } catch (invoiceError) {
      console.error('Error generating invoice:', invoiceError);
      
      // Return success even if invoice generation fails
      // The invoice can be generated manually later
      return createSuccessResponse({
        orderId: order._id,
        status: order.status,
        unlockedContent: unlockResult.unlockedItems,
        contentUnlockErrors: unlockResult.errors,
        invoiceError: 'Invoice generation failed - will be generated manually',
      }, 'Payment verified successfully (invoice generation pending)');
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return createErrorResponse(
      'Payment verification failed',
      'VERIFICATION_ERROR',
      500
    );
  }
}

export const POST = withPaymentMiddleware(verifyPaymentHandler);
