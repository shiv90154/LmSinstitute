'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TestTimerProps {
    durationInMinutes: number;
    onTimeUp: () => void;
    onTimeWarning?: (remainingMinutes: number) => void;
    warningThresholds?: number[]; // Minutes remaining when to show warnings
    isActive?: boolean;
    className?: string;
}

export const TestTimer: React.FC<TestTimerProps> = ({
    durationInMinutes,
    onTimeUp,
    onTimeWarning,
    warningThresholds = [5, 1], // Default warnings at 5 and 1 minute remaining
    isActive = true,
    className = ''
}) => {
    const [timeRemaining, setTimeRemaining] = useState(durationInMinutes * 60); // Convert to seconds
    const [isWarning, setIsWarning] = useState(false);
    const [hasTriggeredWarnings, setHasTriggeredWarnings] = useState<Set<number>>(new Set());

    const formatTime = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    const checkWarnings = useCallback((remainingSeconds: number) => {
        const remainingMinutes = Math.ceil(remainingSeconds / 60);

        for (const threshold of warningThresholds) {
            if (remainingMinutes <= threshold && !hasTriggeredWarnings.has(threshold)) {
                setHasTriggeredWarnings(prev => new Set(prev).add(threshold));
                onTimeWarning?.(remainingMinutes);

                // Set warning state for visual feedback
                if (remainingMinutes <= Math.min(...warningThresholds)) {
                    setIsWarning(true);
                }
                break;
            }
        }
    }, [warningThresholds, hasTriggeredWarnings, onTimeWarning]);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = prev - 1;

                if (newTime <= 0) {
                    clearInterval(interval);
                    onTimeUp();
                    return 0;
                }

                // Check for warnings
                checkWarnings(newTime);

                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTimeUp, checkWarnings]);

    // Reset timer when duration changes
    useEffect(() => {
        setTimeRemaining(durationInMinutes * 60);
        setHasTriggeredWarnings(new Set());
        setIsWarning(false);
    }, [durationInMinutes]);

    const getTimerColor = () => {
        const remainingMinutes = Math.ceil(timeRemaining / 60);

        if (remainingMinutes <= 1) {
            return 'text-red-600 bg-red-50 border-red-200';
        } else if (remainingMinutes <= 5) {
            return 'text-orange-600 bg-orange-50 border-orange-200';
        }
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    const progress = ((durationInMinutes * 60 - timeRemaining) / (durationInMinutes * 60)) * 100;

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-300 ${getTimerColor()} ${className}`}>
            <div className="flex items-center space-x-2">
                {isWarning ? (
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                ) : (
                    <Clock className="w-5 h-5" />
                )}
                <span className="font-mono text-lg font-semibold">
                    {formatTime(timeRemaining)}
                </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${isWarning ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <span className="text-sm font-medium">
                {Math.ceil(timeRemaining / 60)} min left
            </span>
        </div>
    );
};

export default TestTimer;
