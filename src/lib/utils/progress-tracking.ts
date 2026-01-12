/**
 * Progress Tracking Utilities
 * Manages student progress tracking and completion calculations
 */

import { ICourseProgress, ISectionProgress, IVideoProgress } from '@/models/Progress';
import { ICourse, ISection, IVideo } from '@/models/Course';
import mongoose, { ObjectId } from 'mongoose';

export interface ProgressUpdate {
  type: 'video' | 'material' | 'quiz';
  itemId: string;
  sectionId: string;
  courseId: string;
  userId: string;
  data?: {
    watchedDuration?: number;
    totalDuration?: number;
    completed?: boolean;
    score?: number;
  };
}

export interface ProgressSummary {
  courseId: string;
  courseName: string;
  overallProgress: number;
  sectionsProgress: {
    sectionId: string;
    sectionName: string;
    progress: number;
    isCompleted: boolean;
    videosCompleted: number;
    totalVideos: number;
    materialsAccessed: number;
    totalMaterials: number;
    quizzesCompleted: number;
    totalQuizzes: number;
  }[];
  totalTimeSpent: number;
  isCompleted: boolean;
  certificateEarned: boolean;
  lastAccessedAt: Date;
}

/**
 * Calculates video completion percentage based on watched duration
 */
export function calculateVideoProgress(
  watchedDuration: number,
  totalDuration: number,
  completionThreshold: number = 80
): {
  percentage: number;
  isCompleted: boolean;
} {
  if (totalDuration <= 0) {
    return { percentage: 0, isCompleted: false };
  }

  const percentage = Math.min(Math.round((watchedDuration / totalDuration) * 100), 100);
  const isCompleted = percentage >= completionThreshold;

  return { percentage, isCompleted };
}

/**
 * Calculates section progress based on completed items
 */
export function calculateSectionProgress(
  videosProgress: IVideoProgress[],
  materialsAccessed: string[],
  quizzesCompleted: string[],
  totalVideos: number,
  totalMaterials: number,
  totalQuizzes: number
): {
  percentage: number;
  isCompleted: boolean;
} {
  const totalItems = totalVideos + totalMaterials + totalQuizzes;
  
  if (totalItems === 0) {
    return { percentage: 100, isCompleted: true };
  }

  const completedVideos = videosProgress.filter(video => video.isCompleted).length;
  const completedItems = completedVideos + materialsAccessed.length + quizzesCompleted.length;
  
  const percentage = Math.round((completedItems / totalItems) * 100);
  const isCompleted = percentage >= 100;

  return { percentage, isCompleted };
}

/**
 * Calculates overall course progress
 */
export function calculateCourseProgress(
  sectionsProgress: ISectionProgress[]
): {
  percentage: number;
  isCompleted: boolean;
} {
  if (sectionsProgress.length === 0) {
    return { percentage: 0, isCompleted: false };
  }

  const totalPercentage = sectionsProgress.reduce((sum, section) => {
    return sum + section.completionPercentage;
  }, 0);

  const percentage = Math.round(totalPercentage / sectionsProgress.length);
  const isCompleted = percentage >= 100;

  return { percentage, isCompleted };
}

/**
 * Creates initial progress structure for a course
 */
export function initializeCourseProgress(
  userId: string,
  course: ICourse
): Partial<ICourseProgress> {
  const sectionsProgress = course.sections.map(section => ({
    sectionId: section._id,
    videosProgress: section.videos.map(video => ({
      videoId: video._id,
      watchedDuration: 0,
      totalDuration: video.duration,
      completionPercentage: 0,
      isCompleted: false,
      lastWatchedAt: new Date(),
      watchCount: 0
    })),
    materialsAccessed: [],
    quizzesCompleted: [],
    completionPercentage: 0,
    isCompleted: false,
    lastAccessedAt: new Date()
  }));

  return {
    userId: new mongoose.Types.ObjectId(userId) as any,
    courseId: course._id,
    sectionsProgress: sectionsProgress as any,
    overallCompletionPercentage: 0,
    isCompleted: false,
    enrolledAt: new Date(),
    lastAccessedAt: new Date(),
    totalTimeSpent: 0,
    certificateEarned: false
  };
}

/**
 * Updates video progress
 */
