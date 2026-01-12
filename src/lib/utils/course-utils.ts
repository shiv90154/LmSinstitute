import { ICourse, ISection, IVideo } from '@/models/Course';
import { ObjectId } from 'mongoose';

/**
 * Validates course data structure
 */
export function validateCourseData(courseData: Partial<ICourse>): string[] {
  const errors: string[] = [];
  
  if (!courseData.title || courseData.title.trim().length === 0) {
    errors.push('Course title is required');
  }
  
  if (!courseData.description || courseData.description.trim().length === 0) {
    errors.push('Course description is required');
  }
  
  if (courseData.price === undefined || courseData.price < 0) {
    errors.push('Course price must be a non-negative number');
  }
  
  if (!courseData.thumbnail || courseData.thumbnail.trim().length === 0) {
    errors.push('Course thumbnail is required');
  }
  
  return errors;
}

/**
 * Validates section data structure
 */
export function validateSectionData(sectionData: Partial<ISection>): string[] {
  const errors: string[] = [];
  
  if (!sectionData.title || sectionData.title.trim().length === 0) {
    errors.push('Section title is required');
  }
  
  if (sectionData.order === undefined || sectionData.order < 0) {
    errors.push('Section order must be a non-negative number');
  }
  
  return errors;
}

/**
 * Organizes sections by their order
 */
export function organizeSectionsByOrder(sections: ISection[]): ISection[] {
  return sections.sort((a, b) => a.order - b.order);
}

/**
 * Organizes videos within a section by their order
 */
export function organizeVideosByOrder(videos: IVideo[]): IVideo[] {
  return videos.sort((a, b) => a.order - b.order);
}

/**
 * Gets free videos from a section (only one per section)
 */
export function getFreeVideosFromSection(section: ISection): IVideo[] {
  const sortedVideos = organizeVideosByOrder(section.videos);
  return sortedVideos.filter(video => video.isFree).slice(0, 1); // Only one free video per section
}

/**
 * Checks if a user has access to a course
 */
export function hasAccessToCourse(userPurchases: ObjectId[], courseId: ObjectId): boolean {
  return userPurchases.some(purchaseId => purchaseId.toString() === courseId.toString());
}

/**
 * Filters course content based on user access
 */
export function filterCourseContentByAccess(
  course: ICourse, 
  hasAccess: boolean
): ICourse {
  if (hasAccess) {
    return course; // Return full course if user has access
  }
  
  // Filter to show only free content
  const filteredSections = course.sections.map(section => ({
    ...section,
    videos: getFreeVideosFromSection(section),
    materials: [], // No materials for free access
    quizzes: [] // No quizzes for free access
  }));
  
  return {
    ...course,
    sections: filteredSections as unknown as ISection[]
  } as ICourse;
}

/**
 * Calculates total course duration from all videos
 */
export function calculateCourseDuration(course: ICourse): number {
  return course.sections.reduce((totalDuration, section) => {
    const sectionDuration = section.videos.reduce((sectionTotal, video) => {
      return sectionTotal + video.duration;
    }, 0);
    return totalDuration + sectionDuration;
  }, 0);
}

/**
 * Gets course statistics
 */
export function getCourseStatistics(course: ICourse) {
  const totalSections = course.sections.length;
  const totalVideos = course.sections.reduce((total, section) => total + section.videos.length, 0);
  const totalMaterials = course.sections.reduce((total, section) => total + section.materials.length, 0);
  const totalQuizzes = course.sections.reduce((total, section) => total + section.quizzes.length, 0);
  const totalDuration = calculateCourseDuration(course);
  const freeVideos = course.sections.reduce((total, section) => {
    return total + section.videos.filter(video => video.isFree).length;
  }, 0);
  
  return {
    totalSections,
    totalVideos,
    totalMaterials,
    totalQuizzes,
    totalDuration,
    freeVideos
  };
}

/**
 * Validates YouTube video ID format
 */
export function validateYouTubeId(youtubeId: string): boolean {
  const youtubeRegex = /^[a-zA-Z0-9_-]{11}$/;
  return youtubeRegex.test(youtubeId);
}

/**
 * Ensures one free video per section rule
 */
export function enforceOneFreeVideoPerSection(videos: IVideo[]): IVideo[] {
  let freeVideoSet = false;
  return videos.map(video => {
    if (video.isFree && !freeVideoSet) {
      freeVideoSet = true;
      return video;
    } else {
      return { ...video, isFree: false } as IVideo;
    }
  });
}
