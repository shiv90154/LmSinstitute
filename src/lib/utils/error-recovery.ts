/**
 * Error Recovery Utilities
 * Provides comprehensive error handling and recovery mechanisms
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  action?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'payment' | 'content' | 'system' | 'unknown';
  recoverable: boolean;
  retryCount?: number;
}

/**
 * Error classification and recovery strategies
 */
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorReports: Map<string, ErrorReport> = new Map();
  private retryAttempts: Map<string, number> = new Map();

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  /**
   * Classify error and determine recovery strategy
   */
  classifyError(error: Error, context: Partial<ErrorContext> = {}): ErrorReport {
    const errorId = this.generateErrorId();
    const fullContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      ...context
    };

    let category: ErrorReport['category'] = 'unknown';
    let severity: ErrorReport['severity'] = 'medium';
    let recoverable = true;

    // Classify based on error message and type
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      category = 'network';
      severity = 'medium';
      recoverable = true;
    } else if (message.includes('unauthorized') || message.includes('authentication') || message.includes('token')) {
      category = 'authentication';
      severity = 'high';
      recoverable = true;
    } else if (message.includes('payment') || message.includes('razorpay') || message.includes('order')) {
      category = 'payment';
      severity = 'high';
      recoverable = true;
    } else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      category = 'validation';
      severity = 'low';
      recoverable = true;
    } else if (message.includes('content') || message.includes('video') || message.includes('course')) {
      category = 'content';
      severity = 'medium';
      recoverable = true;
    } else if (error.name === 'ChunkLoadError' || message.includes('loading chunk')) {
      category = 'system';
      severity = 'medium';
      recoverable = true;
    } else if (message.includes('out of memory') || message.includes('maximum call stack')) {
      category = 'system';
      severity = 'critical';
      recoverable = false;
    }

    const report: ErrorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      context: fullContext,
      severity,
      category,
      recoverable,
      retryCount: this.retryAttempts.get(error.message) || 0
    };

    this.errorReports.set(errorId, report);
    return report;
  }

  /**
   * Attempt to recover from error
   */
  async attemptRecovery(errorReport: ErrorReport): Promise<{
    success: boolean;
    strategy: string;
    message: string;
  }> {
    if (!errorReport.recoverable) {
      return {
        success: false,
        strategy: 'none',
        message: 'Error is not recoverable'
      };
    }

    const retryCount = this.retryAttempts.get(errorReport.message) || 0;
    
    // Prevent infinite retry loops
    if (retryCount >= 3) {
      return {
        success: false,
        strategy: 'max_retries_reached',
        message: 'Maximum retry attempts reached'
      };
    }

    this.retryAttempts.set(errorReport.message, retryCount + 1);

    switch (errorReport.category) {
      case 'network':
        return this.recoverFromNetworkError(errorReport);
      
      case 'authentication':
        return this.recoverFromAuthError(errorReport);
      
      case 'payment':
        return this.recoverFromPaymentError(errorReport);
      
      case 'content':
        return this.recoverFromContentError(errorReport);
      
      case 'system':
        return this.recoverFromSystemError(errorReport);
      
      default:
        return this.genericRecovery(errorReport);
    }
  }

  /**
   * Network error recovery
   */
  private async recoverFromNetworkError(errorReport: ErrorReport): Promise<{
    success: boolean;
    strategy: string;
    message: string;
  }> {
    // Check network connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        strategy: 'offline',
        message: 'Device is offline. Please check your internet connection.'
      };
    }

    // Retry with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, errorReport.retryCount || 0), 10000);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      strategy: 'retry_with_backoff',
      message: `Retrying request after ${delay}ms delay`
    };
  }

  /**
   * Authentication error recovery
   */
  private async recoverFromAuthError(errorReport: ErrorReport): Promise<{
    success: boolean;
    strategy: string;
    message: string;
  }> {
    // Attempt token refresh
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        return {
          success: true,
          strategy: 'token_refresh',
          message: 'Authentication token refreshed successfully'
        };
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }

    // Redirect to login if refresh fails
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname;
      window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
    }

    return {
      success: false,
      strategy: 'redirect_to_login',
      message: 'Redirecting to login page'
    };
  }

  /**
   * Payment error recovery
   */
  private async recoverFromPaymentError(errorReport: ErrorReport): Promise<{
    success: boolean;
    strategy: string;
    message: string;
  }> {
    // For payment errors, we typically don't auto-retry
    // Instead, preserve state and guide user
    return {
      success: false,
      strategy: 'preserve_state',
      message: 'Payment error occurred. Your cart has been preserved. Please try again.'
    };
  }

  /**
   * Content error recovery
   */
  private async recoverFromContentError(errorReport: ErrorReport): Promise<{
    success: boolean;
    strategy: string;
    message: string;
  }> {
    // Try to reload content or provide alternative
    return {
      success: true,
      strategy: 'reload_content',
      message: 'Attempting to reload content'
    };
  }

  /**
   * System error recovery
   */
  private async recoverFromSystemError(errorReport: ErrorReport): Promise<{
    success: boolean;
    strategy: string;
    message: string;
  }> {
    // For chunk load errors, reload the page
    if (errorReport.message.includes('loading chunk') || errorReport.message.includes('ChunkLoadError')) {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      
      return {
        success: true,
        strategy: 'page_reload',
        message: 'Reloading page to fix chunk loading error'
      };
    }

    return {
      success: false,
      strategy: 'manual_intervention',
      message: 'System error requires manual intervention'
    };
  }

  /**
   * Generic recovery strategy
   */
  private async genericRecovery(errorReport: ErrorReport): Promise<{
    success: boolean;
    strategy: string;
    message: string;
  }> {
    // Simple retry for unknown errors
    const delay = 1000 + (errorReport.retryCount || 0) * 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      strategy: 'generic_retry',
      message: `Retrying operation after ${delay}ms`
    };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recoverableErrors: number;
  } {
    const reports = Array.from(this.errorReports.values());
    
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    let recoverableErrors = 0;

    reports.forEach(report => {
      errorsByCategory[report.category] = (errorsByCategory[report.category] || 0) + 1;
      errorsBySeverity[report.severity] = (errorsBySeverity[report.severity] || 0) + 1;
      if (report.recoverable) recoverableErrors++;
    });

    return {
      totalErrors: reports.length,
      errorsByCategory,
      errorsBySeverity,
      recoverableErrors
    };
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorReports.clear();
    this.retryAttempts.clear();
  }
}

/**
 * Global error handler function
 */
export function handleGlobalError(
  error: Error,
  context: Partial<ErrorContext> = {}
): Promise<{ success: boolean; strategy: string; message: string }> {
  const manager = ErrorRecoveryManager.getInstance();
  const report = manager.classifyError(error, context);
  
  console.error('Global error handled:', {
    id: report.id,
    category: report.category,
    severity: report.severity,
    message: report.message,
    context: report.context
  });

  return manager.attemptRecovery(report);
}

/**
 * Utility to wrap async operations with error recovery
 */
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  context: Partial<ErrorContext> = {},
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries - 1) {
        // Last attempt failed, handle error
        await handleGlobalError(lastError, {
          ...context,
          action: 'final_attempt_failed'
        });
        throw lastError;
      }

      // Attempt recovery
      const recovery = await handleGlobalError(lastError, {
        ...context,
        action: `retry_attempt_${attempt + 1}`
      });

      if (!recovery.success) {
        throw lastError;
      }

      // Wait before retry if suggested by recovery strategy
      if (recovery.strategy.includes('backoff') || recovery.strategy.includes('delay')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError!;
}
