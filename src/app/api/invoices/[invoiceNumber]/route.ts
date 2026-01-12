import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import Invoice from '@/models/Invoice';
import connectDB from '@/lib/db/mongodb';

interface RouteParams {
  params: {
    invoiceNumber: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Find the invoice
    const invoice = await Invoice.findOne({
      invoiceNumber: params.invoiceNumber,
      userId: session.user.id,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if user wants HTML or JSON
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'html') {
      // Return HTML content for viewing/printing
      return new NextResponse(invoice.htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
        },
      });
    }

    // Return JSON data
    return NextResponse.json({
      success: true,
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        data: invoice.data,
        createdAt: invoice.createdAt,
      },
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}