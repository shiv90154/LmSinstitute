import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  createSuccessResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  extractQueryParams,
  handleApiRoute,
  validateRequiredFields,
} from '@/lib/utils/api-response';
import {
  ensureCompleteCourseDelivery,
  validateContentCompleteness,
} from '@/lib/utils/content-delivery';

export const dynamic = 'force-dynamic';

// GET /api/courses - Get all courses (public, but filtered based on user)
export async function GET(request: NextRequest) {
  return handleApiRoute(async () => {
    await connectDB();
    
    const { page, limit, skip, isActive } = extractQueryParams(new URL(request.url).searchParams);
    
    // Build query
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    const courses = await Course.find(query)
      .select('title description price thumbnail isActive createdAt sections')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Course.countDocuments(query);
    
    // Ensure complete content delivery for each course
    const completeCourses = courses.map(ensureCompleteCourseDelivery);
    
    return createSuccessResponse(
      { courses: completeCourses },
      'Courses retrieved successfully',
      { page, limit, total }
    );
  }, 'Failed to fetch courses');
}

// POST /api/courses - Create new course (admin only)
export async function POST(request: NextRequest) {
  return handleApiRoute(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return createUnauthorizedResponse('Admin access required');
    }
    
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'thumbnail'];
    const missingFields = validateRequiredFields(body, requiredFields);
    
    if (missingFields.length > 0) {
      return createValidationErrorResponse(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate content completeness
    const contentErrors = validateContentCompleteness(body, 'course');
    if (contentErrors.length > 0) {
      return createValidationErrorResponse(contentErrors);
    }
    
    const { title, description, price, thumbnail, sections, isActive } = body;
    
    const course = new Course({
      title,
      description,
      price,
      thumbnail,
      sections: sections || [],
      isActive: isActive !== undefined ? isActive : true
    });
    
    await course.save();
    
    // Ensure complete content delivery
    const completeCourse = ensureCompleteCourseDelivery(course);
    
    return createSuccessResponse(
      completeCourse,
      'Course created successfully',
      undefined,
      201
    );
  }, 'Failed to create course');
}