export function updateVideoProgress(
  progress: ICourseProgress,
  sectionId: string,
  videoId: string,
  watchedDuration: number,
  totalDuration?: number
): ICourseProgress {
  const sectionProgress = progress.sectionsProgress.find(
    section => section.sectionId.toString() === sectionId
  );

  if (!sectionProgress) {
    throw new Error('Section not found in progress');
  }

  let videoProgress = sectionProgress.videosProgress.find(
    video => video.videoId.toString() === videoId
  );

  if (!videoProgress) {
    // Create new video progress if it doesn't exist
    videoProgress = {
      videoId: new mongoose.Types.ObjectId(videoId) as any,
      watchedDuration: 0,
      totalDuration: totalDuration || 0,
      completionPercentage: 0,
      isCompleted: false,
      lastWatchedAt: new Date(),
      watchCount: 1
    } as IVideoProgress;
    sectionProgress.videosProgress.push(videoProgress);
  }

  // Update video progress
  videoProgress.watchedDuration = Math.max(videoProgress.watchedDuration, watchedDuration);
  if (totalDuration) {
    videoProgress.totalDuration = totalDuration;
  }

  const videoProgressCalc = calculateVideoProgress(
    videoProgress.watchedDuration,
    videoProgress.totalDuration
  );

  videoProgress.completionPercentage = videoProgressCalc.percentage;
  videoProgress.isCompleted = videoProgressCalc.isCompleted;
  videoProgress.lastWatchedAt = new Date();
  videoProgress.watchCount += 1;

  // Update section progress
  updateSectionProgressCalculation(sectionProgress);

  // Update overall course progress
  updateCourseProgressCalculation(progress);

  // Update timestamps
  progress.lastAccessedAt = new Date();
  progress.totalTimeSpent += Math.min(watchedDuration - (videoProgress.watchedDuration - watchedDuration), 0);

  return progress;
}

/**
 * Marks material as accessed
 */
export function markMaterialAccessed(
  progress: ICourseProgress,
  sectionId: string,
  materialId: string
): ICourseProgress {
  const sectionProgress = progress.sectionsProgress.find(
    section => section.sectionId.toString() === sectionId
  );

  if (!sectionProgress) {
    throw new Error('Section not found in progress');
  }

  // Add material to accessed list if not already there
  const materialObjectId = new mongoose.Types.ObjectId(materialId);
  const isAlreadyAccessed = sectionProgress.materialsAccessed.some(
    id => id.toString() === materialId
  );

  if (!isAlreadyAccessed) {
    sectionProgress.materialsAccessed.push(materialObjectId as any);
  }

  // Update section progress
  updateSectionProgressCalculation(sectionProgress);

  // Update overall course progress
  updateCourseProgressCalculation(progress);

  // Update timestamps
  progress.lastAccessedAt = new Date();
  sectionProgress.lastAccessedAt = new Date();

  return progress;
}

/**
 * Marks quiz as completed
 */
export function markQuizCompleted(
  progress: ICourseProgress,
  sectionId: string,
  quizId: string,
  score?: number
): ICourseProgress {
  const sectionProgress = progress.sectionsProgress.find(
    section => section.sectionId.toString() === sectionId
  );

  if (!sectionProgress) {
    throw new Error('Section not found in progress');
  }

  // Add quiz to completed list if not already there
  const quizObjectId = new mongoose.Types.ObjectId(quizId);
  const isAlreadyCompleted = sectionProgress.quizzesCompleted.some(
    id => id.toString() === quizId
  );

  if (!isAlreadyCompleted) {
    sectionProgress.quizzesCompleted.push(quizObjectId as any);
  }

  // Update section progress
  updateSectionProgressCalculation(sectionProgress);

  // Update overall course progress
  updateCourseProgressCalculation(progress);

  // Update timestamps
  progress.lastAccessedAt = new Date();
  sectionProgress.lastAccessedAt = new Date();

  return progress;
}

/**
 * Updates section progress calculation
 */
function updateSectionProgressCalculation(sectionProgress: ISectionProgress): void {
  // This would need the total counts from the course structure
  // For now, we'll calculate based on what we have
  const totalVideos = sectionProgress.videosProgress.length;
  const completedVideos = sectionProgress.videosProgress.filter(video => video.isCompleted).length;
  const totalMaterials = sectionProgress.materialsAccessed.length; // This is not ideal, should be from course structure
  const totalQuizzes = sectionProgress.quizzesCompleted.length; // This is not ideal, should be from course structure

  const sectionProgressCalc = calculateSectionProgress(
    sectionProgress.videosProgress,
    sectionProgress.materialsAccessed.map(id => id.toString()),
    sectionProgress.quizzesCompleted.map(id => id.toString()),
    totalVideos,
    totalMaterials,
    totalQuizzes
  );

  sectionProgress.completionPercentage = sectionProgressCalc.percentage;
  sectionProgress.isCompleted = sectionProgressCalc.isCompleted;
}

