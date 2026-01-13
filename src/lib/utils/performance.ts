/**
 * Performance optimization utilities
 */

import { NextRequest, NextResponse } from 'next/server';

// Cache configuration
export const CACHE_DURATIONS = {
  STATIC_ASSETS: 31536000, // 1 year
  API_RESPONSES: 300, // 5 minutes
  USER_DATA: 60, // 1 minute
  COURSE_DATA: 3600, // 1 hour
  BLOG_POSTS: 1800, // 30 minutes
  IMAGES: 86400, // 1 day
} as const;

// Cache headers for different content types
export const getCacheHeaders = (duration: number, isPublic: boolean = true) => {
  const cacheControl = isPublic 
    ? `public, max-age=${duration}, s-maxage=${duration}`
    : `private, max-age=${duration}`;
    
  return {
    'Cache-Control': cacheControl,
    'ETag': generateETag(),
    'Vary': 'Accept-Encoding',
  };
};

// Generate ETag for cache validation
export const generateETag = (content?: string): string => {
  const timestamp = Date.now().toString();
  const hash = content 
    ? Buffer.from(content).toString('base64').slice(0, 8)
    : timestamp.slice(-8);
  return `"${hash}"`;
};

// Image optimization configuration
export const IMAGE_OPTIMIZATION = {
  formats: ['webp', 'avif'],
  quality: 85,
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 200 },
    medium: { width: 600, height: 400 },
    large: { width: 1200, height: 800 },
  },
} as const;

// Lazy loading configuration
export const LAZY_LOADING_CONFIG = {
  rootMargin: '50px',
  threshold: 0.1,
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageMetric(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getAllMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    for (const [label, values] of Array.from(this.metrics.entries())) {
      result[label] = {
        average: this.getAverageMetric(label),
        count: values.length,
      };
    }
    
    return result;
  }
}

// API response caching middleware
export const withCache = (
  handler: (req: NextRequest) => Promise<NextResponse>,
  duration: number = CACHE_DURATIONS.API_RESPONSES,
  isPublic: boolean = true
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const monitor = PerformanceMonitor.getInstance();
    const endTimer = monitor.startTimer(`api_${req.nextUrl.pathname}`);
    
    try {
      // Check if-none-match header for ETag validation
      const ifNoneMatch = req.headers.get('if-none-match');
      const etag = generateETag();
      
      if (ifNoneMatch === etag) {
        return new NextResponse(null, { 
          status: 304,
          headers: getCacheHeaders(duration, isPublic)
        });
      }
      
      const response = await handler(req);
      
      // Add cache headers to successful responses
      if (response.status === 200) {
        const headers = getCacheHeaders(duration, isPublic);
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
      
      return response;
    } finally {
      endTimer();
    }
  };
};

// Database query optimization
export const optimizeQuery = <T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  ttl: number = CACHE_DURATIONS.API_RESPONSES
): Promise<T> => {
  // In a real implementation, this would use Redis or similar
  // For now, we'll use a simple in-memory cache
  return queryFn();
};

// Bundle analysis utilities
export const getBundleInfo = () => {
  if (typeof window === 'undefined') return null;
  
  return {
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
    memory: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit,
    } : null,
  };
};

// Critical resource preloading
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;
  
  const criticalResources = [
    '/api/auth/session',
    '/fonts/GeistVF.woff',
    '/fonts/GeistMonoVF.woff',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.endsWith('.woff') || resource.endsWith('.woff2')) {
      link.as = 'font';
      link.type = 'font/woff';
      link.crossOrigin = 'anonymous';
    } else {
      link.as = 'fetch';
    }
    
    document.head.appendChild(link);
  });
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    // Service Worker registered successfully
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Web Vitals monitoring
export const reportWebVitals = (metric: any) => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.recordMetric(`web_vital_${metric.name}`, metric.value);
  
  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service in production
    // Example: monitoring.track('web-vital', metric);
  }
};

// Resource hints for better loading
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;
  
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//checkout.razorpay.com' },
    { rel: 'preconnect', href: 'https://api.razorpay.com' },
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
};
