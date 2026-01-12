import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/models/BlogPost';
import ShareButton from '@/components/blog/ShareButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import RelatedPosts from '@/components/features/RelatedPosts';
import { generateMetadata as generateSEOMetadata, generateArticleStructuredData } from '@/lib/utils/seo-utils';

interface BlogPostPageProps {
    params: {
        slug: string;
    };
}

interface BlogPostData {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    category: string;
    tags: string[];
    author: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
    };
}

async function getBlogPost(slug: string): Promise<BlogPostData | null> {
    try {
        await connectDB();

        const post = await BlogPost.findOne({
            slug,
            isPublished: true
        })
            .populate('author', 'name')
            .lean();

        if (!post) {
            return null;
        }

        return {
            _id: post._id.toString(),
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            category: post.category,
            tags: post.tags,
            author: {
                _id: post.author._id.toString(),
                name: post.author.name,
            },
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            seo: post.seo,
        };
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = await getBlogPost(params.slug);

    if (!post) {
        return {
            title: 'Post Not Found | Career Path Institute',
            description: 'The requested blog post could not be found.',
        };
    }

    return generateSEOMetadata({
        title: post.seo.metaTitle || post.title,
        description: post.seo.metaDescription || post.excerpt,
        keywords: post.seo.keywords,
        author: post.author.name,
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        image: post.featuredImage,
        url: `/blog/${post.slug}`,
        type: 'article',
        category: post.category,
        tags: post.tags,
    });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await getBlogPost(params.slug);

    if (!post) {
        notFound();
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com'}/blog/${post.slug}`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Blog
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Article Header */}
                    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {post.featuredImage && (
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    {post.category}
                                </Badge>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <User className="h-4 w-4 mr-2" />
                                    {post.author.name}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                {post.excerpt}
                            </p>

                            {/* Tags */}
                            {post.tags.length > 0 && (
                                <div className="flex items-center gap-2 mb-6">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share Button */}
                            <div className="flex items-center justify-between border-b pb-6 mb-8">
                                <div className="text-sm text-gray-500">
                                    Share this article
                                </div>
                                <ShareButton
                                    title={post.title}
                                    excerpt={post.excerpt}
                                    url={shareUrl}
                                />
                            </div>

                            {/* Content */}
                            <div
                                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    </article>

                    {/* Related Posts */}
                    <div className="mt-12">
                        <RelatedPosts
                            currentPostId={post._id}
                            category={post.category}
                            tags={post.tags}
                        />
                    </div>
                </div>
            </div>

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateArticleStructuredData({
                        title: post.title,
                        description: post.excerpt,
                        author: post.author.name,
                        publishedTime: post.createdAt,
                        modifiedTime: post.updatedAt,
                        image: post.featuredImage,
                        url: `/blog/${post.slug}`,
                        keywords: post.seo.keywords,
                        category: post.category,
                        tags: post.tags,
                    })),
                }}
            />
        </div>
    );
}

export async function generateStaticParams() {
    try {
        await connectDB();

        const posts = await BlogPost.find({ isPublished: true })
            .select('slug')
            .lean();

        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}