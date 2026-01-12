import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { unlockContentForUser } from '@/lib/utils/content-unlocking';
import { createInvoice } from '@/lib/utils/invoice-generator';
import Order from '@/models/Order';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import connectDB from '@/lib/db/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Razorpay webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const isValidSignature = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    // Connect to database
    await connectDB();

    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(payload.order.entity);
        break;
      
      default:
        // Unhandled webhook event - log for monitoring if needed
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    const order = await Order.findOne({
      razorpayOrderId: payment.order_id,
    });

    if (order && order.status === 'pending') {
      order.status = 'completed';
      order.razorpayPaymentId = payment.id;
      order.paymentDetails = {
        ...order.paymentDetails,
        webhookPayment: payment,
        capturedAt: new Date(),
      };

      await order.save();

      // Get user details
      const user = await User.findById(order.userId);
      if (!user) {
        console.error(`User not found for order: ${order._id}`);
        return;
      }

      // Update user's purchases if not already done
      if (!user.purchases?.includes(order._id)) {
        if (!user.purchases) {
          user.purchases = [];
        }
        user.purchases.push(order._id);
        await user.save();
      }

      // Unlock content for the user
      const unlockResult = await unlockContentForUser(order.userId.toString(), order);
      
      if (!unlockResult.success) {
        console.error('Content unlocking errors for webhook:', unlockResult.errors);
      }

      // Generate invoice if not already generated
      const existingInvoice = await Invoice.findOne({ orderId: order._id });
      
      if (!existingInvoice) {
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
              razorpayPaymentId: payment.id,
              paymentMethod: payment.method || 'Unknown',
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
          // Invoice generated successfully

        } catch (invoiceError) {
          console.error('Error generating invoice in webhook:', invoiceError);
        }
      }

      // Payment captured and processed successfully
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    const order = await Order.findOne({
      razorpayOrderId: payment.order_id,
    });

    if (order && order.status === 'pending') {
      order.status = 'failed';
      order.paymentDetails = {
        ...order.paymentDetails,
        webhookPayment: payment,
        failedAt: new Date(),
        failureReason: payment.error_description || 'Payment failed',
      };

      await order.save();
      // Payment failed - order updated
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(orderData: any) {
  try {
    const order = await Order.findOne({
      razorpayOrderId: orderData.id,
    });

    if (order && order.status === 'pending') {
      order.status = 'completed';
      order.paymentDetails = {
        ...order.paymentDetails,
        webhookOrder: orderData,
        paidAt: new Date(),
      };

      await order.save();
      // Order marked as paid
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}
