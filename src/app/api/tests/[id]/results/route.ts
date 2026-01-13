import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { TestAttempt } from '@/models/MockTest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET /api/tests/[id]/results - Get test results and rankings
export async function GET(
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
    
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (attemptId) {
      // Get specific attempt details
      const attempt = await TestAttempt.findById(attemptId)
        .populate('userId', 'name email')
        .populate('testId', 'title description')
        .lean();

      if (!attempt) {
        return NextResponse.json(
          { success: false, error: 'Attempt not found' },
          { status: 404 }
        );
      }

      // Check if user owns this attempt or is admin
      if (attempt.userId._id.toString() !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Get ranking for this attempt
      const betterAttempts = await TestAttempt.countDocuments({
        testId: params.id,
        score: { $gt: attempt.score }
      });

      const totalAttempts = await TestAttempt.countDocuments({
        testId: params.id
      });

      const rank = betterAttempts + 1;
      const percentile = totalAttempts > 0 ? Math.round(((totalAttempts - rank + 1) / totalAttempts) * 100) : 0;

      return NextResponse.json({
        success: true,
        data: {
          attempt: {
            ...attempt,
            percentage: Math.round((attempt.score / attempt.totalMarks) * 100)
          },
          ranking: {
            rank,
            totalAttempts,
            percentile
          }
        }
      });
    } else {
      // Get user's attempts for this test
      const attempts = await TestAttempt.find({
        testId: params.id,
        userId: session.user.id
      })
        .sort({ completedAt: -1 })
        .lean();

      const attemptsWithPercentage = attempts.map(attempt => ({
        ...attempt,
        percentage: Math.round((attempt.score / attempt.totalMarks) * 100)
      }));

      // Get test leaderboard (top 10)
      const leaderboard = await TestAttempt.find({
        testId: params.id
      })
        .populate('userId', 'name')
        .sort({ score: -1, completedAt: 1 })
        .limit(10)
        .lean();

      const leaderboardWithRanks = leaderboard.map((attempt, index) => ({
        rank: index + 1,
        userId: attempt.userId._id,
        userName: attempt.userId.name,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: Math.round((attempt.score / attempt.totalMarks) * 100),
        completedAt: attempt.completedAt,
        timeSpent: attempt.timeSpent
      }));

      return NextResponse.json({
        success: true,
        data: {
          userAttempts: attemptsWithPercentage,
          leaderboard: leaderboardWithRanks,
          stats: {
            totalAttempts: await TestAttempt.countDocuments({ testId: params.id }),
            averageScore: await TestAttempt.aggregate([
              { $match: { testId: params.id } },
              { $group: { _id: null, avgScore: { $avg: '$score' }, avgPercentage: { $avg: { $multiply: [{ $divide: ['$score', '$totalMarks'] }, 100] } } } }
            ]).then(result => result[0] || { avgScore: 0, avgPercentage: 0 })
          }
        }
      });
    }

  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}