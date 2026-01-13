import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { generateJWT } from '@/lib/auth/jwt-utils';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get fresh user data from database
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new JWT token
    const newToken = generateJWT({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return NextResponse.json(
      { 
        message: 'Token refreshed successfully',
        user: userData,
        token: newToken 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
