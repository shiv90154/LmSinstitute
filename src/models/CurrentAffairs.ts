import mongoose, { Document, Schema } from 'mongoose';

// Current Affairs document interface
export interface ICurrentAffairs extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  date: Date;
  month: number;
  year: number;
  source?: string;
  imageUrl?: string;
  isActive: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Current Affairs Bundle document interface
export interface ICurrentAffairsBundle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'monthly' | 'yearly';
  month?: number;
  year: number;
  price: number;
  currentAffairsIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  purchaseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Current Affairs Schema
const CurrentAffairsSchema = new Schema<ICurrentAffairs>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  date: {
    type: Date,
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1,
  },
  source: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Current Affairs Bundle Schema
const CurrentAffairsBundleSchema = new Schema<ICurrentAffairsBundle>({
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
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
  },
  month: {
    type: Number,
    min: 1,
    max: 12,
    validate: {
      validator: function(value: number) {
        return (this as any).type === 'yearly' || ((this as any).type === 'monthly' && value != null);
      },
      message: 'Month is required for monthly bundles'
    }
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currentAffairsIds: [{
    type: Schema.Types.ObjectId,
    ref: 'CurrentAffairs',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  purchaseCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for Current Affairs
CurrentAffairsSchema.index({ title: 1 });
CurrentAffairsSchema.index({ category: 1 });
CurrentAffairsSchema.index({ tags: 1 });
CurrentAffairsSchema.index({ date: -1 });
CurrentAffairsSchema.index({ month: 1, year: 1 });
CurrentAffairsSchema.index({ year: -1 });
CurrentAffairsSchema.index({ isActive: 1 });
CurrentAffairsSchema.index({ createdAt: -1 });

// Compound indexes for Current Affairs
CurrentAffairsSchema.index({ category: 1, date: -1 });
CurrentAffairsSchema.index({ year: -1, month: -1 });
CurrentAffairsSchema.index({ isActive: 1, date: -1 });

// Indexes for Current Affairs Bundle
CurrentAffairsBundleSchema.index({ type: 1 });
CurrentAffairsBundleSchema.index({ year: -1 });
CurrentAffairsBundleSchema.index({ month: 1, year: 1 });
CurrentAffairsBundleSchema.index({ isActive: 1 });
CurrentAffairsBundleSchema.index({ createdAt: -1 });

// Compound indexes for Current Affairs Bundle
CurrentAffairsBundleSchema.index({ type: 1, year: -1 });
CurrentAffairsBundleSchema.index({ type: 1, year: -1, month: -1 });
CurrentAffairsBundleSchema.index({ isActive: 1, createdAt: -1 });

// Pre-save middleware to set month and year from date
CurrentAffairsSchema.pre('save', function(next) {
  if (this.date) {
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
  }
});

export const CurrentAffairs = mongoose.models.CurrentAffairs || mongoose.model<ICurrentAffairs>('CurrentAffairs', CurrentAffairsSchema);
export const CurrentAffairsBundle = mongoose.models.CurrentAffairsBundle || mongoose.model<ICurrentAffairsBundle>('CurrentAffairsBundle', CurrentAffairsBundleSchema);

export default CurrentAffairs;
