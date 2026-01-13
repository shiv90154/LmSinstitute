import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import {
  createSuccessResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
  handleApiRoute,
} from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return createUnauthorizedResponse();
    }

    await connectDB();
    
    const orderId = params.id;
    
    // Find order and verify ownership (unless admin)
    const query = session.user.role === 'admin' 
      ? { _id: orderId }
      : { _id: orderId, userId: session.user.id };
    
    const order = await Order.findOne(query).lean();
    
    if (!order) {
      return createNotFoundResponse('Order');
    }

    return createSuccessResponse(
      order,
      'Order retrieved successfully'
    );
  }, 'Failed to fetch order');
}