import { ObjectId } from 'mongoose';

export interface Answer {
  questionId: string;
  selectedOption: number;
}

export interface ProcessedAnswer {
  questionId: ObjectId;
  selectedOption: number;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface TestQuestion {
  _id: ObjectId;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
}

export interface TestSection {
  _id: ObjectId;
  title: string;
  questions: TestQuestion[];
  timeLimit?: number;
}

export interface MockTest {
  _id: ObjectId;
  title: string;
  description: string;
  duration: number;
  sections: TestSection[];
  price: number;
  isActive: boolean;
}

export interface ScoringResult {
  score: number;
  totalMarks: number;
  percentage: number;
  processedAnswers: ProcessedAnswer[];
  sectionWiseScores: SectionScore[];
}

export interface SectionScore {
  sectionId: ObjectId;
  sectionTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
}

/**
 * Calculates the score for a test attempt
 * @param test - The test data with correct answers
 * @param answers - The student's answers
 * @returns Scoring result with detailed breakdown
 */
export function calculateTestScore(test: MockTest, answers: Answer[]): ScoringResult {
  const processedAnswers: ProcessedAnswer[] = [];
  const sectionWiseScores: SectionScore[] = [];
  let totalScore = 0;
  let totalMarks = 0;

  // Create a map for quick answer lookup
  const answerMap = new Map<string, number>();
  answers.forEach(answer => {
    answerMap.set(answer.questionId, answer.selectedOption);
  });

  // Process each section
  for (const section of test.sections) {
    let sectionScore = 0;
    let sectionTotalMarks = 0;
    let correctAnswers = 0;

    // Process each question in the section
    for (const question of section.questions) {
      const questionId = question._id.toString();
      const selectedOption = answerMap.get(questionId);
      
      sectionTotalMarks += question.marks;
      totalMarks += question.marks;

      if (selectedOption !== undefined) {
        const isCorrect = selectedOption === question.correctAnswer;
        const marksAwarded = isCorrect ? question.marks : 0;
        
        sectionScore += marksAwarded;
        totalScore += marksAwarded;
        
        if (isCorrect) {
          correctAnswers++;
        }

        processedAnswers.push({
          questionId: question._id,
          selectedOption,
          isCorrect,
          marksAwarded
        });
      } else {
        // Question not answered
        processedAnswers.push({
          questionId: question._id,
          selectedOption: -1, // Indicates no answer
          isCorrect: false,
          marksAwarded: 0
        });
      }
    }

    // Calculate section-wise score
    const sectionPercentage = sectionTotalMarks > 0 ? (sectionScore / sectionTotalMarks) * 100 : 0;
    
    sectionWiseScores.push({
      sectionId: section._id,
      sectionTitle: section.title,
      score: sectionScore,
      totalMarks: sectionTotalMarks,
      percentage: Math.round(sectionPercentage * 100) / 100,
      correctAnswers,
      totalQuestions: section.questions.length
    });
  }

  const overallPercentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

  return {
    score: totalScore,
    totalMarks,
    percentage: Math.round(overallPercentage * 100) / 100,
    processedAnswers,
    sectionWiseScores
  };
}

/**
 * Validates test submission timing
 * @param startTime - Test start time
 * @param endTime - Test end time
 * @param allowedDuration - Allowed duration in minutes
 * @param bufferMinutes - Buffer time in minutes (default: 5)
 * @returns Validation result
 */
export function validateTestTiming(
  startTime: string,
  endTime: string,
  allowedDuration: number,
  bufferMinutes: number = 5
): { isValid: boolean; actualDuration: number; error?: string } {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      actualDuration: 0,
      error: 'Invalid start or end time'
    };
  }

  if (end <= start) {
    return {
      isValid: false,
      actualDuration: 0,
      error: 'End time must be after start time'
    };
  }

  const actualDurationMs = end.getTime() - start.getTime();
  const actualDurationMinutes = Math.round(actualDurationMs / (1000 * 60));
  const maxAllowedMinutes = allowedDuration + bufferMinutes;

  if (actualDurationMinutes > maxAllowedMinutes) {
    return {
      isValid: false,
      actualDuration: actualDurationMinutes,
      error: `Test duration exceeded. Maximum allowed: ${maxAllowedMinutes} minutes, actual: ${actualDurationMinutes} minutes`
    };
  }

  return {
    isValid: true,
    actualDuration: actualDurationMinutes
  };
}

/**
 * Generates performance analytics for a test attempt
 * @param scoringResult - The scoring result
 * @param timeSpent - Time spent in minutes
 * @returns Performance analytics
 */
export function generatePerformanceAnalytics(
  scoringResult: ScoringResult,
  timeSpent: number
): {
  grade: string;
  performance: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  timeEfficiency: 'Fast' | 'Optimal' | 'Slow';
  strengths: string[];
  improvements: string[];
} {
  const { percentage, sectionWiseScores } = scoringResult;
  
  // Determine grade
  let grade: string;
  let performance: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  
  if (percentage >= 90) {
    grade = 'A+';
    performance = 'Excellent';
  } else if (percentage >= 80) {
    grade = 'A';
    performance = 'Good';
  } else if (percentage >= 70) {
    grade = 'B';
    performance = 'Good';
  } else if (percentage >= 60) {
    grade = 'C';
    performance = 'Average';
  } else if (percentage >= 50) {
    grade = 'D';
    performance = 'Below Average';
  } else {
    grade = 'F';
    performance = 'Poor';
  }

  // Determine time efficiency (assuming 1.5 minutes per question is optimal)
  const totalQuestions = sectionWiseScores.reduce((sum, section) => sum + section.totalQuestions, 0);
  const optimalTime = totalQuestions * 1.5;
  
  let timeEfficiency: 'Fast' | 'Optimal' | 'Slow';
  if (timeSpent < optimalTime * 0.7) {
    timeEfficiency = 'Fast';
  } else if (timeSpent <= optimalTime * 1.3) {
    timeEfficiency = 'Optimal';
  } else {
    timeEfficiency = 'Slow';
  }

  // Identify strengths and areas for improvement
  const strengths: string[] = [];
  const improvements: string[] = [];

  sectionWiseScores.forEach(section => {
    if (section.percentage >= 80) {
      strengths.push(`Strong performance in ${section.sectionTitle} (${section.percentage.toFixed(1)}%)`);
    } else if (section.percentage < 60) {
      improvements.push(`Focus on ${section.sectionTitle} (${section.percentage.toFixed(1)}%)`);
    }
  });

  // Add general feedback
  if (timeEfficiency === 'Fast' && performance === 'Excellent') {
    strengths.push('Excellent time management and accuracy');
  } else if (timeEfficiency === 'Slow') {
    improvements.push('Work on time management and speed');
  }

  if (strengths.length === 0) {
    strengths.push('Completed the test successfully');
  }

  if (improvements.length === 0 && performance !== 'Excellent') {
    improvements.push('Continue practicing to improve overall performance');
  }

  return {
    grade,
    performance,
    timeEfficiency,
    strengths,
    improvements
  };
}

/**
 * Formats time duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted time string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculates percentile rank for a score
 * @param score - The score to rank
 * @param allScores - Array of all scores to compare against
 * @returns Percentile rank (0-100)
 */
export function calculatePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 0;
  
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const rank = sortedScores.filter(s => s < score).length;
  
  return Math.round((rank / sortedScores.length) * 100);
}
