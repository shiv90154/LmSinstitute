/**
 * Access Control Utilities
 * Manages content access permissions and free content rules
 */

import { ICourse, ISection, IVideo } from '@/models/Course';
import { ObjectId } from 'mongoose';

export interface AccessControlResult {
  hasAccess: boolean;
  reason?: string;
  requiresPurchase?: boolean;
  freeContentAvailable?: boolean;
}

export interface UserAccessInfo {
  userId?: string;
  purchases: string[];
  isAuthenticated: boolean;
  role?: 'student' | 'admin';
}

/**
 * Checks if a user has purchased access to a specific course
 */
export function hasCoursePurchase(userPurchases: string[], courseId: string): boolean {
  return userPurchases.includes(courseId);
}

/**
 * Enforces the "one free video per section" rule
 * Ensures only the first video in each section is marked as free
 */
export function enforceOneFreeVideoPerSection(sections: ISection[]): ISection[] {
  return sections.map(section => ({
    ...section,
    videos: section.videos.map((video, index) => ({
      ...video,
      isFree: index === 0 // Only the first video is free
    }))
  })) as ISection[];
}

/**
 * Gets all free videos from a course (one per section)
 */
export function getFreeVideosFromCourse(course: ICourse): IVideo[] {
  const freeVideos: IVideo[] = [];
  
  course.sections.forEach(section => {
    // Sort videos by order to ensure we get the first one
    const sortedVideos = [...section.videos].sort((a, b) => a.order - b.order);
    const freeVideo = sortedVideos.find(video => video.isFree);
    
    if (freeVideo) {
      freeVideos.push(freeVideo);
    } else if (sortedVideos.length > 0) {
      // If no video is marked as free, make the first one free
      freeVideos.push({
        ...sortedVideos[0],
        isFree: true
      } as IVideo);
    }
  });
  
  return freeVideos;
}

/**
 * Filters course content based on user access level
 */
export function filterCourseByAccess(
  course: ICourse, 
  userAccess: UserAccessInfo
): ICourse {
  const hasFullAccess = userAccess.role === 'admin' || 
                       hasCoursePurchase(userAccess.purchases, course._id.toString());

  if (hasFullAccess) {
    return course; // Return full course content
  }

  // Filter to show only free content
  const filteredSections = course.sections.map(section => {
    const sortedVideos = [...section.videos].sort((a, b) => a.order - b.order);
    
    return {
      ...section,
      videos: sortedVideos.filter((video, index) => video.isFree || index === 0).slice(0, 1), // Only first/free video
      materials: [], // No materials for free access
      quizzes: [] // No quizzes for free access
    };
  });

  return {
    ...course,
    sections: filteredSections as unknown as ISection[]
  } as ICourse;
}

/**
 * Checks access to a specific video
 */
export function checkVideoAccess(
  video: IVideo,
  courseId: string,
  userAccess: UserAccessInfo
): AccessControlResult {
  // Admin always has access
  if (userAccess.role === 'admin') {
    return { hasAccess: true };
  }

  // Free videos are accessible to everyone
  if (video.isFree) {
    return { 
      hasAccess: true,
      freeContentAvailable: true
    };
  }

  // Check if user has purchased the course
  if (hasCoursePurchase(userAccess.purchases, courseId)) {
    return { hasAccess: true };
  }

  // Premium content requires purchase
  return {
    hasAccess: false,
    reason: 'Premium content requires course purchase',
    requiresPurchase: true,
    freeContentAvailable: false
  };
}

/**
 * Checks access to a specific section
 */
export function checkSectionAccess(
  section: ISection,
  courseId: string,
  userAccess: UserAccessInfo
): AccessControlResult {
  // Admin always has access
  if (userAccess.role === 'admin') {
    return { hasAccess: true };
  }

  // Check if user has purchased the course
  if (hasCoursePurchase(userAccess.purchases, courseId)) {
    return { hasAccess: true };
  }

  // For non-purchasers, check if there's any free content in the section
  const hasFreeContent = section.videos.some(video => video.isFree) ||
                        section.videos.length > 0; // First video is always free

  return {
    hasAccess: false,
    reason: 'Premium section requires course purchase',
    requiresPurchase: true,
    freeContentAvailable: hasFreeContent
  };
}

