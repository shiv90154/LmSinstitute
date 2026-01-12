import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Order from '@/models/Order';
import { MockTest } from '@/models/MockTest';

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

    // Get counts
    const [totalUsers, totalCourses, totalOrders, totalTests] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Order.countDocuments(),
      MockTest.countDocuments(),
    ]);

    // Get recent orders with user details
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      totalUsers,
      totalCourses,
      totalOrders,
      totalTests,
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
