'use client';

import React, { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { cn } from '@/lib/utils';
import { Lock, Play } from 'lucide-react';

interface SecureVideoContainerProps {
    youtubeId: string;
    title: string;
    duration: number;
    isFree: boolean;
    hasAccess: boolean;
    className?: string;
    onVideoStart?: () => void;
    onVideoEnd?: () => void;
    onAccessDenied?: () => void;
}

export default function SecureVideoContainer({
    youtubeId,
    title,
    duration,
    isFree,
    hasAccess,
    className,
    onVideoStart,
    onVideoEnd,
    onAccessDenied
}: SecureVideoContainerProps) {
    const [showVideo, setShowVideo] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Determine if user can access this video
    const canAccess = isFree || hasAccess;

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handlePlayClick = () => {
        if (!canAccess) {
            if (onAccessDenied) {
                onAccessDenied();
            }
            return;
        }
        setShowVideo(true);
    };

    const handleVideoStart = () => {
        if (onVideoStart) {
            onVideoStart();
        }
    };

    const handleVideoEnd = () => {
        if (onVideoEnd) {
            onVideoEnd();
        }
    };

    if (!isClient) {
        return (
            <div className={cn("aspect-video bg-gray-200 rounded-lg animate-pulse", className)} />
        );
    }

    if (!canAccess) {
        return (
            <div className={cn("relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden", className)}>
                {/* Locked video preview */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <Lock className="w-16 h-16 mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
                    <p className="text-gray-300 mb-4 text-center">
                        Duration: {formatDuration(duration)}
                    </p>
                    <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Premium Content - Purchase Required
                    </div>
                    <button
                        onClick={handlePlayClick}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                        <Lock className="w-4 h-4" />
                        Unlock Video
                    </button>
                </div>

                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"></div>
                </div>
            </div>
        );
    }

    if (!showVideo) {
        return (
            <div className={cn("relative aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group", className)}>
                {/* Video thumbnail/preview */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <div className="bg-blue-600 rounded-full p-4 mb-4 group-hover:bg-blue-700 transition-colors duration-200">
                        <Play className="w-8 h-8 ml-1" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
                    <p className="text-gray-300 mb-4 text-center">
                        Duration: {formatDuration(duration)}
                    </p>
                    {isFree && (
                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                            Free Preview
                        </div>
                    )}
                    <button
                        onClick={handlePlayClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        Play Video
                    </button>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-200"></div>
            </div>
        );
    }

    return (
        <div className={cn("relative", className)}>
            {/* Video header with protection notice */}
            <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{title}</span>
                    {isFree && (
                        <span className="bg-green-600 text-xs px-2 py-1 rounded-full">FREE</span>
                    )}
                </div>
                <div className="text-xs text-gray-300">
                    Protected Content
                </div>
            </div>

            {/* Secure video player */}
            <VideoPlayer
                youtubeId={youtubeId}
                title={title}
                className="aspect-video rounded-b-lg"
                onVideoStart={handleVideoStart}
                onVideoEnd={handleVideoEnd}
            />

            {/* Protection notice */}
            <div className="bg-gray-100 px-4 py-2 rounded-b-lg border-t">
                <p className="text-xs text-gray-600 text-center">
                    This video is protected by Career Path Institute. Unauthorized downloading or distribution is prohibited.
                </p>
            </div>
        </div>
    );
}
