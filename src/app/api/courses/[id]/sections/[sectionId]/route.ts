import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';

// GET /api/courses/[id]/sections/[sectionId] - Get specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    await connectDB();
    
    const { id, sectionId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(sectionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course or section ID' },
        { status: 400 }
      );
    }
    
    const course = await Course.findById(id).lean();
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    const section = course.sections.find(
      (section: any) => section._id.toString() === sectionId
    );
    
    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]/sections/[sectionId] - Update section (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
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
    
    const { id, sectionId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(sectionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course or section ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { title, order, videos, materials, quizzes } = body;
    
    // Build update object
    const updateFields: any = {};
    if (title !== undefined) updateFields['sections.$.title'] = title;
    if (order !== undefined) updateFields['sections.$.order'] = order;
    if (videos !== undefined) updateFields['sections.$.videos'] = videos;
    if (materials !== undefined) updateFields['sections.$.materials'] = materials;
    if (quizzes !== undefined) updateFields['sections.$.quizzes'] = quizzes;
    
    const course = await Course.findOneAndUpdate(
      { _id: id, 'sections._id': sectionId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course or section not found' },
        { status: 404 }
      );
    }
    
    // Find the updated section
    const updatedSection = course.sections.find(
      (section: any) => section._id.toString() === sectionId
    );
    
    return NextResponse.json({
      success: true,
      data: updatedSection
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/sections/[sectionId] - Delete section (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
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
    
    const { id, sectionId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(sectionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course or section ID' },
        { status: 400 }
      );
    }
    
    const course = await Course.findByIdAndUpdate(
      id,
      { $pull: { sections: { _id: sectionId } } },
      { new: true }
    );
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}