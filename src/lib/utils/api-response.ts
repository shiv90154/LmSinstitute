/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all API endpoints
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: PaginationParams,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
    };
  }

  return NextResponse.json(response, { status });
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  data?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };

  if (data) {
    response.data = data;
  }

  return NextResponse.json(response, { status });
}

/**
 * Creates a validation error response
 */
export function createValidationErrorResponse(
  errors: string[] | string,
  status: number = 400
): NextResponse {
  const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
  return createErrorResponse(`Validation failed: ${errorMessage}`, status);
}

/**
 * Creates an unauthorized error response
 */
export function createUnauthorizedResponse(
  message: string = 'Unauthorized access'
): NextResponse {
  return createErrorResponse(message, 401);
}

/**
 * Creates a not found error response
 */
export function createNotFoundResponse(
  resource: string = 'Resource'
): NextResponse {
  return createErrorResponse(`${resource} not found`, 404);
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Extracts and validates common query parameters
 */
export function extractQueryParams(searchParams: URLSearchParams) {
  const { page, limit, skip } = validatePaginationParams(searchParams);
  const search = searchParams.get('search')?.trim() || '';
  const category = searchParams.get('category')?.trim() || '';
  const isActive = searchParams.get('isActive');

  return {
    page,
    limit,
    skip,
    search,
    category,
    isActive: isActive ? isActive === 'true' : undefined,
  };
}

/**
 * Handles async API route execution with standardized error handling
 */
export async function handleApiRoute<T>(
  handler: () => Promise<NextResponse>,
  errorMessage: string = 'Internal server error'
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error(`API Error: ${errorMessage}`, error);
    return createErrorResponse(errorMessage, 500);
  }
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}

/**
 * Sanitizes data for API response (removes sensitive fields)
 */
export function sanitizeUserData(user: any): Record<string, any> {
  const { password, __v, ...sanitizedUser } = user.toObject ? user.toObject() : user;
  return {
    ...sanitizedUser,
    _id: sanitizedUser._id?.toString(),
  };
}

/**
 * Transforms MongoDB document for API response
 */
export function transformDocument(doc: any): Record<string, any> | null {
  if (!doc) return null;
  
  const transformed = doc.toObject ? doc.toObject() : doc;
  
  // Convert ObjectId to string
  if (transformed._id) {
    transformed._id = transformed._id.toString();
  }
  
  // Convert dates to ISO strings
  if (transformed.createdAt) {
    transformed.createdAt = transformed.createdAt.toISOString();
  }
  
  if (transformed.updatedAt) {
    transformed.updatedAt = transformed.updatedAt.toISOString();
  }
  
  // Remove MongoDB version field
  delete transformed.__v;
  
  return transformed;
}

/**
 * Transforms array of MongoDB documents for API response
 */
export function transformDocuments(docs: any[]): Record<string, any>[] {
  return docs.map(transformDocument).filter((doc): doc is Record<string, any> => doc !== null);
}
