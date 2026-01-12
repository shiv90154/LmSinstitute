import { ObjectId } from 'mongoose';

export interface User {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'admin';
  profile: {
    phone?: string;
    address?: string;
  };
  purchases: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  _id: ObjectId;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  sections: Section[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  _id: ObjectId;
  title: string;
  order: number;
  videos: Video[];
  materials: Material[];
  quizzes: Quiz[];
}

export interface Video {
  _id: ObjectId;
  title: string;
  youtubeId: string;
  duration: number;
  isFree: boolean;
  order: number;
}

export interface Material {
  _id: ObjectId;
  title: string;
  type: 'pdf' | 'document' | 'image';
  url: string;
  order: number;
}

export interface Quiz {
  _id: ObjectId;
  title: string;
  questions: Question[];
  order: number;
}

export interface Question {
  _id: ObjectId;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
}

export interface Order {
  _id: ObjectId;
  userId: ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentDetails: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  type: 'course' | 'book' | 'material' | 'test';
  itemId: ObjectId;
  price: number;
  title: string;
}

export interface MockTest {
  _id: ObjectId;
  title: string;
  description: string;
  duration: number;
  sections: TestSection[];
  price: number;
  isActive: boolean;
  createdAt: Date;
}

export interface TestSection {
  _id: ObjectId;
  title: string;
  questions: Question[];
  timeLimit?: number;
}

export interface TestAttempt {
  _id: ObjectId;
  userId: ObjectId;
  testId: ObjectId;
  answers: Answer[];
  score: number;
  totalMarks: number;
  timeSpent: number;
  completedAt: Date;
}

export interface Answer {
  questionId: ObjectId;
  selectedOption: number;
  isCorrect: boolean;
}

export interface BlogPost {
  _id: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  author: ObjectId;
  isPublished: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
