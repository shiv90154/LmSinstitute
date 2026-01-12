/**
 * Video Protection Utilities
 * Provides functions for securing video content and preventing unauthorized access
 */

/**
 * Validates YouTube video ID format
 */
export function validateYouTubeId(youtubeId: string): boolean {
  const youtubeRegex = /^[a-zA-Z0-9_-]{11}$/;
  return youtubeRegex.test(youtubeId);
}

/**
 * Generates secure YouTube embed URL with protection parameters
 */
export function generateSecureEmbedUrl(youtubeId: string, options: {
  autoplay?: boolean;
  origin?: string;
  disableFullscreen?: boolean;
  hideControls?: boolean;
} = {}): string {
  if (!validateYouTubeId(youtubeId)) {
    throw new Error('Invalid YouTube ID format');
  }

  const {
    autoplay = false,
    origin = typeof window !== 'undefined' ? window.location.origin : '',
    disableFullscreen = true,
    hideControls = false
  } = options;

  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${youtubeId}`);
  
  // Security and branding parameters
  embedUrl.searchParams.set('modestbranding', '1'); // Minimal YouTube branding
  embedUrl.searchParams.set('rel', '0'); // Don't show related videos
  embedUrl.searchParams.set('showinfo', '0'); // Don't show video info
  embedUrl.searchParams.set('iv_load_policy', '3'); // Hide annotations
  embedUrl.searchParams.set('cc_load_policy', '0'); // Hide captions by default
  embedUrl.searchParams.set('playsinline', '1'); // Play inline on mobile
  embedUrl.searchParams.set('disablekb', '1'); // Disable keyboard controls
  
  if (origin) {
    embedUrl.searchParams.set('origin', origin); // Set origin for security
  }
  
  if (autoplay) {
    embedUrl.searchParams.set('autoplay', '1');
  }
  
  if (disableFullscreen) {
    embedUrl.searchParams.set('fs', '0'); // Disable fullscreen
  }
  
  if (hideControls) {
    embedUrl.searchParams.set('controls', '0'); // Hide player controls
  } else {
    embedUrl.searchParams.set('controls', '1'); // Show player controls
  }

  return embedUrl.toString();
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's already just an ID
  if (validateYouTubeId(url)) {
    return url;
  }

  return null;
}

/**
 * Generates thumbnail URL for YouTube video
 */
export function getYouTubeThumbnail(youtubeId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string {
  if (!validateYouTubeId(youtubeId)) {
    throw new Error('Invalid YouTube ID format');
  }

  const qualityMap = {
    'default': 'default.jpg',
    'medium': 'mqdefault.jpg',
    'high': 'hqdefault.jpg',
    'standard': 'sddefault.jpg',
    'maxres': 'maxresdefault.jpg'
  };

  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}`;
}

/**
 * Client-side protection functions
 */
export const videoProtection = {
  /**
   * Prevents right-click context menu
   */
  preventRightClick: (element: HTMLElement) => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    element.addEventListener('contextmenu', handler);
    return () => element.removeEventListener('contextmenu', handler);
  },

  /**
   * Prevents text selection
   */
  preventSelection: (element: HTMLElement) => {
    const handler = (e: Event) => {
      e.preventDefault();
      return false;
    };
    
    element.addEventListener('selectstart', handler);
    element.addEventListener('dragstart', handler);
    
    return () => {
      element.removeEventListener('selectstart', handler);
      element.removeEventListener('dragstart', handler);
    };
  },

  /**
   * Prevents common keyboard shortcuts for developer tools
   */
  preventKeyboardShortcuts: () => {
    const handler = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  },

  /**
   * Applies comprehensive protection to an element
   */
  applyProtection: (element: HTMLElement) => {
    const cleanupFunctions = [
      videoProtection.preventRightClick(element),
      videoProtection.preventSelection(element),
      videoProtection.preventKeyboardShortcuts()
    ];

    // Apply CSS protection
    element.style.userSelect = 'none';
    (element.style as any).webkitUserSelect = 'none';
    (element.style as any).mozUserSelect = 'none';
    (element.style as any).msUserSelect = 'none';
    (element.style as any).webkitTouchCallout = 'none';

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }
};

/**
 * Obfuscates video source information
 */
export function obfuscateVideoSource(youtubeId: string): {
  displayId: string;
  actualId: string;
} {
  // Create a display ID that doesn't reveal the actual YouTube ID
  const displayId = `cpi_${Buffer.from(youtubeId).toString('base64').replace(/[+=]/g, '').substring(0, 8)}`;
  
  return {
    displayId,
    actualId: youtubeId
  };
}

/**
 * Checks if video access is allowed based on user permissions
 */
export function checkVideoAccess(
  isFree: boolean,
  userHasAccess: boolean,
  userPurchases: string[] = []
): {
  canAccess: boolean;
  reason?: string;
} {
  if (isFree) {
    return { canAccess: true };
  }

  if (userHasAccess) {
    return { canAccess: true };
  }

  return {
    canAccess: false,
    reason: 'Premium content requires purchase'
  };
}

/**
 * Generates video protection metadata
 */
export function generateVideoProtectionMetadata(youtubeId: string, title: string) {
  return {
    id: obfuscateVideoSource(youtubeId).displayId,
    title,
    protected: true,
    source: 'Career Path Institute',
    timestamp: new Date().toISOString(),
    checksum: Buffer.from(`${youtubeId}:${title}:${Date.now()}`).toString('base64')
  };
}