/**
 * Checks access to an entire course
 */
export function checkCourseAccess(
  course: ICourse,
  userAccess: UserAccessInfo
): AccessControlResult {
  // Admin always has access
  if (userAccess.role === 'admin') {
    return { hasAccess: true };
  }

  // Check if user has purchased the course
  if (hasCoursePurchase(userAccess.purchases, course._id.toString())) {
    return { hasAccess: true };
  }

  // Course is not purchased, but free content is available
  const freeVideos = getFreeVideosFromCourse(course);
  
  return {
    hasAccess: false,
    reason: 'Full course access requires purchase',
    requiresPurchase: true,
    freeContentAvailable: freeVideos.length > 0
  };
}

/**
 * Gets content summary for a user (what they can access)
 */
export function getContentSummary(
  course: ICourse,
  userAccess: UserAccessInfo
): {
  totalSections: number;
  accessibleSections: number;
  totalVideos: number;
  accessibleVideos: number;
  freeVideos: number;
  totalMaterials: number;
  accessibleMaterials: number;
  totalQuizzes: number;
  accessibleQuizzes: number;
} {
  const hasFullAccess = userAccess.role === 'admin' || 
                       hasCoursePurchase(userAccess.purchases, course._id.toString());

  const totalSections = course.sections.length;
  const totalVideos = course.sections.reduce((sum, section) => sum + section.videos.length, 0);
  const totalMaterials = course.sections.reduce((sum, section) => sum + section.materials.length, 0);
  const totalQuizzes = course.sections.reduce((sum, section) => sum + section.quizzes.length, 0);
  
  const freeVideos = getFreeVideosFromCourse(course).length;

  if (hasFullAccess) {
    return {
      totalSections,
      accessibleSections: totalSections,
      totalVideos,
      accessibleVideos: totalVideos,
      freeVideos,
      totalMaterials,
      accessibleMaterials: totalMaterials,
      totalQuizzes,
      accessibleQuizzes: totalQuizzes
    };
  }

  // Limited access - only free content
  return {
    totalSections,
    accessibleSections: totalSections, // Can see sections but limited content
    totalVideos,
    accessibleVideos: freeVideos,
    freeVideos,
    totalMaterials,
    accessibleMaterials: 0, // No materials for free access
    totalQuizzes,
    accessibleQuizzes: 0 // No quizzes for free access
  };
}

/**
 * Validates that free content rules are properly enforced
 */
export function validateFreeContentRules(course: ICourse): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  course.sections.forEach((section, sectionIndex) => {
    const freeVideos = section.videos.filter(video => video.isFree);
    
    // Check: Each section should have exactly one free video
    if (freeVideos.length === 0) {
      violations.push(`Section ${sectionIndex + 1} (${section.title}) has no free videos`);
    } else if (freeVideos.length > 1) {
      violations.push(`Section ${sectionIndex + 1} (${section.title}) has ${freeVideos.length} free videos (should be 1)`);
    }

    // Check: Free video should be the first one by order
    if (freeVideos.length === 1) {
      const sortedVideos = [...section.videos].sort((a, b) => a.order - b.order);
      if (sortedVideos.length > 0 && !sortedVideos[0].isFree) {
        violations.push(`Section ${sectionIndex + 1} (${section.title}) free video is not the first video by order`);
      }
    }
  });

  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Auto-corrects free content rules for a course
 */
export function autoCorrectFreeContentRules(course: ICourse): ICourse {
  const correctedSections = course.sections.map(section => {
    const sortedVideos = [...section.videos].sort((a, b) => a.order - b.order);
    
    const correctedVideos = sortedVideos.map((video, index) => ({
      ...video,
      isFree: index === 0 // Only first video is free
    }));

    return {
      ...section,
      videos: correctedVideos
    };
  });

  return {
    ...course,
    sections: correctedSections as unknown as ISection[]
  } as ICourse;
}
