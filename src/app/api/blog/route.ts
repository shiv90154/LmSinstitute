import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/models/BlogPost';
import {
  createSuccessResponse,
  createErrorResponse,
  extractQueryParams,
  handleApiRoute,
} from '@/lib/utils/api-response';
import {
  ensureCompleteBlogDelivery,
} from '@/lib/utils/content-delivery';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleApiRoute(async () => {
    const { page, limit, skip, search, category } = extractQueryParams(new URL(request.url).searchParams);

    await connectDB();

    // Build query for published posts only
    const query: any = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Get posts with pagination
    const posts = await BlogPost.find(query)
      .populate('author', 'name')
      .select('-content') // Exclude full content for list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await BlogPost.countDocuments(query);

    // Ensure complete content delivery for each post (without full content)
    const completePosts = posts.map(post => {
      const completePost = ensureCompleteBlogDelivery(post);
      // Remove content for list view
      const { content, ...postWithoutContent } = completePost;
      return postWithoutContent;
    });

    return createSuccessResponse(
      { posts: completePosts },
      'Blog posts retrieved successfully',
      { page, limit, total }
    );
  }, 'Failed to fetch blog posts');
}
