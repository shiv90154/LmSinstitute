import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/models/BlogPost';
import mongoose from 'mongoose';
import { getRelatedPostsScores, getCategoryBasedRecommendations, getRecentPostsRecommendations } from '@/lib/utils/content-similarity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the current post for similarity comparison
    const currentPost = await BlogPost.findById(postId)
      .select('title content category tags')
      .lean();

    if (!currentPost) {
      return NextResponse.json(
        { success: false, error: 'Current post not found' },
        { status: 404 }
      );
    }

    // Get all other published posts as candidates
    const candidatePosts = await BlogPost.find({
      _id: { $ne: new mongoose.Types.ObjectId(postId) },
      isPublished: true,
    })
    .populate('author', 'name')
    .select('title content category tags author createdAt')
    .lean();

    let relatedPosts: any[] = [];

    if (candidatePosts.length > 0) {
      // Use advanced similarity algorithm
      const similarityScores = getRelatedPostsScores(
        {
          category: currentPost.category,
          tags: currentPost.tags,
          title: currentPost.title,
          content: currentPost.content,
        },
        candidatePosts.map(post => ({
          _id: post._id.toString(),
          category: post.category,
          tags: post.tags,
          title: post.title,
          content: post.content,
          createdAt: new Date(post.createdAt),
        })),
        limit
      );

      // Get posts based on similarity scores
      relatedPosts = similarityScores.map(score => {
        const post = candidatePosts.find(p => p._id.toString() === score.postId);
        return post ? {
          ...post,
          _id: post._id.toString(),
          similarityScore: score.score,
          similarityReasons: score.reasons,
        } : null;
      }).filter(Boolean);

      // If we don't have enough related posts, fill with category-based recommendations
      if (relatedPosts.length < limit) {
        const categoryRecommendations = getCategoryBasedRecommendations(
          currentPost.category,
          postId,
          candidatePosts.map(post => ({
            _id: post._id.toString(),
            category: post.category,
            createdAt: new Date(post.createdAt),
          })),
          limit - relatedPosts.length
        );

        const categoryPosts = categoryRecommendations.map(id => {
          const post = candidatePosts.find(p => p._id.toString() === id);
          return post ? {
            ...post,
            _id: post._id.toString(),
            similarityScore: 5, // Base score for category match
            similarityReasons: ['Same category'],
          } : null;
        }).filter(Boolean);

        relatedPosts.push(...categoryPosts);
      }

      // If still not enough, fill with recent posts
      if (relatedPosts.length < limit) {
        const recentRecommendations = getRecentPostsRecommendations(
          postId,
          candidatePosts.map(post => ({
            _id: post._id.toString(),
            createdAt: new Date(post.createdAt),
          })),
          limit - relatedPosts.length
        );

        const recentPosts = recentRecommendations.map(id => {
          const post = candidatePosts.find(p => p._id.toString() === id);
          return post ? {
            ...post,
            _id: post._id.toString(),
            similarityScore: 1, // Base score for recent posts
            similarityReasons: ['Recent post'],
          } : null;
        }).filter(Boolean);

        relatedPosts.push(...recentPosts);
      }
    }

    // Transform posts for response
    const transformedPosts = relatedPosts.slice(0, limit).map(post => ({
      _id: post._id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      author: {
        _id: post.author._id.toString(),
        name: post.author.name,
      },
      createdAt: post.createdAt.toISOString(),
      similarityScore: post.similarityScore,
      similarityReasons: post.similarityReasons,
    }));

    return NextResponse.json({
      success: true,
      posts: transformedPosts,
    });
  } catch (error) {
    console.error('Get related posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
}
