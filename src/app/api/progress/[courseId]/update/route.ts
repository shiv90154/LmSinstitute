import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CourseProgress from '@/models/Progress';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { 
  updateVideoProgress,
  markMaterialAccessed,
  markQuizCompleted,
  generateProgressSummary,
  validateProgressIntegrity
} from '@/lib/utils/progress-tracking';
import mongoose from 'mongoose';

// POST /api/progress/[courseId]/update - Update progress for specific content
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

    const body = await request.json();
    const { 
      type, 
      sectionId, 
      itemId, 
      watchedDuration, 
      totalDuration, 
      completed,
      score 
    } = body;

    // Validate required fields
    if (!type || !sectionId || !itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, sectionId, itemId' },
        { status: 400 }
      );
    }

    if (!['video', 'material', 'quiz'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be video, material, or quiz' },
        { status: 400 }
      );
    }

    // Get course information
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get progress record
    let progress = await CourseProgress.findOne({
      userId: session.user.id,
      courseId: courseId
    });

    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Progress record not found. Initialize progress first.' },
        { status: 404 }
      );
    }

    // Update progress based on type
    try {
      switch (type) {
        case 'video':
          if (watchedDuration === undefined) {
            return NextResponse.json(
              { success: false, error: 'watchedDuration is required for video progress' },
              { status: 400 }
            );
          }
          progress = updateVideoProgress(
            progress,
            sectionId,
            itemId,
            watchedDuration,
            totalDuration
          );
          break;

        case 'material':
          progress = markMaterialAccessed(progress, sectionId, itemId);
          break;

        case 'quiz':
          progress = markQuizCompleted(progress, sectionId, itemId, score);
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid progress type' },
            { status: 400 }
          );
      }

      // Save updated progress
      await progress.save();

      // Generate updated progress summary
      const progressSummary = generateProgressSummary(progress, course as any);

      // Validate progress integrity
      const validation = validateProgressIntegrity(progress);
      if (!validation.isValid) {
        console.warn('Progress integrity issues:', validation.errors);
      }

      return NextResponse.json({
        success: true,
        data: {
          progress: progressSummary,
          validation,
          message: `${type} progress updated successfully`
        }
      });

    } catch (updateError) {
      console.error('Error updating progress:', updateError);
      return NextResponse.json(
        { success: false, error: `Failed to update ${type} progress: ${updateError instanceof Error ? updateError.message : String(updateError)}` },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// PUT /api/progress/[courseId]/update - Bulk update progress
export async function PUT(
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

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Get course information
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get progress record
    let progress = await CourseProgress.findOne({
      userId: session.user.id,
      courseId: courseId
    });

    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Progress record not found. Initialize progress first.' },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    // Process each update
    for (const update of updates) {
      try {
        const { type, sectionId, itemId, watchedDuration, totalDuration, score } = update;

        if (!type || !sectionId || !itemId) {
          errors.push(`Missing required fields in update: ${JSON.stringify(update)}`);
          continue;
        }

        switch (type) {
          case 'video':
            if (watchedDuration === undefined) {
              errors.push(`watchedDuration is required for video progress: ${itemId}`);
              continue;
            }
            progress = updateVideoProgress(
              progress,
              sectionId,
              itemId,
              watchedDuration,
              totalDuration
            );
            results.push({ type, itemId, status: 'updated' });
            break;

          case 'material':
            progress = markMaterialAccessed(progress, sectionId, itemId);
            results.push({ type, itemId, status: 'accessed' });
            break;

          case 'quiz':
            progress = markQuizCompleted(progress, sectionId, itemId, score);
            results.push({ type, itemId, status: 'completed', score });
            break;

          default:
            errors.push(`Invalid progress type: ${type} for item ${itemId}`);
        }
      } catch (updateError) {
        const errorMessage = updateError instanceof Error ? updateError.message : String(updateError);
        errors.push(`Failed to update ${update.type} ${update.itemId}: ${errorMessage}`);
      }
    }

    // Save updated progress
    await progress.save();

    // Generate updated progress summary
    const progressSummary = generateProgressSummary(progress, course as any);

    // Validate progress integrity
    const validation = validateProgressIntegrity(progress);

    return NextResponse.json({
      success: true,
      data: {
        progress: progressSummary,
        results,
        errors,
        validation,
        message: `Bulk update completed. ${results.length} successful, ${errors.length} errors.`
      }
    });

  } catch (error) {
    console.error('Error bulk updating progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update progress' },
      { status: 500 }
    );
  }
}