/**
 * Updates course progress calculation
 */
function updateCourseProgressCalculation(progress: ICourseProgress): void {
  const courseProgressCalc = calculateCourseProgress(progress.sectionsProgress);
  
  progress.overallCompletionPercentage = courseProgressCalc.percentage;
  progress.isCompleted = courseProgressCalc.isCompleted;

  // Award certificate if course is completed and not already earned
  if (progress.isCompleted && !progress.certificateEarned) {
    progress.certificateEarned = true;
  }
}

/**
 * Generates progress summary for display
 */
export function generateProgressSummary(
  progress: ICourseProgress,
  course: ICourse
): ProgressSummary {
  const sectionsProgress = progress.sectionsProgress.map(sectionProgress => {
    const courseSection = course.sections.find(
      section => section._id.toString() === sectionProgress.sectionId.toString()
    );

    return {
      sectionId: sectionProgress.sectionId.toString(),
      sectionName: courseSection?.title || 'Unknown Section',
      progress: sectionProgress.completionPercentage,
      isCompleted: sectionProgress.isCompleted,
      videosCompleted: sectionProgress.videosProgress.filter(video => video.isCompleted).length,
      totalVideos: courseSection?.videos.length || 0,
      materialsAccessed: sectionProgress.materialsAccessed.length,
      totalMaterials: courseSection?.materials.length || 0,
      quizzesCompleted: sectionProgress.quizzesCompleted.length,
      totalQuizzes: courseSection?.quizzes.length || 0
    };
  });

  return {
    courseId: progress.courseId.toString(),
    courseName: course.title,
    overallProgress: progress.overallCompletionPercentage,
    sectionsProgress,
    totalTimeSpent: progress.totalTimeSpent,
    isCompleted: progress.isCompleted,
    certificateEarned: progress.certificateEarned,
    lastAccessedAt: progress.lastAccessedAt
  };
}

/**
 * Calculates learning analytics
 */
export function calculateLearningAnalytics(progress: ICourseProgress): {
  averageSessionTime: number;
  totalSessions: number;
  completionRate: number;
  timeToCompletion?: number;
  mostActiveDay: string;
  learningStreak: number;
} {
  const totalSessions = progress.sectionsProgress.reduce((sum, section) => {
    return sum + section.videosProgress.reduce((videoSum, video) => {
      return videoSum + video.watchCount;
    }, 0);
  }, 0);

  const averageSessionTime = totalSessions > 0 ? progress.totalTimeSpent / totalSessions : 0;
  
  const timeToCompletion = progress.isCompleted 
    ? (progress.updatedAt.getTime() - progress.enrolledAt.getTime()) / (1000 * 60 * 60 * 24) // days
    : undefined;

  return {
    averageSessionTime: Math.round(averageSessionTime),
    totalSessions,
    completionRate: progress.overallCompletionPercentage,
    timeToCompletion,
    mostActiveDay: 'Monday', // This would need more detailed tracking
    learningStreak: 1 // This would need more detailed tracking
  };
}

/**
 * Validates progress data integrity
 */
export function validateProgressIntegrity(progress: ICourseProgress): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check overall completion percentage
  if (progress.overallCompletionPercentage < 0 || progress.overallCompletionPercentage > 100) {
    errors.push('Overall completion percentage must be between 0 and 100');
  }

  // Check section progress
  progress.sectionsProgress.forEach((section, index) => {
    if (section.completionPercentage < 0 || section.completionPercentage > 100) {
      errors.push(`Section ${index + 1} completion percentage must be between 0 and 100`);
    }

    // Check video progress
    section.videosProgress.forEach((video, videoIndex) => {
      if (video.completionPercentage < 0 || video.completionPercentage > 100) {
        errors.push(`Section ${index + 1}, Video ${videoIndex + 1} completion percentage must be between 0 and 100`);
      }

      if (video.watchedDuration < 0) {
        errors.push(`Section ${index + 1}, Video ${videoIndex + 1} watched duration cannot be negative`);
      }

      if (video.totalDuration <= 0) {
        errors.push(`Section ${index + 1}, Video ${videoIndex + 1} total duration must be positive`);
      }

      if (video.watchedDuration > video.totalDuration) {
        errors.push(`Section ${index + 1}, Video ${videoIndex + 1} watched duration cannot exceed total duration`);
      }
    });
  });

  // Check timestamps
  if (progress.lastAccessedAt < progress.enrolledAt) {
    errors.push('Last accessed date cannot be before enrollment date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
