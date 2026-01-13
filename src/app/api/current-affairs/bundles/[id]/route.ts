import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { CurrentAffairsBundle } from '@/models/CurrentAffairs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET /api/current-affairs/bundles/[id] - Get single current affairs bundle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const bundle = await CurrentAffairsBundle.findById(params.id)
      .populate('currentAffairsIds', 'title date category summary imageUrl')
      .select('-__v');

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'Current affairs bundle not found' },
        { status: 404 }
      );
    }

    if (!bundle.isActive) {
      return NextResponse.json(
        { success: false, error: 'Current affairs bundle not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    console.error('Error fetching current affairs bundle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current affairs bundle' },
      { status: 500 }
    );
  }
}

// PUT /api/current-affairs/bundles/[id] - Update current affairs bundle (Admin only)
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

    const bundle = await CurrentAffairsBundle.findByIdAndUpdate(
      params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('currentAffairsIds', 'title date category summary')
    .select('-__v');

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'Current affairs bundle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    console.error('Error updating current affairs bundle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update current affairs bundle' },
      { status: 500 }
    );
  }
}

// DELETE /api/current-affairs/bundles/[id] - Delete current affairs bundle (Admin only)
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

    const bundle = await CurrentAffairsBundle.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'Current affairs bundle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Current affairs bundle deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting current affairs bundle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete current affairs bundle' },
      { status: 500 }
    );
  }
}