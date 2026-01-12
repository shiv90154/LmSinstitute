'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
    youtubeId: string;
    title: string;
    className?: string;
    autoplay?: boolean;
    onVideoEnd?: () => void;
    onVideoStart?: () => void;
}

export default function VideoPlayer({
    youtubeId,
    title,
    className,
    autoplay = false,
    onVideoEnd,
    onVideoStart
}: VideoPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Validate YouTube ID format
    const isValidYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(youtubeId);

    useEffect(() => {
        if (!isValidYouTubeId) {
            setHasError(true);
            setIsLoading(false);
            return;
        }

        // Add security measures to prevent right-click and source identification
        const container = containerRef.current;
        if (!container) return;

        const preventRightClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
            // Prevent common keyboard shortcuts for developer tools and source viewing
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.key === 'U') ||
                (e.ctrlKey && e.key === 's') ||
                (e.ctrlKey && e.key === 'S')
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        const preventSelection = (e: Event) => {
            e.preventDefault();
            return false;
        };

        // Add event listeners for protection
        container.addEventListener('contextmenu', preventRightClick);
        container.addEventListener('selectstart', preventSelection);
        container.addEventListener('dragstart', preventSelection);
        document.addEventListener('keydown', preventKeyboardShortcuts);

        // Cleanup function
        return () => {
            container.removeEventListener('contextmenu', preventRightClick);
            container.removeEventListener('selectstart', preventSelection);
            container.removeEventListener('dragstart', preventSelection);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
        };
    }, [isValidYouTubeId]);

    const handleIframeLoad = () => {
        setIsLoading(false);
        if (onVideoStart) {
            onVideoStart();
        }
    };

    const handleIframeError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    if (!isValidYouTubeId) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-100 rounded-lg", className)}>
                <div className="text-center p-8">
                    <div className="text-red-500 text-lg font-semibold mb-2">Invalid Video</div>
                    <div className="text-gray-600">The video ID format is invalid.</div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-100 rounded-lg", className)}>
                <div className="text-center p-8">
                    <div className="text-red-500 text-lg font-semibold mb-2">Video Unavailable</div>
                    <div className="text-gray-600">This video cannot be loaded at the moment.</div>
                </div>
            </div>
        );
    }

    // Construct YouTube embed URL with security parameters
    const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${youtubeId}`);

    // Add parameters to enhance security and disable YouTube branding
    embedUrl.searchParams.set('modestbranding', '1'); // Minimal YouTube branding
    embedUrl.searchParams.set('rel', '0'); // Don't show related videos
    embedUrl.searchParams.set('showinfo', '0'); // Don't show video info
    embedUrl.searchParams.set('controls', '1'); // Show player controls
    embedUrl.searchParams.set('disablekb', '1'); // Disable keyboard controls
    embedUrl.searchParams.set('fs', '0'); // Disable fullscreen
    embedUrl.searchParams.set('iv_load_policy', '3'); // Hide annotations
    embedUrl.searchParams.set('cc_load_policy', '0'); // Hide captions by default
    embedUrl.searchParams.set('playsinline', '1'); // Play inline on mobile
    embedUrl.searchParams.set('origin', window.location.origin); // Set origin for security

    if (autoplay) {
        embedUrl.searchParams.set('autoplay', '1');
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative bg-black rounded-lg overflow-hidden",
                "select-none", // Prevent text selection
                className
            )}
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <div>Loading video...</div>
                    </div>
                </div>
            )}

            {/* Overlay to prevent direct iframe interaction and mask YouTube source */}
            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background: 'transparent',
                    mixBlendMode: 'normal'
                }}
            />

            {/* Custom overlay with course branding */}
            <div className="absolute top-2 left-2 z-30 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Career Path Institute
            </div>

            <iframe
                ref={iframeRef}
                src={embedUrl.toString()}
                title={title}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={false}
                loading="lazy"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                    border: 'none',
                    outline: 'none',
                    pointerEvents: 'auto'
                }}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-presentation"
            />

            {/* Additional protection overlay */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background: 'transparent',
                    pointerEvents: 'none',
                    userSelect: 'none'
                }}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
            />
        </div>
    );
}
