import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import StudyMaterial from '@/models/StudyMaterial';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET /api/study-materials/[id] - Get single study material
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const studyMaterial = await StudyMaterial.findById(params.id).select('-__v');

    if (!studyMaterial) {
      return NextResponse.json(
        { success: false, error: 'Study material not found' },
        { status: 404 }
      );
    }

    if (!studyMaterial.isActive) {
      return NextResponse.json(
        { success: false, error: 'Study material not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: studyMaterial,
    });
  } catch (error) {
    console.error('Error fetching study material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study material' },
      { status: 500 }
    );
  }
}

// PUT /api/study-materials/[id] - Update study material (Admin only)
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

    const studyMaterial = await StudyMaterial.findByIdAndUpdate(
      params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!studyMaterial) {
      return NextResponse.json(
        { success: false, error: 'Study material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: studyMaterial,
    });
  } catch (error) {
    console.error('Error updating study material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update study material' },
      { status: 500 }
    );
  }
}

// DELETE /api/study-materials/[id] - Delete study material (Admin only)
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

    const studyMaterial = await StudyMaterial.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!studyMaterial) {
      return NextResponse.json(
        { success: false, error: 'Study material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Study material deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting study material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete study material' },
      { status: 500 }
    );
  }
}