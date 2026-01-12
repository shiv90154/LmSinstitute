'use client';

import React from 'react';
import { Lock, Play, FileText, HelpCircle, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AccessControlledContentProps {
    title: string;
    type: 'video' | 'material' | 'quiz';
    isFree: boolean;
    hasAccess: boolean;
    duration?: number;
    description?: string;
    className?: string;
    onAccessRequest?: () => void;
    onContentClick?: () => void;
}

export default function AccessControlledContent({
    title,
    type,
    isFree,
    hasAccess,
    duration,
    description,
    className,
    onAccessRequest,
    onContentClick
}: AccessControlledContentProps) {
    const canAccess = isFree || hasAccess;

    const getIcon = () => {
        switch (type) {
            case 'video':
                return <Play className="w-5 h-5" />;
            case 'material':
                return <FileText className="w-5 h-5" />;
            case 'quiz':
                return <HelpCircle className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleClick = () => {
        if (canAccess && onContentClick) {
            onContentClick();
        } else if (!canAccess && onAccessRequest) {
            onAccessRequest();
        }
    };

    return (
        <Card
            className={cn(
                "transition-all duration-200 cursor-pointer",
                canAccess
                    ? "hover:shadow-md hover:border-blue-300"
                    : "hover:shadow-md hover:border-orange-300 bg-gray-50",
                className
            )}
            onClick={handleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {canAccess ? (
                            <div className="text-blue-600">
                                {getIcon()}
                            </div>
                        ) : (
                            <div className="text-gray-400">
                                <Lock className="w-5 h-5" />
                            </div>
                        )}
                        <CardTitle className={cn(
                            "text-sm font-medium",
                            canAccess ? "text-gray-900" : "text-gray-600"
                        )}>
                            {title}
                        </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        {isFree && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                FREE
                            </Badge>
                        )}
                        {!canAccess && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                                PREMIUM
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {description && (
                    <p className={cn(
                        "text-sm mb-3",
                        canAccess ? "text-gray-600" : "text-gray-500"
                    )}>
                        {description}
                    </p>
                )}

                {duration && type === 'video' && (
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Duration:</span>
                        <span className="text-xs font-medium text-gray-700">
                            {formatDuration(duration)}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    {canAccess ? (
                        <Button
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onContentClick) onContentClick();
                            }}
                        >
                            {getIcon()}
                            {type === 'video' ? 'Watch' : type === 'material' ? 'Download' : 'Take Quiz'}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onAccessRequest) onAccessRequest();
                            }}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Purchase Course
                        </Button>
                    )}

                    {!canAccess && (
                        <div className="text-xs text-gray-500">
                            Requires course purchase
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Section component that enforces free content rules
interface AccessControlledSectionProps {
    title: string;
    videos: Array<{
        id: string;
        title: string;
        duration: number;
        isFree: boolean;
    }>;
    materials: Array<{
        id: string;
        title: string;
        type: string;
    }>;
    quizzes: Array<{
        id: string;
        title: string;
        questionCount: number;
    }>;
    hasAccess: boolean;
    className?: string;
    onVideoClick?: (videoId: string) => void;
    onMaterialClick?: (materialId: string) => void;
    onQuizClick?: (quizId: string) => void;
    onAccessRequest?: () => void;
}

export function AccessControlledSection({
    title,
    videos,
    materials,
    quizzes,
    hasAccess,
    className,
    onVideoClick,
    onMaterialClick,
    onQuizClick,
    onAccessRequest
}: AccessControlledSectionProps) {
    // Ensure only one free video per section (first video)
    const processedVideos = videos.map((video, index) => ({
        ...video,
        isFree: index === 0 // Only first video is free
    }));

    const freeContentCount = processedVideos.filter(v => v.isFree).length;
    const totalContentCount = videos.length + materials.length + quizzes.length;
    const accessibleCount = hasAccess ? totalContentCount : freeContentCount;

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {accessibleCount}/{totalContentCount} accessible
                    </Badge>
                    {!hasAccess && freeContentCount > 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                            {freeContentCount} free preview{freeContentCount > 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid gap-3">
                {/* Videos */}
                {processedVideos.map((video) => (
                    <AccessControlledContent
                        key={video.id}
                        title={video.title}
                        type="video"
                        isFree={video.isFree}
                        hasAccess={hasAccess}
                        duration={video.duration}
                        onContentClick={() => onVideoClick?.(video.id)}
                        onAccessRequest={onAccessRequest}
                    />
                ))}

                {/* Materials - only accessible with full access */}
                {materials.map((material) => (
                    <AccessControlledContent
                        key={material.id}
                        title={material.title}
                        type="material"
                        isFree={false}
                        hasAccess={hasAccess}
                        description={`${material.type.toUpperCase()} file`}
                        onContentClick={() => onMaterialClick?.(material.id)}
                        onAccessRequest={onAccessRequest}
                    />
                ))}

                {/* Quizzes - only accessible with full access */}
                {quizzes.map((quiz) => (
                    <AccessControlledContent
                        key={quiz.id}
                        title={quiz.title}
                        type="quiz"
                        isFree={false}
                        hasAccess={hasAccess}
                        description={`${quiz.questionCount} questions`}
                        onContentClick={() => onQuizClick?.(quiz.id)}
                        onAccessRequest={onAccessRequest}
                    />
                ))}
            </div>

            {!hasAccess && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                            Unlock Full Section
                        </span>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                        Get access to all {totalContentCount - freeContentCount} premium items in this section,
                        including videos, materials, and quizzes.
                    </p>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={onAccessRequest}
                    >
                        Purchase Course Access
                    </Button>
                </div>
            )}
        </div>
    );
}
