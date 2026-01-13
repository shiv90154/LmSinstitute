import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Book from '@/models/Book';
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

export const dynamic = 'force-dynamic';

// GET /api/books - Get all books (public)
export async function GET(request: NextRequest) {
  return handleApiRoute(async () => {
    await connectDB();
    
    const { page, limit, skip, isActive } = extractQueryParams(new URL(request.url).searchParams);
    
    // Build query
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    const books = await Book.find(query)
      .select('title description price originalPrice thumbnail author pages language subjects features isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Book.countDocuments(query);
    
    return createSuccessResponse(
      { books },
      'Books retrieved successfully',
      { page, limit, total }
    );
  }, 'Failed to fetch books');
}

// POST /api/books - Create new book (admin only)
export async function POST(request: NextRequest) {
  return handleApiRoute(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return createUnauthorizedResponse('Admin access required');
    }
    
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'thumbnail', 'author', 'pages', 'language'];
    const missingFields = validateRequiredFields(body, requiredFields);
    
    if (missingFields.length > 0) {
      return createValidationErrorResponse(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    const { title, description, price, originalPrice, thumbnail, author, pages, language, subjects, features, isActive } = body;
    
    const book = new Book({
      title,
      description,
      price,
      originalPrice,
      thumbnail,
      author,
      pages,
      language,
      subjects: subjects || [],
      features: features || [],
      isActive: isActive !== undefined ? isActive : true
    });
    
    await book.save();
    
    return createSuccessResponse(
      book,
      'Book created successfully',
      undefined,
      201
    );
  }, 'Failed to create book');
}