/**
 * Content Delivery Utilities
 * Ensures complete and consistent content delivery across all endpoints
 */

import { Types } from 'mongoose';

export interface CourseContentDelivery {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  isActive: boolean;
  sections: SectionContentDelivery[];
  createdAt: string;
  updatedAt: string;
  totalVideos: number;
  totalMaterials: number;
  totalQuizzes: number;
  estimatedDuration: number;
}

export interface SectionContentDelivery {
  _id: string;
  title: string;
  order: number;
  videos: VideoContentDelivery[];
  materials: MaterialContentDelivery[];
  quizzes: QuizContentDelivery[];
  totalItems: number;
  estimatedDuration: number;
}

export interface VideoContentDelivery {
  _id: string;
  title: string;
  youtubeId: string;
  duration: number;
  isFree: boolean;
  order: number;
  thumbnail?: string;
  description?: string;
}

export interface MaterialContentDelivery {
  _id: string;
  title: string;
  type: 'pdf' | 'document' | 'link';
  url: string;
  size?: number;
  order: number;
  description?: string;
}

export interface QuizContentDelivery {
  _id: string;
  title: string;
  questions: QuestionContentDelivery[];
  timeLimit?: number;
  order: number;
  totalMarks: number;
  passingMarks: number;
}

export interface QuestionContentDelivery {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
  type: 'mcq' | 'multiple' | 'true-false';
}

export interface TestContentDelivery {
  _id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  sections: TestSectionContentDelivery[];
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestSectionContentDelivery {
  _id: string;
  title: string;
  questions: QuestionContentDelivery[];
  timeLimit?: number;
  totalQuestions: number;
  totalMarks: number;
}

export interface BlogContentDelivery {
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
  isPublished: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  wordCount: number;
}

/**
 * Ensures complete course content delivery
 */
export function ensureCompleteCourseDelivery(course: any): CourseContentDelivery {
  const sections = course.sections || [];
  
  let totalVideos = 0;
  let totalMaterials = 0;
  let totalQuizzes = 0;
  let estimatedDuration = 0;

  const completeSections: SectionContentDelivery[] = sections.map((section: any) => {
    const videos = section.videos || [];
    const materials = section.materials || [];
    const quizzes = section.quizzes || [];

    // Count totals
    totalVideos += videos.length;
    totalMaterials += materials.length;
    totalQuizzes += quizzes.length;

    // Calculate section duration
    const sectionDuration = videos.reduce((sum: number, video: any) => sum + (video.duration || 0), 0);
    estimatedDuration += sectionDuration;

    const completeVideos: VideoContentDelivery[] = videos.map((video: any) => ({
      _id: video._id?.toString() || new Types.ObjectId().toString(),
      title: video.title || 'Untitled Video',
      youtubeId: video.youtubeId || '',
      duration: video.duration || 0,
      isFree: video.isFree || false,
      order: video.order || 0,
      thumbnail: video.thumbnail,
      description: video.description,
    }));

    const completeMaterials: MaterialContentDelivery[] = materials.map((material: any) => ({
      _id: material._id?.toString() || new Types.ObjectId().toString(),
      title: material.title || 'Untitled Material',
      type: material.type || 'pdf',
      url: material.url || '',
      size: material.size,
      order: material.order || 0,
      description: material.description,
    }));

    const completeQuizzes: QuizContentDelivery[] = quizzes.map((quiz: any) => {
      const questions = quiz.questions || [];
      const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
      
      return {
        _id: quiz._id?.toString() || new Types.ObjectId().toString(),
        title: quiz.title || 'Untitled Quiz',
        questions: questions.map((q: any) => ({
          _id: q._id?.toString() || new Types.ObjectId().toString(),
          text: q.text || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation,
          marks: q.marks || 1,
          type: q.type || 'mcq',
        })),
        timeLimit: quiz.timeLimit,
        order: quiz.order || 0,
        totalMarks,
        passingMarks: quiz.passingMarks || Math.ceil(totalMarks * 0.6),
      };
    });

    return {
      _id: section._id?.toString() || new Types.ObjectId().toString(),
      title: section.title || 'Untitled Section',
      order: section.order || 0,
      videos: completeVideos,
      materials: completeMaterials,
      quizzes: completeQuizzes,
      totalItems: completeVideos.length + completeMaterials.length + completeQuizzes.length,
      estimatedDuration: sectionDuration,
    };
  });

  return {
    _id: course._id?.toString() || new Types.ObjectId().toString(),
    title: course.title || 'Untitled Course',
    description: course.description || '',
    price: course.price || 0,
    thumbnail: course.thumbnail || '',
    isActive: course.isActive !== false,
    sections: completeSections,
    createdAt: course.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: course.updatedAt?.toISOString() || new Date().toISOString(),
    totalVideos,
    totalMaterials,
    totalQuizzes,
    estimatedDuration,
  };
}

/**
 * Ensures complete test content delivery
 */
export function ensureCompleteTestDelivery(test: any): TestContentDelivery {
  const sections = test.sections || [];
  
  let totalQuestions = 0;
  let totalMarks = 0;

  const completeSections: TestSectionContentDelivery[] = sections.map((section: any) => {
    const questions = section.questions || [];
    const sectionQuestions = questions.length;
    const sectionMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);

    totalQuestions += sectionQuestions;
    totalMarks += sectionMarks;

    return {
      _id: section._id?.toString() || new Types.ObjectId().toString(),
      title: section.title || 'Untitled Section',
      questions: questions.map((q: any) => ({
        _id: q._id?.toString() || new Types.ObjectId().toString(),
        text: q.text || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation,
        marks: q.marks || 1,
        type: q.type || 'mcq',
      })),
      timeLimit: section.timeLimit,
      totalQuestions: sectionQuestions,
      totalMarks: sectionMarks,
    };
  });

