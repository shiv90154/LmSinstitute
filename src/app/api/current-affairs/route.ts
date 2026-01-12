import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CurrentAffairs from '@/models/CurrentAffairs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET /api/current-affairs - Get current affairs with filtering and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };

    // Search functionality
    const search = searchParams.get('search');
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Filter by category
    const category = searchParams.get('category');
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Filter by date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Filter by month and year
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    if (month) {
      filter.month = parseInt(month);
    }
    if (year) {
      filter.year = parseInt(year);
    }

    // Filter by tags
    const tags = searchParams.get('tags');
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
    }

    // Sort options
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Execute queries
    const [currentAffairs, total] = await Promise.all([
      CurrentAffairs.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      CurrentAffairs.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        currentAffairs,
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
    console.error('Error fetching current affairs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current affairs' },
      { status: 500 }
    );
  }
}

// POST /api/current-affairs - Create new current affairs (Admin only)
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
      content,
      summary,
      category,
      tags,
      date,
      source,
      imageUrl,
    } = body;

    // Validate required fields
    if (!title || !content || !summary || !category || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new current affairs
    const currentAffairs = new CurrentAffairs({
      title,
      content,
      summary,
      category,
      tags: tags || [],
      date: new Date(date),
      source,
      imageUrl,
    });

    await currentAffairs.save();

    return NextResponse.json({
      success: true,
      data: currentAffairs,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating current affairs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create current affairs' },
      { status: 500 }
    );
  }
}
