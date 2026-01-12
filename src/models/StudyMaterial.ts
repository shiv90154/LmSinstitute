import mongoose, { Document, Schema } from 'mongoose';

// Study Material document interface
export interface IStudyMaterial extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'previous-year-paper' | 'study-bundle' | 'notes' | 'reference-material';
  category: string;
  subject?: string;
  year?: number;
  price: number;
  fileUrl: string;
  fileType: 'pdf' | 'document' | 'zip';
  fileSize: number; // in bytes
  thumbnail?: string;
  tags: string[];
  isActive: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Study Material Schema
const StudyMaterialSchema = new Schema<IStudyMaterial>({
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
    enum: ['previous-year-paper', 'study-bundle', 'notes', 'reference-material'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
    min: 2000,
    max: new Date().getFullYear() + 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'document', 'zip'],
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
  },
  thumbnail: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
StudyMaterialSchema.index({ title: 1 });
StudyMaterialSchema.index({ type: 1 });
StudyMaterialSchema.index({ category: 1 });
StudyMaterialSchema.index({ subject: 1 });
StudyMaterialSchema.index({ year: -1 });
StudyMaterialSchema.index({ price: 1 });
StudyMaterialSchema.index({ isActive: 1 });
StudyMaterialSchema.index({ createdAt: -1 });
StudyMaterialSchema.index({ tags: 1 });

// Compound indexes
StudyMaterialSchema.index({ type: 1, category: 1 });
StudyMaterialSchema.index({ type: 1, year: -1 });
StudyMaterialSchema.index({ category: 1, subject: 1 });
StudyMaterialSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.models.StudyMaterial || mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);
