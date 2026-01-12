import mongoose, { Document, Schema } from 'mongoose';

// SEO subdocument interface
export interface ISEO extends Document {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

// Blog post document interface
export interface IBlogPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  isPublished: boolean;
  seo: ISEO;
  createdAt: Date;
  updatedAt: Date;
}

// SEO Schema
const SEOSchema = new Schema<ISEO>({
  metaTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60,
  },
  metaDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },
  keywords: [{
    type: String,
    trim: true,
  }],
}, {
  _id: false,
});

// Blog Post Schema
const BlogPostSchema = new Schema<IBlogPost>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  featuredImage: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  seo: {
    type: SEOSchema,
    required: true,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to generate slug from title if not provided
BlogPostSchema.pre('save', async function(next) {
  if (!this.slug && this.title) {
    // Import the slug generator utility
    const { generateSlug } = await import('@/lib/utils/slug-generator');
    
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs and make unique
    while (await mongoose.models.BlogPost?.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

// Indexes for better query performance
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ author: 1 });
BlogPostSchema.index({ isPublished: 1 });
BlogPostSchema.index({ createdAt: -1 });

// Compound indexes
BlogPostSchema.index({ isPublished: 1, createdAt: -1 });
BlogPostSchema.index({ category: 1, isPublished: 1 });
BlogPostSchema.index({ tags: 1, isPublished: 1 });
BlogPostSchema.index({ author: 1, isPublished: 1 });

// Text index for search functionality
BlogPostSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text',
});

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
