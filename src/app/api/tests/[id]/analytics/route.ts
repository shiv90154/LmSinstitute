import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { TestAttempt } from '@/models/MockTest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { calculatePercentile } from '@/lib/utils/test-scoring';

// GET /api/tests/[id]/analytics - Get comprehensive test analytics
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
    
    // Get all attempts for this test
    const allAttempts = await TestAttempt.find({ testId: params.id })
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .lean();

    if (allAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalAttempts: 0,
          averageScore: 0,
          averagePercentage: 0,
          averageTimeSpent: 0,
          topPerformers: [],
          scoreDistribution: [],
          timeDistribution: [],
          userStats: null
        }
      });
    }

    // Calculate overall statistics
    const totalAttempts = allAttempts.length;
    const totalScore = allAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalPercentage = allAttempts.reduce((sum, attempt) => 
      sum + (attempt.score / attempt.totalMarks) * 100, 0
    );
    const totalTimeSpent = allAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);

    const averageScore = Math.round((totalScore / totalAttempts) * 100) / 100;
    const averagePercentage = Math.round((totalPercentage / totalAttempts) * 100) / 100;
    const averageTimeSpent = Math.round((totalTimeSpent / totalAttempts) * 100) / 100;

    // Get top performers (top 10 by score)
    const topPerformers = allAttempts
      .sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent)
      .slice(0, 10)
      .map((attempt, index) => ({
        rank: index + 1,
        userId: attempt.userId._id,
        userName: attempt.userId.name,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: Math.round((attempt.score / attempt.totalMarks) * 100),
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt
      }));

    // Score distribution (in 10% buckets)
    const scoreDistribution = Array(10).fill(0);
    allAttempts.forEach(attempt => {
      const percentage = (attempt.score / attempt.totalMarks) * 100;
      const bucket = Math.min(Math.floor(percentage / 10), 9);
      scoreDistribution[bucket]++;
    });

    const scoreDistributionLabeled = scoreDistribution.map((count, index) => ({
      range: `${index * 10}-${(index + 1) * 10}%`,
      count,
      percentage: Math.round((count / totalAttempts) * 100)
    }));

    // Time distribution (in buckets based on test duration)
    const maxTime = Math.max(...allAttempts.map(a => a.timeSpent));
    const timeDistribution = Array(5).fill(0);
    const bucketSize = Math.ceil(maxTime / 5);
    
    allAttempts.forEach(attempt => {
      const bucket = Math.min(Math.floor(attempt.timeSpent / bucketSize), 4);
      timeDistribution[bucket]++;
    });

    const timeDistributionLabeled = timeDistribution.map((count, index) => ({
      range: `${index * bucketSize}-${(index + 1) * bucketSize} min`,
      count,
      percentage: Math.round((count / totalAttempts) * 100)
    }));

    // Get user-specific stats if user has attempted
    let userStats = null;
    const userAttempts = allAttempts.filter(attempt => 
      attempt.userId._id.toString() === session.user.id
    );

    if (userAttempts.length > 0) {
      const bestAttempt = userAttempts.reduce((best, current) => 
        current.score > best.score ? current : best
      );
      
      const allScores = allAttempts.map(attempt => attempt.score);
      const userPercentile = calculatePercentile(bestAttempt.score, allScores);
      
      userStats = {
        totalAttempts: userAttempts.length,
        bestScore: bestAttempt.score,
        bestPercentage: Math.round((bestAttempt.score / bestAttempt.totalMarks) * 100),
        bestTimeSpent: bestAttempt.timeSpent,
        percentile: userPercentile,
        rank: allAttempts
          .sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent)
          .findIndex(attempt => attempt._id.toString() === bestAttempt._id.toString()) + 1,
        improvementTrend: userAttempts.length > 1 ? 
          userAttempts[userAttempts.length - 1].score - userAttempts[userAttempts.length - 2].score : 0
      };
    }

    // Additional insights
    const insights = {
      passRate: Math.round((allAttempts.filter(a => (a.score / a.totalMarks) >= 0.6).length / totalAttempts) * 100),
      excellentRate: Math.round((allAttempts.filter(a => (a.score / a.totalMarks) >= 0.9).length / totalAttempts) * 100),
      averageCompletionRate: Math.round((allAttempts.filter(a => a.answers.length > 0).length / totalAttempts) * 100),
      fastestCompletion: Math.min(...allAttempts.map(a => a.timeSpent)),
      slowestCompletion: Math.max(...allAttempts.map(a => a.timeSpent))
    };

    return NextResponse.json({
      success: true,
      data: {
        totalAttempts,
        averageScore,
        averagePercentage,
        averageTimeSpent,
        topPerformers,
        scoreDistribution: scoreDistributionLabeled,
        timeDistribution: timeDistributionLabeled,
        userStats,
        insights
      }
    });

  } catch (error) {
    console.error('Error fetching test analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test analytics' },
      { status: 500 }
    );
  }
}