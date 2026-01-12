import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { CurrentAffairsBundle } from '@/models/CurrentAffairs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// GET /api/current-affairs/bundles - Get current affairs bundles
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };

    // Filter by type
    const type = searchParams.get('type');
    if (type) {
      filter.type = type;
    }

    // Filter by year
    const year = searchParams.get('year');
    if (year) {
      filter.year = parseInt(year);
    }

    // Filter by month (for monthly bundles)
    const month = searchParams.get('month');
    if (month) {
      filter.month = parseInt(month);
    }

    // Sort options
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Execute queries
    const [bundles, total] = await Promise.all([
      CurrentAffairsBundle.find(filter)
        .populate('currentAffairsIds', 'title date category')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      CurrentAffairsBundle.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        bundles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching current affairs bundles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current affairs bundles' },
      { status: 500 }
    );
  }
}

// POST /api/current-affairs/bundles - Create new current affairs bundle (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      type,
      month,
      year,
      price,
      currentAffairsIds,
    } = body;

    // Validate required fields
    if (!title || !description || !type || !year || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate month for monthly bundles
    if (type === 'monthly' && !month) {
      return NextResponse.json(
        { success: false, error: 'Month is required for monthly bundles' },
        { status: 400 }
      );
    }

    // Create new current affairs bundle
    const bundle = new CurrentAffairsBundle({
      title,
      description,
      type,
      month: type === 'monthly' ? month : undefined,
      year,
      price,
      currentAffairsIds: currentAffairsIds || [],
    });

    await bundle.save();

    return NextResponse.json({
      success: true,
      data: bundle,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating current affairs bundle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create current affairs bundle' },
      { status: 500 }
    );
  }
}
