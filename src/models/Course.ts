import mongoose, { Document, Schema } from 'mongoose';

// Video subdocument interface
export interface IVideo extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  youtubeId: string;
  duration: number;
  isFree: boolean;
  order: number;
}

// Material subdocument interface
export interface IMaterial extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: 'pdf' | 'document' | 'image';
  url: string;
  order: number;
}

// Question subdocument interface
export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
}

// Quiz subdocument interface
export interface IQuiz extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  questions: IQuestion[];
  order: number;
}

// Section subdocument interface
export interface ISection extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  order: number;
  videos: IVideo[];
  materials: IMaterial[];
  quizzes: IQuiz[];
}

// Course document interface
export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  sections: ISection[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Video Schema
const VideoSchema = new Schema<IVideo>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  youtubeId: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: true,
});

// Material Schema
const MaterialSchema = new Schema<IMaterial>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'document', 'image'],
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: true,
});

// Question Schema
const QuestionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    type: String,
    required: true,
    trim: true,
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
  },
  explanation: {
    type: String,
    trim: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
}, {
  _id: true,
});

// Quiz Schema
const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [QuestionSchema],
  order: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: true,
});

// Section Schema
const SectionSchema = new Schema<ISection>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
  videos: [VideoSchema],
  materials: [MaterialSchema],
  quizzes: [QuizSchema],
}, {
  _id: true,
});

// Course Schema
const CourseSchema = new Schema<ICourse>({
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
  thumbnail: {
    type: String,
    required: true,
    trim: true,
  },
  sections: [SectionSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
CourseSchema.index({ title: 1 });
CourseSchema.index({ isActive: 1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ createdAt: -1 });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
