'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TestTimer } from './TestTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestQuestion {
    _id: string;
    text: string;
    options: string[];
    marks: number;
}

interface TestSection {
    _id: string;
    title: string;
    questions: TestQuestion[];
    timeLimit?: number;
}

interface TestData {
    _id: string;
    title: string;
    description: string;
    duration: number;
    totalMarks: number;
    sections: TestSection[];
}

interface Answer {
    questionId: string;
    selectedOption: number;
}

interface TestAttemptContainerProps {
    testData: TestData;
    onSubmit: (answers: Answer[], startTime: string, endTime: string) => Promise<void>;
    onTimeWarning?: (remainingMinutes: number) => void;
    className?: string;
}

export const TestAttemptContainer: React.FC<TestAttemptContainerProps> = ({
    testData,
    onSubmit,
    onTimeWarning,
    className = ''
}) => {
    const [answers, setAnswers] = useState<Map<string, number>>(new Map());
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
    const [startTime] = useState(new Date().toISOString());
    const [isTestActive, setIsTestActive] = useState(true);
    const submitTriggeredRef = useRef(false);

    const currentSection = testData.sections[currentSectionIndex];
    const currentQuestion = currentSection?.questions[currentQuestionIndex];
    const totalQuestions = testData.sections.reduce((total, section) => total + section.questions.length, 0);
    const answeredQuestions = answers.size;

    // Handle answer selection
    const handleAnswerSelect = useCallback((questionId: string, optionIndex: number) => {
        if (!isTestActive) return;

        setAnswers(prev => {
            const newAnswers = new Map(prev);
            newAnswers.set(questionId, optionIndex);
            return newAnswers;
        });
    }, [isTestActive]);

    // Navigation functions
    const goToNextQuestion = useCallback(() => {
        if (currentQuestionIndex < currentSection.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else if (currentSectionIndex < testData.sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
        }
    }, [currentQuestionIndex, currentSectionIndex, currentSection, testData.sections.length]);

    const goToPreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            const prevSection = testData.sections[currentSectionIndex - 1];
            setCurrentQuestionIndex(prevSection.questions.length - 1);
        }
    }, [currentQuestionIndex, currentSectionIndex, testData.sections]);

    // Auto-submission when time is up
    const handleTimeUp = useCallback(async () => {
        if (submitTriggeredRef.current) return;
        submitTriggeredRef.current = true;

        setIsTestActive(false);
        setShowTimeUpDialog(true);

        // Auto-submit after showing dialog
        setTimeout(async () => {
            await handleSubmit(true);
        }, 3000);
    }, []);

    // Handle test submission
    const handleSubmit = useCallback(async (isAutoSubmit = false) => {
        if (submitTriggeredRef.current && !isAutoSubmit) return;
        if (!isAutoSubmit) submitTriggeredRef.current = true;

        setIsSubmitting(true);
        setIsTestActive(false);

        try {
            const answersArray: Answer[] = Array.from(answers.entries()).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption
            }));

            const endTime = new Date().toISOString();
            await onSubmit(answersArray, startTime, endTime);
        } catch (error) {
            console.error('Error submitting test:', error);
            // Re-enable test if submission fails
            setIsTestActive(true);
            submitTriggeredRef.current = false;
        } finally {
            setIsSubmitting(false);
            setShowSubmitDialog(false);
            setShowTimeUpDialog(false);
        }
    }, [answers, startTime, onSubmit]);

    // Handle manual submit button click
    const handleManualSubmit = useCallback(() => {
        setShowSubmitDialog(true);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isTestActive) return;

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    goToPreviousQuestion();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    goToNextQuestion();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    event.preventDefault();
                    const optionIndex = parseInt(event.key) - 1;
                    if (currentQuestion && optionIndex < currentQuestion.options.length) {
                        handleAnswerSelect(currentQuestion._id, optionIndex);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isTestActive, currentQuestion, goToNextQuestion, goToPreviousQuestion, handleAnswerSelect]);

    // Prevent page refresh/navigation during test
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isTestActive && !submitTriggeredRef.current) {
                event.preventDefault();
                event.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
                return event.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isTestActive]);

    if (!currentQuestion) {
        return <div>Loading test...</div>;
    }

    return (
        <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
            {/* Timer */}
            <TestTimer
                durationInMinutes={testData.duration}
                onTimeUp={handleTimeUp}
                onTimeWarning={onTimeWarning}
                isActive={isTestActive}
                className="sticky top-4 z-10"
            />

            {/* Progress indicator */}
            <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                        Question {currentQuestionIndex + 1} of {currentSection.questions.length}
                        (Section: {currentSection.title})
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                        Answered: {answeredQuestions}/{totalQuestions}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Question {currentQuestionIndex + 1}</span>
                        <span className="text-sm font-normal text-gray-600">
                            {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg leading-relaxed">{currentQuestion.text}</p>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = answers.get(currentQuestion._id) === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(currentQuestion._id, index)}
                                    disabled={!isTestActive}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        } ${!isTestActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span>{option}</span>
                                        {isSelected && <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation and submit buttons */}
            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentSectionIndex === 0 && currentQuestionIndex === 0 || !isTestActive}
                >
                    Previous
                </Button>

                <div className="flex space-x-3">
                    <Button
                        variant="destructive"
                        onClick={handleManualSubmit}
                        disabled={!isTestActive || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Test'}
                    </Button>

                    <Button
                        onClick={goToNextQuestion}
                        disabled={
                            (currentSectionIndex === testData.sections.length - 1 &&
                                currentQuestionIndex === currentSection.questions.length - 1) ||
                            !isTestActive
                        }
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Submit confirmation dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Test?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to submit your test? You have answered {answeredQuestions} out of {totalQuestions} questions.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" disabled={isSubmitting} onClick={() => setShowSubmitDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleSubmit()} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Test'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Time up dialog */}
            <Dialog open={showTimeUpDialog} onOpenChange={() => { }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <span>Time's Up!</span>
                        </DialogTitle>
                        <DialogDescription>
                            The test time has expired. Your answers are being submitted automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>Auto-submitting in 3 seconds...</span>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TestAttemptContainer;
