import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import Invoice from '@/models/Invoice';
import connectDB from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    let query: any = { userId: session.user.id };
    
    if (orderId) {
      query.orderId = orderId;
    }

    // Find invoices for the user
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .select('invoiceNumber orderId data.invoiceNumber data.totalAmount data.createdAt createdAt');

    return NextResponse.json({
      success: true,
      invoices: invoices.map(invoice => ({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        totalAmount: invoice.data?.totalAmount || 0,
        createdAt: invoice.createdAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
