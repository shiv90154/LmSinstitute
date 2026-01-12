import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import mongoose from 'mongoose';

// GET /api/courses/[id]/sections - Get all sections for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    const course = await Course.findById(id).select('sections').lean();
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Sort sections by order
    const sortedSections = course.sections.sort((a: any, b: any) => a.order - b.order);
    
    return NextResponse.json({
      success: true,
      data: sortedSections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/sections - Add new section to course (admin only)
export async function POST(
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
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { title, order, videos, materials, quizzes } = body;
    
    // Validate required fields
    if (!title || order === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, order' },
        { status: 400 }
      );
    }
    
    const newSection = {
      _id: new mongoose.Types.ObjectId(),
      title,
      order,
      videos: videos || [],
      materials: materials || [],
      quizzes: quizzes || []
    };
    
    const course = await Course.findByIdAndUpdate(
      id,
      { $push: { sections: newSection } },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Find the newly added section
    const addedSection = course.sections.find(
      (section: any) => section._id.toString() === newSection._id.toString()
    );
    
    return NextResponse.json({
      success: true,
      data: addedSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add section' },
      { status: 500 }
    );
  }
}