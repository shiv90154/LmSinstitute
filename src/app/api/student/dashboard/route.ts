import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Course from '@/models/Course';
import { MockTest, TestAttempt } from '@/models/MockTest';
import CourseProgress from '@/models/Progress';
import {
  createSuccessResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
  handleApiRoute,
  transformDocument,
} from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleApiRoute(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'student') {
      return createUnauthorizedResponse('Student access required');
    }

    await connectDB();
    
    const userId = session.user.id;

    // Get user profile information
    const user = await User.findById(userId);
    if (!user) {
      return createNotFoundResponse('User');
    }

    // Get user's completed orders
    const completedOrders = await Order.find({
      userId,
      status: 'completed'
    }).sort({ createdAt: -1 });

    // Extract purchased item IDs by type
    const purchasedCourseIds = [];
    const purchasedBookIds = [];
    const purchasedMaterialIds = [];
    const purchasedTestIds = [];

    for (const order of completedOrders) {
      for (const item of order.items) {
        switch (item.type) {
          case 'course':
            purchasedCourseIds.push(item.itemId);
            break;
          case 'book':
            purchasedBookIds.push(item.itemId);
            break;
          case 'material':
            purchasedMaterialIds.push(item.itemId);
            break;
          case 'test':
            purchasedTestIds.push(item.itemId);
            break;
        }
      }
    }

    // Get purchased courses with progress
    const courses = [];
    if (purchasedCourseIds.length > 0) {
      const purchasedCourses = await Course.find({
        _id: { $in: purchasedCourseIds },
        isActive: true
      });

      for (const course of purchasedCourses) {
        const progress = await CourseProgress.findOne({
          userId,
          courseId: course._id
        });

        const totalSections = course.sections.length;
        const completedSections = progress 
          ? progress.sectionsProgress.filter((s: any) => s.isCompleted).length 
          : 0;

        courses.push({
          _id: course._id.toString(),
          title: course.title,
          thumbnail: course.thumbnail,
          progress: progress ? progress.overallCompletionPercentage : 0,
          totalSections,
          completedSections,
          lastAccessed: progress ? progress.lastAccessedAt.toISOString() : course.createdAt.toISOString()
        });
      }
    }

    // Get books and study materials from orders
    const books = [];
    const studyMaterials = [];

    for (const order of completedOrders) {
      for (const item of order.items) {
        const itemData = {
          _id: item.itemId.toString(),
          title: item.title,
          type: item.type,
          purchaseDate: order.createdAt.toISOString()
        };

        if (item.type === 'book') {
          books.push(itemData);
        } else if (item.type === 'material') {
          studyMaterials.push(itemData);
        }
      }
    }

    // Get test history
    const testAttempts = await TestAttempt.find({ userId })
      .populate('testId', 'title')
      .sort({ completedAt: -1 });

    const testHistory = testAttempts.map(attempt => ({
      _id: attempt._id.toString(),
      testTitle: attempt.testId.title,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: Math.round((attempt.score / attempt.totalMarks) * 100),
      completedAt: attempt.completedAt.toISOString(),
      timeSpent: attempt.timeSpent
    }));

    // Get payment history
    const allOrders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    const paymentHistory = allOrders.map(order => ({
      _id: order._id.toString(),
      totalAmount: order.totalAmount,
      status: order.status,
      items: order.items.map((item: any) => ({
        title: item.title,
        type: item.type,
        price: item.price
      })),
      createdAt: order.createdAt.toISOString()
    }));

    // Prepare profile data
    const profile = {
      name: user.name,
      email: user.email,
      phone: user.profile.phone,
      address: user.profile.address,
      joinedAt: user.createdAt.toISOString()
    };

    const dashboardData = {
      courses,
      books,
      studyMaterials,
      testHistory,
      paymentHistory,
      profile,
      summary: {
        totalCourses: courses.length,
        totalBooks: books.length,
        totalMaterials: studyMaterials.length,
        totalTests: testHistory.length,
        totalOrders: paymentHistory.length,
        averageTestScore: testHistory.length > 0 
          ? Math.round(testHistory.reduce((sum, test) => sum + test.percentage, 0) / testHistory.length)
          : 0
      }
    };

    return createSuccessResponse(
      dashboardData,
      'Dashboard data retrieved successfully'
    );
  }, 'Failed to fetch dashboard data');
}
