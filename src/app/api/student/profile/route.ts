import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const userId = session.user.id;
    const body = await request.json();
    
    const { name, phone, address } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    user.name = name.trim();
    user.profile.phone = phone ? phone.trim() : undefined;
    user.profile.address = address ? address.trim() : undefined;

    await user.save();

    // Return updated profile data
    const updatedProfile = {
      name: user.name,
      email: user.email,
      phone: user.profile.phone,
      address: user.profile.address,
      joinedAt: user.createdAt.toISOString()
    };

    return NextResponse.json(updatedProfile, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const userId = session.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const profile = {
      name: user.name,
      email: user.email,
      phone: user.profile.phone,
      address: user.profile.address,
      joinedAt: user.createdAt.toISOString()
    };

    return NextResponse.json(profile, { status: 200 });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
