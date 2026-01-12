import { ObjectId } from 'mongoose';

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

export interface MockTestData {
  _id: ObjectId;
  title: string;
  description: string;
  duration: number;
  sections: TestSection[];
  price: number;
  isActive: boolean;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomizes question options while maintaining correct answer mapping
 * @param question - Question to randomize
 * @returns Question with shuffled options and updated correct answer index
 */
export function randomizeQuestionOptions(question: TestQuestion): TestQuestion & { originalCorrectAnswer: number } {
  // Create array of options with their original indices
  const optionsWithIndices = question.options.map((option, index) => ({
    text: option,
    originalIndex: index
  }));
  
  // Shuffle the options
  const shuffledOptions = shuffleArray(optionsWithIndices);
  
  // Find new index of correct answer
  const newCorrectIndex = shuffledOptions.findIndex(
    option => option.originalIndex === question.correctAnswer
  );
  
  return {
    ...question,
    options: shuffledOptions.map(option => option.text),
    correctAnswer: newCorrectIndex,
    originalCorrectAnswer: question.correctAnswer
  };
}

/**
 * Randomizes all questions in a test while preserving structure
 * @param sections - Test sections to randomize
 * @returns Sections with randomized question options
 */
export function randomizeTestQuestions(sections: TestSection[]): TestSection[] {
  return sections.map(section => ({
    ...section,
    questions: section.questions.map(question => randomizeQuestionOptions(question))
  }));
}

/**
 * Calculates total marks for a test
 * @param sections - Test sections
 * @returns Total marks
 */
export function calculateTotalMarks(sections: TestSection[]): number {
  return sections.reduce((total, section) => 
    total + section.questions.reduce((sectionTotal, question) => 
      sectionTotal + question.marks, 0
    ), 0
  );
}

/**
 * Calculates total questions in a test
 * @param sections - Test sections
 * @returns Total number of questions
 */
export function calculateTotalQuestions(sections: TestSection[]): number {
  return sections.reduce((total, section) => total + section.questions.length, 0);
}

/**
 * Validates test structure
 * @param testData - Test data to validate
 * @returns Validation result with errors if any
 */
export function validateTestStructure(testData: Partial<MockTestData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!testData.title?.trim()) {
    errors.push('Test title is required');
  }

  if (!testData.description?.trim()) {
    errors.push('Test description is required');
  }

  if (!testData.duration || testData.duration <= 0) {
    errors.push('Test duration must be greater than 0');
  }

  if (testData.price === undefined || testData.price < 0) {
    errors.push('Test price must be 0 or greater');
  }

  if (!testData.sections || !Array.isArray(testData.sections) || testData.sections.length === 0) {
    errors.push('At least one section is required');
  } else {
    testData.sections.forEach((section, sectionIndex) => {
      if (!section.title?.trim()) {
        errors.push(`Section ${sectionIndex + 1}: Title is required`);
      }

      if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
        errors.push(`Section ${sectionIndex + 1}: At least one question is required`);
      } else {
        section.questions.forEach((question, questionIndex) => {
          if (!question.text?.trim()) {
            errors.push(`Section ${sectionIndex + 1}, Question ${questionIndex + 1}: Question text is required`);
          }

          if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
            errors.push(`Section ${sectionIndex + 1}, Question ${questionIndex + 1}: At least 2 options are required`);
          }

          if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
            errors.push(`Section ${sectionIndex + 1}, Question ${questionIndex + 1}: Invalid correct answer index`);
          }

          if (!question.marks || question.marks <= 0) {
            errors.push(`Section ${sectionIndex + 1}, Question ${questionIndex + 1}: Marks must be greater than 0`);
          }
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats test duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatTestDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculates test statistics
 * @param sections - Test sections
 * @returns Test statistics object
 */
export function calculateTestStats(sections: TestSection[]) {
  const totalQuestions = calculateTotalQuestions(sections);
  const totalMarks = calculateTotalMarks(sections);
  const sectionCount = sections.length;
  
  const questionsBySection = sections.map(section => ({
    title: section.title,
    questionCount: section.questions.length,
    marks: section.questions.reduce((total, q) => total + q.marks, 0)
  }));

  return {
    totalQuestions,
    totalMarks,
    sectionCount,
    questionsBySection,
    averageMarksPerQuestion: totalQuestions > 0 ? Math.round((totalMarks / totalQuestions) * 100) / 100 : 0
  };
}
