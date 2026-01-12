import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import MockTest from '@/models/MockTest';
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
  ensureCompleteTestDelivery,
  validateContentCompleteness,
} from '@/lib/utils/content-delivery';

export const dynamic = 'force-dynamic';

// GET /api/tests - Get all active mock tests
export async function GET(request: NextRequest) {
  return handleApiRoute(async () => {
    await connectDB();
    
    const { page, limit, skip } = extractQueryParams(new URL(request.url).searchParams);

    const tests = await MockTest.find({ isActive: true })
      .select('title description duration price createdAt sections')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await MockTest.countDocuments({ isActive: true });

    // Ensure complete content delivery for each test
    const completeTests = tests.map(ensureCompleteTestDelivery);

    return createSuccessResponse(
      { tests: completeTests },
      'Tests retrieved successfully',
      { page, limit, total }
    );
  }, 'Failed to fetch tests');
}

// POST /api/tests - Create new mock test (Admin only)
export async function POST(request: NextRequest) {
  return handleApiRoute(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return createUnauthorizedResponse('Admin access required');
    }

    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'duration', 'sections'];
    const missingFields = validateRequiredFields(body, requiredFields);
    
    if (missingFields.length > 0) {
      return createValidationErrorResponse(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate content completeness
    const contentErrors = validateContentCompleteness(body, 'test');
    if (contentErrors.length > 0) {
      return createValidationErrorResponse(contentErrors);
    }

    const { title, description, duration, sections, price } = body;

    const mockTest = new MockTest({
      title,
      description,
      duration,
      sections,
      price: price || 0,
      isActive: true
    });

    await mockTest.save();

    // Ensure complete content delivery
    const completeTest = ensureCompleteTestDelivery(mockTest);

    return createSuccessResponse(
      completeTest,
      'Test created successfully',
      undefined,
      201
    );
  }, 'Failed to create test');
}
