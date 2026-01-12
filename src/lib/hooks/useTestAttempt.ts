'use client';

import { useState, useCallback } from 'react';

interface Answer {
  questionId: string;
  selectedOption: number;
}

interface TestAttemptResult {
  attemptId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
}

interface UseTestAttemptProps {
  testId: string;
  onSuccess?: (result: TestAttemptResult) => void;
  onError?: (error: string) => void;
}

export const useTestAttempt = ({ testId, onSuccess, onError }: UseTestAttemptProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestAttemptResult | null>(null);

  const startAttempt = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tests/${testId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start test attempt');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start test attempt';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [testId, onError]);

  const submitAttempt = useCallback(async (
    answers: Answer[],
    startTime: string,
    endTime: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tests/${testId}/attempt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit test attempt');
      }

      const data = await response.json();
      const attemptResult = data.data as TestAttemptResult;
      
      setResult(attemptResult);
      onSuccess?.(attemptResult);
      
      return attemptResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit test attempt';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [testId, onSuccess, onError]);

  const getResults = useCallback(async (attemptId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = attemptId 
        ? `/api/tests/${testId}/results?attemptId=${attemptId}`
        : `/api/tests/${testId}/results`;
        
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch test results');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch test results';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [testId, onError]);

  const resetState = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    startAttempt,
    submitAttempt,
    getResults,
    resetState,
  };
};

export default useTestAttempt;
