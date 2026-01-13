import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  author: string;
  pages: number;
  language: string;
  subjects: string[];
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  thumbnail: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  pages: {
    type: Number,
    required: true,
    min: 1,
  },
  language: {
    type: String,
    required: true,
    trim: true,
  },
  subjects: [{
    type: String,
    trim: true,
  }],
  features: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
BookSchema.index({ title: 1 });
BookSchema.index({ isActive: 1 });
BookSchema.index({ price: 1 });
BookSchema.index({ createdAt: -1 });

export default mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);