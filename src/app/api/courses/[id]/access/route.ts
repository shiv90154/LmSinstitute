import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { 
  checkCourseAccess, 
  filterCourseByAccess, 
  getContentSummary,
  validateFreeContentRules
} from '@/lib/utils/access-control';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET /api/courses/[id]/access - Check course access and get filtered content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const course = await Course.findById(id).lean();
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get user access information
    let userAccess = {
      userId: session?.user?.id,
      purchases: [] as string[],
      isAuthenticated: !!session,
      role: session?.user?.role as 'student' | 'admin' | undefined
    };

    if (session?.user?.id) {
      const user = await User.findById(session.user.id).select('purchases').lean();
      if (user) {
        userAccess.purchases = user.purchases.map((p: any) => p.toString());
      }
    }

    // Check course access
    const accessResult = checkCourseAccess(course as any, userAccess);
    
    // Filter course content based on access level
    const filteredCourse = filterCourseByAccess(course as any, userAccess);
    
    // Get content summary
    const contentSummary = getContentSummary(course as any, userAccess);
    
    // Validate free content rules (for debugging/admin purposes)
    const freeContentValidation = validateFreeContentRules(course as any);

    return NextResponse.json({
      success: true,
      data: {
        course: filteredCourse,
        access: accessResult,
        summary: contentSummary,
        validation: freeContentValidation,
        userInfo: {
          isAuthenticated: userAccess.isAuthenticated,
          role: userAccess.role,
          hasPurchased: accessResult.hasAccess && !accessResult.freeContentAvailable
        }
      }
    });

  } catch (error) {
    console.error('Error checking course access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check course access' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/access - Request course access (for purchase flow)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const course = await Course.findById(id).select('title price isActive').lean();
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (!course.isActive) {
      return NextResponse.json(
        { success: false, error: 'Course is not available for purchase' },
        { status: 400 }
      );
    }

    // Check if user already has access
    const user = await User.findById(session.user.id).select('purchases').lean();
    const userPurchases = user?.purchases.map((p: any) => p.toString()) || [];
    
    if (userPurchases.includes(id)) {
      return NextResponse.json(
        { success: false, error: 'You already have access to this course' },
        { status: 400 }
      );
    }

    // Return course purchase information
    return NextResponse.json({
      success: true,
      data: {
        courseId: course._id,
        title: course.title,
        price: course.price,
        message: 'Course available for purchase',
        purchaseUrl: `/api/payments/create-order`, // This would be implemented in payment system
        redirectUrl: `/courses/${id}`
      }
    });

  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process access request' },
      { status: 500 }
    );
  }
}