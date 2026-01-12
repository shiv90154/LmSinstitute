'use client';

import { useEffect, useRef, useCallback } from 'react';
import { videoProtection } from '@/lib/utils/video-protection';

interface UseVideoProtectionOptions {
  preventRightClick?: boolean;
  preventSelection?: boolean;
  preventKeyboardShortcuts?: boolean;
  onProtectionViolation?: (type: string) => void;
}

export function useVideoProtection(options: UseVideoProtectionOptions = {}) {
  const {
    preventRightClick = true,
    preventSelection = true,
    preventKeyboardShortcuts = true,
    onProtectionViolation
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  const applyProtection = useCallback((element: HTMLElement) => {
    // Clear any existing protection
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];

    if (preventRightClick) {
      const cleanup = videoProtection.preventRightClick(element);
      cleanupFunctionsRef.current.push(cleanup);
    }

    if (preventSelection) {
      const cleanup = videoProtection.preventSelection(element);
      cleanupFunctionsRef.current.push(cleanup);
    }

    if (preventKeyboardShortcuts) {
      const cleanup = videoProtection.preventKeyboardShortcuts();
      cleanupFunctionsRef.current.push(cleanup);
    }

    // Apply CSS protection
    element.style.userSelect = 'none';
    (element.style as any).webkitUserSelect = 'none';
    (element.style as any).mozUserSelect = 'none';
    (element.style as any).msUserSelect = 'none';
    (element.style as any).webkitTouchCallout = 'none';

    // Add violation detection
    if (onProtectionViolation) {
      const violationHandler = (e: Event) => {
        onProtectionViolation(e.type);
      };

      element.addEventListener('contextmenu', violationHandler);
      element.addEventListener('selectstart', violationHandler);
      element.addEventListener('dragstart', violationHandler);

      cleanupFunctionsRef.current.push(() => {
        element.removeEventListener('contextmenu', violationHandler);
        element.removeEventListener('selectstart', violationHandler);
        element.removeEventListener('dragstart', violationHandler);
      });
    }
  }, [preventRightClick, preventSelection, preventKeyboardShortcuts, onProtectionViolation]);

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    if (element) {
      applyProtection(element);
    }
  }, [applyProtection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    };
  }, []);

  // Reapply protection when options change
  useEffect(() => {
    if (elementRef.current) {
      applyProtection(elementRef.current);
    }
  }, [applyProtection]);

  return {
    ref: setRef,
    applyProtection: (element: HTMLElement) => applyProtection(element),
    removeProtection: () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    }
  };
}

export default useVideoProtection;
