import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
    }

    await connectDB();

    // Get current period data
    const [
      totalRevenue,
      totalUsers,
      totalOrders,
      totalCourses,
      completedOrders,
      recentOrders,
      courses,
    ] = await Promise.all([
      // Total revenue from completed orders in current period
      Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Total users in current period
      User.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Total orders in current period
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Total courses
      Course.countDocuments(),
      
      // Completed orders for analysis
      Order.find({
        status: 'completed',
        createdAt: { $gte: startDate }
      }).lean(),
      
      // Recent orders for payment method analysis
      Order.find({
        createdAt: { $gte: startDate }
      }).lean(),
      
      // All courses for top courses analysis
      Course.find().lean(),
    ]);

    // Get previous period data for growth calculation
    const [
      previousRevenue,
      previousUsers,
      previousOrders,
      previousCourses,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: previousStartDate, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      User.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      Order.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      Course.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
    ]);

    // Calculate growth percentages
    const currentRevenue = totalRevenue[0]?.total || 0;
    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    const userGrowth = previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0;
    const orderGrowth = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;
    const courseGrowth = previousCourses > 0 ? ((totalCourses - previousCourses) / previousCourses) * 100 : 0;

    // Generate revenue by month data
    const revenueByMonth = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = completedOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      revenueByMonth.push({
        month: monthNames[monthStart.getMonth()],
        revenue: monthRevenue,
        orders: monthOrders.length,
      });
    }

    // Calculate top courses by revenue
    const courseRevenue = new Map();
    const courseEnrollments = new Map();
    
    completedOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.type === 'course') {
          const current = courseRevenue.get(item.itemId) || 0;
          courseRevenue.set(item.itemId, current + item.price);
          
          const enrollments = courseEnrollments.get(item.itemId) || 0;
          courseEnrollments.set(item.itemId, enrollments + 1);
        }
      });
    });

    const topCourses = Array.from(courseRevenue.entries())
      .map(([courseId, revenue]) => {
        const course = courses.find(c => c._id.toString() === courseId);
        return {
          _id: courseId,
          title: course?.title || 'Unknown Course',
          revenue,
          enrollments: courseEnrollments.get(courseId) || 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Payment methods analysis (simplified - assuming Razorpay)
    const paymentMethods = [
      {
        method: 'razorpay',
        count: completedOrders.length,
        revenue: currentRevenue,
      }
    ];

    // User registrations for the last 7 days
    const userRegistrations = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayUsers = await User.countDocuments({
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      userRegistrations.push({
        date: dayStart.toISOString(),
        count: dayUsers,
      });
    }

    // Order status distribution
    const orderStatusCounts = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrdersForStatus = orderStatusCounts.reduce((sum, item) => sum + item.count, 0);
    const orderStatus = orderStatusCounts.map(item => ({
      status: item._id,
      count: item.count,
      percentage: totalOrdersForStatus > 0 ? (item.count / totalOrdersForStatus) * 100 : 0,
    }));

    const analyticsData = {
      overview: {
        totalRevenue: currentRevenue,
        revenueGrowth,
        totalUsers,
        userGrowth,
        totalOrders,
        orderGrowth,
        totalCourses,
        courseGrowth,
      },
      revenueByMonth,
      topCourses,
      paymentMethods,
      userRegistrations,
      orderStatus,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
