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

// GET /api/mock-tests - Get all mock tests (public)
export async function GET(request: NextRequest) {
  return handleApiRoute(async () => {
    await connectDB();
    
    const { page, limit, skip, isActive } = extractQueryParams(new URL(request.url).searchParams);
    
    // Build query
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    const tests = await MockTest.find(query)
      .select('title description price duration sections isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await MockTest.countDocuments(query);
    
    // Ensure complete content delivery for each test
    const completeTests = tests.map(ensureCompleteTestDelivery);
    
    return createSuccessResponse(
      { tests: completeTests },
      'Mock tests retrieved successfully',
      { page, limit, total }
    );
  }, 'Failed to fetch mock tests');
}

// POST /api/mock-tests - Create new mock test (admin only)
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
    
    const { title, description, duration, price, sections, isActive } = body;
    
    const test = new MockTest({
      title,
      description,
      duration,
      price: price || 0,
      sections: sections || [],
      isActive: isActive !== undefined ? isActive : true
    });
    
    await test.save();
    
    // Ensure complete content delivery
    const completeTest = ensureCompleteTestDelivery(test);
    
    return createSuccessResponse(
      completeTest,
      'Mock test created successfully',
      undefined,
      201
    );
  }, 'Failed to create mock test');
}