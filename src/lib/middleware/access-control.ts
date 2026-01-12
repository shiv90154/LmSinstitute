/**
 * Access Control Middleware
 * Enforces content access rules at the API level
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import { checkVideoAccess, checkCourseAccess } from '@/lib/utils/access-control';

export interface AccessControlOptions {
  requireAuth?: boolean;
  requirePurchase?: boolean;
  allowFreeContent?: boolean;
  adminOnly?: boolean;
}

/**
 * Middleware to check user authentication and access permissions
 */
export async function withAccessControl(
  request: NextRequest,
  options: AccessControlOptions = {}
) {
  const {
    requireAuth = false,
    requirePurchase = false,
    allowFreeContent = true,
    adminOnly = false
  } = options;

  try {
    // Get user session
    const session = await getServerSession(authOptions);

    // Check authentication requirement
    if (requireAuth && !session?.user?.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Check admin requirement
    if (adminOnly && session?.user?.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required',
          code: 'ADMIN_REQUIRED'
        },
        { status: 403 }
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
      await connectDB();
      const user = await User.findById(session.user.id).select('purchases').lean();
      if (user) {
        userAccess.purchases = user.purchases.map((p: any) => p.toString());
      }
    }

    return {
      session,
      userAccess,
      isAuthenticated: !!session,
      isAdmin: session?.user?.role === 'admin'
    };

  } catch (error) {
    console.error('Access control middleware error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Access control check failed',
        code: 'ACCESS_CHECK_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * Checks if user has access to a specific course
 */
export async function checkCourseAccessMiddleware(
  courseId: string,
  userAccess: any
): Promise<{
  hasAccess: boolean;
  course?: any;
  error?: string;
}> {
  try {
    await connectDB();
    
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return { hasAccess: false, error: 'Course not found' };
    }

    const accessResult = checkCourseAccess(course as any, userAccess);
    
    return {
      hasAccess: accessResult.hasAccess,
      course,
      error: accessResult.reason
    };

  } catch (error) {
    console.error('Course access check error:', error);
    return { hasAccess: false, error: 'Failed to check course access' };
  }
}

/**
 * Checks if user has access to a specific video
 */
export async function checkVideoAccessMiddleware(
  videoId: string,
  userAccess: any
): Promise<{
  hasAccess: boolean;
  video?: any;
  course?: any;
  error?: string;
}> {
  try {
    await connectDB();
    
    // Find the course containing this video
    const course = await Course.findOne({
      'sections.videos._id': videoId
    }).lean();

    if (!course) {
      return { hasAccess: false, error: 'Video not found' };
    }

    // Find the specific video
    let targetVideo = null;
    for (const section of course.sections) {
      const video = section.videos.find((v: any) => v._id.toString() === videoId);
      if (video) {
        targetVideo = video;
        break;
      }
    }

    if (!targetVideo) {
      return { hasAccess: false, error: 'Video not found in course structure' };
    }

    const accessResult = checkVideoAccess(
      targetVideo as any,
      course._id.toString(),
      userAccess
    );

    return {
      hasAccess: accessResult.hasAccess,
      video: targetVideo,
      course,
      error: accessResult.reason
    };

  } catch (error) {
    console.error('Video access check error:', error);
    return { hasAccess: false, error: 'Failed to check video access' };
  }
}

/**
 * Rate limiting for access control endpoints
 */
const accessAttempts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  const current = accessAttempts.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    const resetTime = now + windowMs;
    accessAttempts.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxAttempts - 1, resetTime };
  }
  
  if (current.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  accessAttempts.set(key, current);
  
  return { 
    allowed: true, 
    remaining: maxAttempts - current.count, 
    resetTime: current.resetTime 
  };
}

/**
 * Logs access attempts for security monitoring
 */
export function logAccessAttempt(
  userId: string | undefined,
  resourceType: 'course' | 'video' | 'material' | 'quiz',
  resourceId: string,
  success: boolean,
  reason?: string,
  request?: NextRequest
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    resourceType,
    resourceId,
    success,
    reason,
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
    userAgent: request?.headers.get('user-agent') || 'unknown'
  };

  // Send to production logging service if needed
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service: logger.info('Access attempt', logEntry);
  }
  
  // Store critical access attempts in production
  if (!success && reason) {
    if (process.env.NODE_ENV === 'production') {
      // Send to security monitoring: logger.warn('Access denied', logEntry);
    }
  }
}

/**
 * Validates free content rules enforcement
 */
export async function validateFreeContentAccess(
  courseId: string
): Promise<{ isValid: boolean; violations: string[] }> {
  try {
    await connectDB();
    
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return { isValid: false, violations: ['Course not found'] };
    }

    const violations: string[] = [];

    course.sections.forEach((section: any, sectionIndex: number) => {
      const freeVideos = section.videos.filter((video: any) => video.isFree);
      
      // Check: Each section should have exactly one free video
      if (freeVideos.length === 0) {
        violations.push(`Section ${sectionIndex + 1} has no free videos`);
      } else if (freeVideos.length > 1) {
        violations.push(`Section ${sectionIndex + 1} has ${freeVideos.length} free videos (should be 1)`);
      }

      // Check: Free video should be the first one by order
      if (freeVideos.length === 1) {
        const sortedVideos = [...section.videos].sort((a, b) => a.order - b.order);
        if (sortedVideos.length > 0 && !sortedVideos[0].isFree) {
          violations.push(`Section ${sectionIndex + 1} free video is not the first video`);
        }
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };

  } catch (error) {
    console.error('Free content validation error:', error);
    return { isValid: false, violations: ['Validation check failed'] };
  }
}
