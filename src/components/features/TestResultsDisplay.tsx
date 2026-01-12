'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Trophy,
    Clock,
    Target,
    TrendingUp,
    Award,
    CheckCircle,
    XCircle,
    BarChart3,
    Users
} from 'lucide-react';

interface SectionScore {
    sectionId: string;
    sectionTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
}

interface Analytics {
    grade: string;
    performance: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
    timeEfficiency: 'Fast' | 'Optimal' | 'Slow';
    strengths: string[];
    improvements: string[];
}

interface TestResult {
    attemptId: string;
    score: number;
    totalMarks: number;
    percentage: number;
    timeSpent: number;
    completedAt: string;
    sectionWiseScores: SectionScore[];
    analytics: Analytics;
}

interface Ranking {
    rank: number;
    totalAttempts: number;
    percentile: number;
}

interface TestResultsDisplayProps {
    result: TestResult;
    ranking?: Ranking;
    testTitle: string;
    className?: string;
}

export const TestResultsDisplay: React.FC<TestResultsDisplayProps> = ({
    result,
    ranking,
    testTitle,
    className = ''
}) => {
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A+':
            case 'A':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'B':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'C':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'D':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getPerformanceColor = (performance: string) => {
        switch (performance) {
            case 'Excellent':
                return 'text-green-600';
            case 'Good':
                return 'text-blue-600';
            case 'Average':
                return 'text-yellow-600';
            case 'Below Average':
                return 'text-orange-600';
            default:
                return 'text-red-600';
        }
    };

    const getTimeEfficiencyColor = (efficiency: string) => {
        switch (efficiency) {
            case 'Fast':
                return 'text-green-600';
            case 'Optimal':
                return 'text-blue-600';
            default:
                return 'text-orange-600';
        }
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with overall score */}
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{testTitle}</CardTitle>
                    <div className="flex items-center justify-center space-x-4 mt-4">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600">
                                {result.score}/{result.totalMarks}
                            </div>
                            <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600">
                                {result.percentage}%
                            </div>
                            <div className="text-sm text-gray-600">Percentage</div>
                        </div>
                        <div className="text-center">
                            <Badge className={`text-lg px-4 py-2 ${getGradeColor(result.analytics.grade)}`}>
                                Grade {result.analytics.grade}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <Target className={`w-8 h-8 ${getPerformanceColor(result.analytics.performance)}`} />
                            <div>
                                <div className="text-sm text-gray-600">Performance</div>
                                <div className={`text-lg font-semibold ${getPerformanceColor(result.analytics.performance)}`}>
                                    {result.analytics.performance}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <Clock className={`w-8 h-8 ${getTimeEfficiencyColor(result.analytics.timeEfficiency)}`} />
                            <div>
                                <div className="text-sm text-gray-600">Time Efficiency</div>
                                <div className={`text-lg font-semibold ${getTimeEfficiencyColor(result.analytics.timeEfficiency)}`}>
                                    {result.analytics.timeEfficiency}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {formatTime(result.timeSpent)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {ranking && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <Trophy className="w-8 h-8 text-yellow-600" />
                                <div>
                                    <div className="text-sm text-gray-600">Ranking</div>
                                    <div className="text-lg font-semibold text-yellow-600">
                                        #{ranking.rank} of {ranking.totalAttempts}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {ranking.percentile}th percentile
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Section-wise Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Section-wise Performance</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {result.sectionWiseScores.map((section, index) => (
                        <div key={section.sectionId} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{section.sectionTitle}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {section.correctAnswers}/{section.totalQuestions} correct
                                    </span>
                                    <Badge variant="outline">
                                        {section.score}/{section.totalMarks} marks
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Progress value={section.percentage} className="flex-1" />
                                <span className="text-sm font-medium w-12">
                                    {section.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span>Strengths</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.analytics.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-orange-600">
                            <TrendingUp className="w-5 h-5" />
                            <span>Areas for Improvement</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.analytics.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Test Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-gray-600">Completed At</div>
                            <div className="font-medium">
                                {new Date(result.completedAt).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600">Time Spent</div>
                            <div className="font-medium">{formatTime(result.timeSpent)}</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Total Questions</div>
                            <div className="font-medium">
                                {result.sectionWiseScores.reduce((sum, section) => sum + section.totalQuestions, 0)}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600">Attempt ID</div>
                            <div className="font-medium font-mono text-xs">
                                {result.attemptId.slice(-8)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TestResultsDisplay;
