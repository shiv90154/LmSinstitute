import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import StudyMaterial from '@/models/StudyMaterial';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET /api/study-materials - Get all study materials with filtering and search
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
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Filter by type
    const type = searchParams.get('type');
    if (type) {
      filter.type = type;
    }

    // Filter by category
    const category = searchParams.get('category');
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Filter by subject
    const subject = searchParams.get('subject');
    if (subject) {
      filter.subject = { $regex: subject, $options: 'i' };
    }

    // Filter by year
    const year = searchParams.get('year');
    if (year) {
      filter.year = parseInt(year);
    }

    // Filter by price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Execute queries
    const [materials, total] = await Promise.all([
      StudyMaterial.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      StudyMaterial.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        materials,
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
    console.error('Error fetching study materials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study materials' },
      { status: 500 }
    );
  }
}

// POST /api/study-materials - Create new study material (Admin only)
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
      category,
      subject,
      year,
      price,
      fileUrl,
      fileType,
      fileSize,
      thumbnail,
      tags,
    } = body;

    // Validate required fields
    if (!title || !description || !type || !category || !price || !fileUrl || !fileType || !fileSize) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new study material
    const studyMaterial = new StudyMaterial({
      title,
      description,
      type,
      category,
      subject,
      year,
      price,
      fileUrl,
      fileType,
      fileSize,
      thumbnail,
      tags: tags || [],
    });

    await studyMaterial.save();

    return NextResponse.json({
      success: true,
      data: studyMaterial,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating study material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create study material' },
      { status: 500 }
    );
  }
}
