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

    await connectDB();

    // Simple analytics data for production
    const [totalUsers, totalCourses, totalOrders] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Order.countDocuments()
    ]);

    const analyticsData = {
      overview: {
        totalRevenue: 0,
        revenueGrowth: 0,
        totalUsers,
        userGrowth: 0,
        totalOrders,
        orderGrowth: 0,
        totalCourses,
        courseGrowth: 0,
      },
      revenueByMonth: [],
      topCourses: [],
      paymentMethods: [],
      userRegistrations: [],
      orderStatus: [],
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
