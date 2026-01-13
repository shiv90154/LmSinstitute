import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';

export const dynamic = 'force-dynamic';

export interface ValidateCartRequest {
  items: Array<{
    id: string;
    type: 'course' | 'book' | 'material' | 'test';
    price: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ValidateCartRequest = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const validationData: Record<string, number> = {};
    const validationResults: Array<{
      id: string;
      type: string;
      isValid: boolean;
      currentPrice?: number;
      exists: boolean;
    }> = [];

    // Validate each item
    for (const item of items) {
      let exists = false;
      let currentPrice: number | undefined;
      let isValid = false;

      try {
        switch (item.type) {
          case 'course':
            const course = await Course.findById(item.id).select('price isActive');
            if (course && course.isActive) {
              exists = true;
              currentPrice = course.price;
              isValid = Math.abs(course.price - item.price) < 0.01;
              validationData[`${item.type}_${item.id}`] = course.price;
            }
            break;

          case 'book':
          case 'material':
          case 'test':
            // TODO: Add validation for other item types when models are available
            // For now, assume they're valid
            exists = true;
            currentPrice = item.price;
            isValid = true;
            validationData[`${item.type}_${item.id}`] = item.price;
            break;

          default:
            exists = false;
            isValid = false;
        }
      } catch (error) {
        console.error(`Error validating item ${item.id}:`, error);
        exists = false;
        isValid = false;
      }

      validationResults.push({
        id: item.id,
        type: item.type,
        isValid,
        currentPrice,
        exists,
      });
    }

    return NextResponse.json({
      success: true,
      validationData,
      results: validationResults,
      allValid: validationResults.every(result => result.isValid),
    });

  } catch (error) {
    console.error('Error validating cart:', error);
    return NextResponse.json(
      { error: 'Cart validation failed' },
      { status: 500 }
    );
  }
}