  return {
    _id: test._id?.toString() || new Types.ObjectId().toString(),
    title: test.title || 'Untitled Test',
    description: test.description || '',
    duration: test.duration || 60,
    price: test.price || 0,
    isActive: test.isActive !== false,
    sections: completeSections,
    totalQuestions,
    totalMarks,
    createdAt: test.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: test.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Ensures complete blog content delivery
 */
export function ensureCompleteBlogDelivery(post: any): BlogContentDelivery {
  const content = post.content || '';
  const wordCount = content.split(/\s+/).filter((word: string) => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  return {
    _id: post._id?.toString() || new Types.ObjectId().toString(),
    title: post.title || 'Untitled Post',
    slug: post.slug || '',
    content,
    excerpt: post.excerpt || content.substring(0, 200) + '...',
    featuredImage: post.featuredImage,
    category: post.category || 'General',
    tags: post.tags || [],
    author: {
      _id: post.author?._id?.toString() || post.author?.toString() || '',
      name: post.author?.name || 'Unknown Author',
    },
    isPublished: post.isPublished !== false,
    seo: {
      metaTitle: post.seo?.metaTitle || post.title || '',
      metaDescription: post.seo?.metaDescription || post.excerpt || '',
      keywords: post.seo?.keywords || [],
    },
    createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
    readingTime,
    wordCount,
  };
}

/**
 * Validates that all required content fields are present
 */
export function validateContentCompleteness(content: any, type: 'course' | 'test' | 'blog'): string[] {
  const errors: string[] = [];

  switch (type) {
    case 'course':
      if (!content.title) errors.push('Course title is required');
      if (!content.description) errors.push('Course description is required');
      if (content.price === undefined || content.price < 0) errors.push('Valid course price is required');
      if (!content.thumbnail) errors.push('Course thumbnail is required');
      if (!content.sections || !Array.isArray(content.sections)) {
        errors.push('Course sections are required');
      } else {
        content.sections.forEach((section: any, index: number) => {
          if (!section.title) errors.push(`Section ${index + 1} title is required`);
          if (section.order === undefined) errors.push(`Section ${index + 1} order is required`);
        });
      }
      break;

    case 'test':
      if (!content.title) errors.push('Test title is required');
      if (!content.description) errors.push('Test description is required');
      if (!content.duration || content.duration <= 0) errors.push('Valid test duration is required');
      if (!content.sections || !Array.isArray(content.sections) || content.sections.length === 0) {
        errors.push('Test must have at least one section');
      } else {
        content.sections.forEach((section: any, sIndex: number) => {
          if (!section.title) errors.push(`Test section ${sIndex + 1} title is required`);
          if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
            errors.push(`Test section ${sIndex + 1} must have at least one question`);
          } else {
            section.questions.forEach((question: any, qIndex: number) => {
              if (!question.text) errors.push(`Question ${qIndex + 1} in section ${sIndex + 1} text is required`);
              if (!question.options || question.options.length < 2) {
                errors.push(`Question ${qIndex + 1} in section ${sIndex + 1} must have at least 2 options`);
              }
              if (question.correctAnswer < 0 || question.correctAnswer >= (question.options?.length || 0)) {
                errors.push(`Question ${qIndex + 1} in section ${sIndex + 1} has invalid correct answer`);
              }
            });
          }
        });
      }
      break;

    case 'blog':
      if (!content.title) errors.push('Blog post title is required');
      if (!content.content) errors.push('Blog post content is required');
      if (!content.slug) errors.push('Blog post slug is required');
      if (!content.category) errors.push('Blog post category is required');
      break;
  }

  return errors;
}
