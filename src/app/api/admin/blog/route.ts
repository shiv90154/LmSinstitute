import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/models/BlogPost';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const posts = await BlogPost.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, excerpt, featuredImage, category, tags, isPublished, seo } = await request.json();

    if (!title || !content || !excerpt || !category || !seo?.metaTitle || !seo?.metaDescription) {
      return NextResponse.json(
        { success: false, error: 'Title, content, excerpt, category, meta title, and meta description are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const post = new BlogPost({
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags: tags || [],
      author: session.user.id,
      isPublished: isPublished || false,
      seo: {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        keywords: seo.keywords || [],
      },
    });

    await post.save();
    await post.populate('author', 'name email');

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
