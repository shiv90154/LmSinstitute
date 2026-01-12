'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Clock, Target } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    score: number;
    totalMarks: number;
    percentage: number;
    completedAt: string;
    timeSpent: number;
}

interface TestLeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    testTitle: string;
    className?: string;
}

export const TestLeaderboard: React.FC<TestLeaderboardProps> = ({
    entries,
    currentUserId,
    testTitle,
    className = ''
}) => {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Award className="w-6 h-6 text-amber-600" />;
            default:
                return (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                        {rank}
                    </div>
                );
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 2:
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 3:
                return 'bg-amber-100 text-amber-800 border-amber-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    const getPerformanceLevel = (percentage: number) => {
        if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600' };
        if (percentage >= 80) return { label: 'Good', color: 'text-blue-600' };
        if (percentage >= 70) return { label: 'Average', color: 'text-yellow-600' };
        if (percentage >= 60) return { label: 'Fair', color: 'text-orange-600' };
        return { label: 'Needs Improvement', color: 'text-red-600' };
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Leaderboard - {testTitle}</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Top performers ranked by score and completion time
                </p>
            </CardHeader>
            <CardContent>
                {entries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No attempts yet. Be the first to take this test!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map((entry) => {
                            const isCurrentUser = entry.userId === currentUserId;
                            const performance = getPerformanceLevel(entry.percentage);

                            return (
                                <div
                                    key={`${entry.userId}-${entry.completedAt}`}
                                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 ${isCurrentUser
                                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className="flex items-center space-x-2">
                                        {getRankIcon(entry.rank)}
                                        <Badge className={getRankBadgeColor(entry.rank)}>
                                            #{entry.rank}
                                        </Badge>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <h4 className={`font-semibold truncate ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                {entry.userName}
                                                {isCurrentUser && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </h4>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                            <span className="flex items-center space-x-1">
                                                <Target className="w-4 h-4" />
                                                <span className={performance.color}>
                                                    {performance.label}
                                                </span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatTime(entry.timeSpent)}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">
                                            {entry.score}/{entry.totalMarks}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {entry.percentage}%
                                        </div>
                                    </div>

                                    {/* Completion Date */}
                                    <div className="text-right text-xs text-gray-500 min-w-0">
                                        <div>
                                            {new Date(entry.completedAt).toLocaleDateString()}
                                        </div>
                                        <div>
                                            {new Date(entry.completedAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {entries.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                                <div className="text-gray-600">Total Attempts</div>
                                <div className="font-semibold">{entries.length}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Average Score</div>
                                <div className="font-semibold">
                                    {Math.round(entries.reduce((sum, entry) => sum + entry.percentage, 0) / entries.length)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600">Best Time</div>
                                <div className="font-semibold">
                                    {formatTime(Math.min(...entries.map(entry => entry.timeSpent)))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TestLeaderboard;
