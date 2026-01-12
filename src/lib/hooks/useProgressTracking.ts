'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressSummary } from '@/lib/utils/progress-tracking';

interface UseProgressTrackingOptions {
  courseId: string;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface ProgressState {
  progress: ProgressSummary | null;
  isLoading: boolean;
  error: string | null;
  lastSynced: Date | null;
}

interface ProgressUpdate {
  type: 'video' | 'material' | 'quiz';
  sectionId: string;
  itemId: string;
  watchedDuration?: number;
  totalDuration?: number;
  completed?: boolean;
  score?: number;
}

export function useProgressTracking(options: UseProgressTrackingOptions) {
  const { courseId, autoSync = true, syncInterval = 30000 } = options;
  
  const [state, setState] = useState<ProgressState>({
    progress: null,
    isLoading: true,
    error: null,
    lastSynced: null
  });

  const [pendingUpdates, setPendingUpdates] = useState<ProgressUpdate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch progress from server
  const fetchProgress = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/progress/${courseId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress');
      }

      setState(prev => ({
        ...prev,
        progress: data.data.progress,
        isLoading: false,
        lastSynced: new Date()
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
    }
  }, [courseId]);

  // Update progress locally and queue for sync
  const updateProgress = useCallback((update: ProgressUpdate) => {
    // Add to pending updates
    setPendingUpdates(prev => [...prev, update]);

    // Update local state optimistically
    setState(prev => {
      if (!prev.progress) return prev;

      const updatedProgress = { ...prev.progress };
      
      // Find the section
      const sectionIndex = updatedProgress.sectionsProgress.findIndex(
        section => section.sectionId === update.sectionId
      );

      if (sectionIndex === -1) return prev;

      const section = { ...updatedProgress.sectionsProgress[sectionIndex] };

      // Update based on type
      switch (update.type) {
        case 'video':
          // This is a simplified update - in reality you'd need more complex logic
          if (update.completed) {
            section.videosCompleted = Math.min(section.videosCompleted + 1, section.totalVideos);
          }
          break;
        case 'material':
          section.materialsAccessed = Math.min(section.materialsAccessed + 1, section.totalMaterials);
          break;
        case 'quiz':
          section.quizzesCompleted = Math.min(section.quizzesCompleted + 1, section.totalQuizzes);
          break;
      }

      // Recalculate section progress
      const totalItems = section.totalVideos + section.totalMaterials + section.totalQuizzes;
      const completedItems = section.videosCompleted + section.materialsAccessed + section.quizzesCompleted;
      section.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      section.isCompleted = section.progress >= 100;

      // Update the section in the array
      updatedProgress.sectionsProgress[sectionIndex] = section;

      // Recalculate overall progress
      const totalSectionProgress = updatedProgress.sectionsProgress.reduce(
        (sum, s) => sum + s.progress, 0
      );
      updatedProgress.overallProgress = updatedProgress.sectionsProgress.length > 0
        ? Math.round(totalSectionProgress / updatedProgress.sectionsProgress.length)
        : 0;
      updatedProgress.isCompleted = updatedProgress.overallProgress >= 100;

      return {
        ...prev,
        progress: updatedProgress
      };
    });
  }, []);

  // Sync pending updates to server
  const syncProgress = useCallback(async () => {
    if (pendingUpdates.length === 0 || isSyncing) return;

    try {
      setIsSyncing(true);

      const response = await fetch(`/api/progress/${courseId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updates: pendingUpdates
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync progress');
      }

      // Clear pending updates on successful sync
      setPendingUpdates([]);
      
      // Update with server response
      setState(prev => ({
        ...prev,
        progress: data.data.progress,
        error: null,
        lastSynced: new Date()
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    } finally {
      setIsSyncing(false);
    }
  }, [courseId, pendingUpdates, isSyncing]);

  // Initialize progress
  const initializeProgress = useCallback(async (reset = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/progress/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reset })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize progress');
      }

      setState(prev => ({
        ...prev,
        progress: data.data.progress,
        isLoading: false,
        lastSynced: new Date()
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Initialization failed',
        isLoading: false
      }));
    }
  }, [courseId]);

  // Track video progress with debouncing
  const trackVideoProgress = useCallback((
    sectionId: string,
    videoId: string,
    watchedDuration: number,
    totalDuration: number
  ) => {
    updateProgress({
      type: 'video',
      sectionId,
      itemId: videoId,
      watchedDuration,
      totalDuration,
      completed: watchedDuration / totalDuration >= 0.8 // 80% completion threshold
    });
  }, [updateProgress]);

  // Track material access
  const trackMaterialAccess = useCallback((sectionId: string, materialId: string) => {
    updateProgress({
      type: 'material',
      sectionId,
      itemId: materialId
    });
  }, [updateProgress]);

  // Track quiz completion
  const trackQuizCompletion = useCallback((
    sectionId: string,
    quizId: string,
    score?: number
  ) => {
    updateProgress({
      type: 'quiz',
      sectionId,
      itemId: quizId,
      score,
      completed: true
    });
  }, [updateProgress]);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Auto-sync pending updates
  useEffect(() => {
    if (!autoSync || pendingUpdates.length === 0) return;

    const syncTimer = setTimeout(syncProgress, 5000); // Sync after 5 seconds of inactivity
    return () => clearTimeout(syncTimer);
  }, [autoSync, pendingUpdates, syncProgress]);

  // Periodic sync
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      if (pendingUpdates.length > 0) {
        syncProgress();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, pendingUpdates.length, syncProgress]);

  // Sync on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingUpdates.length > 0) {
        // Use sendBeacon for reliable sync on page unload
        navigator.sendBeacon(
          `/api/progress/${courseId}/update`,
          JSON.stringify({ updates: pendingUpdates })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [courseId, pendingUpdates]);

  return {
    // State
    progress: state.progress,
    isLoading: state.isLoading,
    error: state.error,
    lastSynced: state.lastSynced,
    hasPendingUpdates: pendingUpdates.length > 0,
    isSyncing,

    // Actions
    fetchProgress,
    initializeProgress,
    syncProgress,
    trackVideoProgress,
    trackMaterialAccess,
    trackQuizCompletion,

    // Utilities
    getProgressPercentage: () => state.progress?.overallProgress || 0,
    isCompleted: () => state.progress?.isCompleted || false,
    getSectionProgress: (sectionId: string) => {
      return state.progress?.sectionsProgress.find(s => s.sectionId === sectionId);
    }
  };
}
