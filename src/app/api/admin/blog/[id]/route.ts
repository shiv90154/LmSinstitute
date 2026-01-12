import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/models/BlogPost';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const post = await BlogPost.findByIdAndUpdate(
      params.id,
      {
        title,
        content,
        excerpt,
        featuredImage,
        category,
        tags: tags || [],
        isPublished: isPublished || false,
        seo: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          keywords: seo.keywords || [],
        },
      },
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const post = await BlogPost.findByIdAndDelete(params.id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}