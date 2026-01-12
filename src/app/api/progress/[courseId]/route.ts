import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CourseProgress from '@/models/Progress';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { 
  initializeCourseProgress,
  generateProgressSummary,
  calculateLearningAnalytics,
  validateProgressIntegrity
} from '@/lib/utils/progress-tracking';
import mongoose from 'mongoose';

// GET /api/progress/[courseId] - Get user's progress for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get course information
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get or create progress record
    let progress = await CourseProgress.findOne({
      userId: session.user.id,
      courseId: courseId
    });

    if (!progress) {
      // Initialize progress if it doesn't exist
      const initialProgress = initializeCourseProgress(session.user.id, course as any);
      progress = new CourseProgress(initialProgress);
      await progress.save();
    }

    // Generate progress summary
    const progressSummary = generateProgressSummary(progress, course as any);
    
    // Calculate learning analytics
    const analytics = calculateLearningAnalytics(progress);

    // Validate progress integrity
    const validation = validateProgressIntegrity(progress);

    return NextResponse.json({
      success: true,
      data: {
        progress: progressSummary,
        analytics,
        validation,
        rawProgress: progress // Include raw data for debugging
      }
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/progress/[courseId] - Initialize or reset progress for a course
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get course information
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { reset = false } = body;

    // Check if progress already exists
    let progress = await CourseProgress.findOne({
      userId: session.user.id,
      courseId: courseId
    });

    if (progress && !reset) {
      return NextResponse.json(
        { success: false, error: 'Progress already exists. Use reset=true to reinitialize.' },
        { status: 400 }
      );
    }

    // Initialize or reset progress
    const initialProgress = initializeCourseProgress(session.user.id, course as any);
    
    if (progress && reset) {
      // Reset existing progress
      Object.assign(progress, initialProgress);
      await progress.save();
    } else {
      // Create new progress
      progress = new CourseProgress(initialProgress);
      await progress.save();
    }

    // Generate progress summary
    const progressSummary = generateProgressSummary(progress, course as any);

    return NextResponse.json({
      success: true,
      data: {
        progress: progressSummary,
        message: reset ? 'Progress reset successfully' : 'Progress initialized successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error initializing progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize progress' },
      { status: 500 }
    );
  }
}