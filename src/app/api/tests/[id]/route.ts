import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import MockTest from '@/models/MockTest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET /api/tests/[id] - Get specific mock test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const test = await MockTest.findById(params.id).lean();
    
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    if (!test.isActive) {
      return NextResponse.json(
        { success: false, error: 'Test is not available' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}

// PUT /api/tests/[id] - Update mock test (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { title, description, duration, sections, price, isActive } = body;

    const test = await MockTest.findById(params.id);
    
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (title !== undefined) test.title = title;
    if (description !== undefined) test.description = description;
    if (duration !== undefined) test.duration = duration;
    if (sections !== undefined) test.sections = sections;
    if (price !== undefined) test.price = price;
    if (isActive !== undefined) test.isActive = isActive;

    await test.save();

    return NextResponse.json({
      success: true,
      data: test
    });

  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

// DELETE /api/tests/[id] - Delete mock test (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const test = await MockTest.findById(params.id);
    
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    test.isActive = false;
    await test.save();

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}