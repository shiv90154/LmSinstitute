import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { checkVideoAccess, generateSecureEmbedUrl, obfuscateVideoSource } from '@/lib/utils/video-protection';
import mongoose from 'mongoose';

// GET /api/videos/[id]/access - Check video access and get secure URL
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the video in any course
    const course = await Course.findOne({
      'sections.videos._id': id
    }).lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Find the specific video and section
    let targetVideo = null;
    let targetSection = null;

    for (const section of course.sections) {
      const video = section.videos.find((v: any) => v._id.toString() === id);
      if (video) {
        targetVideo = video;
        targetSection = section;
        break;
      }
    }

    if (!targetVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found in course structure' },
        { status: 404 }
      );
    }

    // Check if user has access
    let userHasAccess = false;
    let userPurchases: string[] = [];

    if (session?.user?.id) {
      const user = await User.findById(session.user.id).select('purchases').lean();
      if (user) {
        userPurchases = user.purchases.map((p: any) => p.toString());
        userHasAccess = userPurchases.includes(course._id.toString());
      }
    }

    // Check video access permissions
    const accessCheck = checkVideoAccess(
      targetVideo.isFree,
      userHasAccess,
      userPurchases
    );

    if (!accessCheck.canAccess) {
      return NextResponse.json({
        success: false,
        error: 'Access denied',
        reason: accessCheck.reason,
        requiresPurchase: true,
        courseId: course._id,
        courseTitle: course.title,
        coursePrice: course.price
      }, { status: 403 });
    }

    // Generate secure embed URL
    const secureUrl = generateSecureEmbedUrl(targetVideo.youtubeId, {
      origin: request.headers.get('origin') || undefined,
      disableFullscreen: true
    });

    // Obfuscate source information
    const { displayId } = obfuscateVideoSource(targetVideo.youtubeId);

    // Log video access (for analytics)
    console.log(`Video access granted: ${displayId} to user ${session?.user?.id || 'anonymous'}`);

    return NextResponse.json({
      success: true,
      data: {
        videoId: displayId,
        title: targetVideo.title,
        duration: targetVideo.duration,
        embedUrl: secureUrl,
        isFree: targetVideo.isFree,
        courseTitle: course.title,
        sectionTitle: targetSection.title,
        accessType: targetVideo.isFree ? 'free' : 'premium',
        watermark: 'Career Path Institute'
      }
    });

  } catch (error) {
    console.error('Error checking video access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check video access' },
      { status: 500 }
    );
  }
}

// POST /api/videos/[id]/access - Track video interaction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, timestamp, progress } = body;

    // Validate action type
    const validActions = ['start', 'pause', 'resume', 'complete', 'seek'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the video to ensure it exists and user has access
    const course = await Course.findOne({
      'sections.videos._id': id
    }).lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Find the specific video
    let targetVideo = null;
    for (const section of course.sections) {
      const video = section.videos.find((v: any) => v._id.toString() === id);
      if (video) {
        targetVideo = video;
        break;
      }
    }

    if (!targetVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found in course structure' },
        { status: 404 }
      );
    }

    // Check user access
    const user = await User.findById(session.user.id).select('purchases').lean();
    const userHasAccess = user?.purchases.some((p: any) => p.toString() === course._id.toString()) || false;

    const accessCheck = checkVideoAccess(
      targetVideo.isFree,
      userHasAccess,
      user?.purchases.map((p: any) => p.toString()) || []
    );

    if (!accessCheck.canAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Log the interaction (in a real app, you might store this in a separate collection)
    const interactionLog = {
      userId: session.user.id,
      videoId: id,
      courseId: course._id,
      action,
      timestamp: timestamp || new Date(),
      progress: progress || 0,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    };

    console.log('Video interaction logged:', interactionLog);

    // In a production app, you would save this to a VideoInteraction model
    // await VideoInteraction.create(interactionLog);

    return NextResponse.json({
      success: true,
      message: 'Interaction logged successfully'
    });

  } catch (error) {
    console.error('Error logging video interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log interaction' },
      { status: 500 }
    );
  }
}