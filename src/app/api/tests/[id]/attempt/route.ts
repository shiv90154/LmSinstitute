import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import MockTest, { TestAttempt } from '@/models/MockTest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { calculateTestScore, validateTestTiming, generatePerformanceAnalytics } from '@/lib/utils/test-scoring';

export const dynamic = 'force-dynamic';

// Utility function to shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Utility function to randomize question options
function randomizeQuestions(sections: any[]) {
  return sections.map(section => ({
    ...section,
    questions: section.questions.map((question: any) => {
      // Create array of options with their original indices
      const optionsWithIndices = question.options.map((option: string, index: number) => ({
        text: option,
        originalIndex: index
      }));
      
      // Shuffle the options
      const shuffledOptions = shuffleArray(optionsWithIndices);
      
      // Find new index of correct answer
      const newCorrectIndex = shuffledOptions.findIndex(
        (option: any) => option.originalIndex === question.correctAnswer
      );
      
      return {
        ...question,
        options: shuffledOptions.map((option: any) => option.text),
        correctAnswer: newCorrectIndex,
        originalCorrectAnswer: question.correctAnswer // Keep track for scoring
      };
    })
  }));
}

// POST /api/tests/[id]/attempt - Start a new test attempt
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const test = await MockTest.findById(params.id).lean();
    
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    if (!test.isActive) {
      return NextResponse.json(
        { success: false, error: 'Test is not available' },
        { status: 403 }
      );
    }

    // Check if user has access to this test (implement access control logic here)
    // For now, we'll assume all authenticated users can attempt tests
    
    // Randomize questions for this attempt
    const randomizedSections = randomizeQuestions(test.sections);
    
    // Calculate total marks
    const totalMarks = randomizedSections.reduce((total, section) => 
      total + section.questions.reduce((sectionTotal: number, question: any) => 
        sectionTotal + question.marks, 0
      ), 0
    );

    // Return test with randomized questions (without correct answers for security)
    const testForAttempt = {
      _id: test._id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      totalMarks,
      sections: randomizedSections.map(section => ({
        _id: section._id,
        title: section.title,
        timeLimit: section.timeLimit,
        questions: section.questions.map((question: any) => ({
          _id: question._id,
          text: question.text,
          options: question.options,
          marks: question.marks
          // Note: correctAnswer is excluded for security
        }))
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        test: testForAttempt,
        startTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error starting test attempt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start test attempt' },
      { status: 500 }
    );
  }
}

// PUT /api/tests/[id]/attempt - Submit test attempt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { answers, startTime, endTime } = body;

    if (!answers || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const test = await MockTest.findById(params.id).lean();
    
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    // Validate timing
    const timingValidation = validateTestTiming(startTime, endTime, test.duration, 5);
    
    if (!timingValidation.isValid) {
      return NextResponse.json(
        { success: false, error: timingValidation.error },
        { status: 400 }
      );
    }

    // Calculate score using the scoring utility
    const scoringResult = calculateTestScore(test, answers);
    
    // Generate performance analytics
    const analytics = generatePerformanceAnalytics(scoringResult, timingValidation.actualDuration);

    // Save test attempt
    const testAttempt = new TestAttempt({
      userId: session.user.id,
      testId: params.id,
      answers: scoringResult.processedAnswers,
      score: scoringResult.score,
      totalMarks: scoringResult.totalMarks,
      timeSpent: timingValidation.actualDuration,
      completedAt: new Date(endTime)
    });

    await testAttempt.save();

    return NextResponse.json({
      success: true,
      data: {
        attemptId: testAttempt._id,
        score: scoringResult.score,
        totalMarks: scoringResult.totalMarks,
        percentage: scoringResult.percentage,
        timeSpent: timingValidation.actualDuration,
        completedAt: testAttempt.completedAt,
        sectionWiseScores: scoringResult.sectionWiseScores,
        analytics: {
          grade: analytics.grade,
          performance: analytics.performance,
          timeEfficiency: analytics.timeEfficiency,
          strengths: analytics.strengths,
          improvements: analytics.improvements
        }
      }
    });

  } catch (error) {
    console.error('Error submitting test attempt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit test attempt' },
      { status: 500 }
    );
  }
}