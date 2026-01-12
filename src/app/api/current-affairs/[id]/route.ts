import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CurrentAffairs from '@/models/CurrentAffairs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// GET /api/current-affairs/[id] - Get single current affairs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentAffairs = await CurrentAffairs.findById(params.id).select('-__v');

    if (!currentAffairs) {
      return NextResponse.json(
        { success: false, error: 'Current affairs not found' },
        { status: 404 }
      );
    }

    if (!currentAffairs.isActive) {
      return NextResponse.json(
        { success: false, error: 'Current affairs not available' },
        { status: 404 }
      );
    }

    // Increment view count
    await CurrentAffairs.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    return NextResponse.json({
      success: true,
      data: currentAffairs,
    });
  } catch (error) {
    console.error('Error fetching current affairs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current affairs' },
      { status: 500 }
    );
  }
}

// PUT /api/current-affairs/[id] - Update current affairs (Admin only)
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
    const updateFields = { ...body };
    delete updateFields._id;
    delete updateFields.__v;

    // If date is being updated, let the pre-save middleware handle month/year
    if (updateFields.date) {
      updateFields.date = new Date(updateFields.date);
    }

    const currentAffairs = await CurrentAffairs.findByIdAndUpdate(
      params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!currentAffairs) {
      return NextResponse.json(
        { success: false, error: 'Current affairs not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: currentAffairs,
    });
  } catch (error) {
    console.error('Error updating current affairs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update current affairs' },
      { status: 500 }
    );
  }
}

// DELETE /api/current-affairs/[id] - Delete current affairs (Admin only)
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

    const currentAffairs = await CurrentAffairs.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!currentAffairs) {
      return NextResponse.json(
        { success: false, error: 'Current affairs not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Current affairs deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting current affairs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete current affairs' },
      { status: 500 }
    );
  }
}