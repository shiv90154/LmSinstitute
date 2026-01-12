import mongoose, { Document, Schema } from 'mongoose';

// Question subdocument interface
export interface ITestQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
}

// Test section subdocument interface
export interface ITestSection extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  questions: ITestQuestion[];
  timeLimit?: number;
}

// Mock test document interface
export interface IMockTest extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  duration: number; // in minutes
  sections: ITestSection[];
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Answer subdocument interface for test attempts
export interface IAnswer extends Document {
  _id: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  selectedOption: number;
  isCorrect: boolean;
  marksAwarded: number;
}

// Test attempt document interface
export interface ITestAttempt extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalMarks: number;
  timeSpent: number; // in minutes
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Test Question Schema
const TestQuestionSchema = new Schema<ITestQuestion>({
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

// Test Section Schema
const TestSectionSchema = new Schema<ITestSection>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [TestQuestionSchema],
  timeLimit: {
    type: Number,
    min: 1,
  },
}, {
  _id: true,
});

// Mock Test Schema
const MockTestSchema = new Schema<IMockTest>({
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
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  sections: [TestSectionSchema],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Answer Schema
const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  selectedOption: {
    type: Number,
    required: true,
    min: 0,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  marksAwarded: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: true,
});

// Test Attempt Schema
const TestAttemptSchema = new Schema<ITestAttempt>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'MockTest',
    required: true,
  },
  answers: [AnswerSchema],
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
  },
  completedAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for MockTest
MockTestSchema.index({ title: 1 });
MockTestSchema.index({ isActive: 1 });
MockTestSchema.index({ price: 1 });
MockTestSchema.index({ createdAt: -1 });

// Indexes for TestAttempt
TestAttemptSchema.index({ userId: 1 });
TestAttemptSchema.index({ testId: 1 });
TestAttemptSchema.index({ completedAt: -1 });
TestAttemptSchema.index({ score: -1 });

// Compound indexes for TestAttempt
TestAttemptSchema.index({ userId: 1, testId: 1 });
TestAttemptSchema.index({ userId: 1, completedAt: -1 });
TestAttemptSchema.index({ testId: 1, score: -1 });

export const MockTest = mongoose.models.MockTest || mongoose.model<IMockTest>('MockTest', MockTestSchema);
export const TestAttempt = mongoose.models.TestAttempt || mongoose.model<ITestAttempt>('TestAttempt', TestAttemptSchema);

export default MockTest;
