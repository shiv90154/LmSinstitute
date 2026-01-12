/**
 * API Middleware Wrapper
 * Provides reusable middleware functions for API route protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withAccessControl, AccessControlOptions } from './access-control';
import { 
  validatePaymentVerification, 
  validateWebhookRequest, 
  validateOrderCreation,
  validateRefundRequest,
  checkPaymentRateLimit,
  logPaymentValidation
} from './payment-validation';

export interface ApiMiddlewareOptions extends AccessControlOptions {
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  validatePayment?: boolean;
  validateWebhook?: boolean;
  logAccess?: boolean;
}

/**
 * Comprehensive API middleware wrapper
 */
export function withApiMiddleware(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = {}
) {
  return async (request: NextRequest, context: any = {}) => {
    try {
      const startTime = Date.now();
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';

      // Apply rate limiting if configured
      if (options.rateLimit) {
        const { maxRequests, windowMs } = options.rateLimit;
        const rateLimit = checkPaymentRateLimit(clientIP, maxRequests, windowMs);
        
        if (!rateLimit.allowed) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Too many requests',
              code: 'RATE_LIMIT_EXCEEDED'
            },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0'
              }
            }
          );
        }
      }

      // Apply access control
      const accessResult = await withAccessControl(request, options);
      
      // Check if access control returned an error response
      if (accessResult instanceof NextResponse) {
        return accessResult;
      }

      const { session, userAccess, isAuthenticated, isAdmin } = accessResult;

      // Validate webhook requests
      if (options.validateWebhook) {
        const webhookValidation = await validateWebhookRequest(request);
        if (!webhookValidation.isValid) {
          logPaymentValidation(
            'webhook',
            false,
            undefined,
            undefined,
            webhookValidation.error,
            request
          );
          
          return NextResponse.json(
            { 
              success: false, 
              error: webhookValidation.error,
              code: webhookValidation.code
            },
            { status: 400 }
          );
        }
        
        context.webhookPayload = webhookValidation.order;
      }

      // Validate payment requests
      if (options.validatePayment && request.method === 'POST') {
        const paymentValidation = await validatePaymentVerification(request);
        if (!paymentValidation.isValid) {
          logPaymentValidation(
            'verification',
            false,
            session?.user?.id,
            undefined,
            paymentValidation.error,
            request
          );
          
          return NextResponse.json(
            { 
              success: false, 
              error: paymentValidation.error,
              code: paymentValidation.code
            },
            { status: 400 }
          );
        }
        
        context.paymentData = {
          order: paymentValidation.order,
          user: paymentValidation.user
        };
      }

      // Add context information
      context.session = session;
      context.userAccess = userAccess;
      context.isAuthenticated = isAuthenticated;
      context.isAdmin = isAdmin;
      context.clientIP = clientIP;
      context.startTime = startTime;

      // Log access if enabled
      if (options.logAccess && process.env.NODE_ENV === 'production') {
        // Send to logging service: logger.info('API Access', {
        //   timestamp: new Date().toISOString(),
        //   method: request.method,
        //   url: request.url,
        //   userId: session?.user?.id || 'anonymous',
        //   userRole: session?.user?.role || 'none',
        //   ip: clientIP,
        //   userAgent: request.headers.get('user-agent') || 'unknown'
        // });
      }

      // Execute the handler
      const response = await handler(request, context);

      // Add processing time header
      const processingTime = Date.now() - startTime;
      response.headers.set('X-Processing-Time', `${processingTime}ms`);

      return response;

    } catch (error) {
      console.error('API middleware error:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware specifically for payment endpoints
 */
export function withPaymentMiddleware(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    validatePayment: true,
    rateLimit: {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    logAccess: true
  });
}

/**
 * Middleware specifically for webhook endpoints
 */
export function withWebhookMiddleware(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return withApiMiddleware(handler, {
    requireAuth: false,
    validateWebhook: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60 * 1000 // 1 minute
    },
    logAccess: true
  });
}

/**
 * Middleware specifically for admin endpoints
 */
export function withAdminMiddleware(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    adminOnly: true,
    rateLimit: {
      maxRequests: 50,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    logAccess: true
  });
}

/**
 * Middleware for protected content endpoints
 */
export function withContentMiddleware(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    requirePurchase: true,
    allowFreeContent: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    logAccess: false // Don't log content access to reduce noise
  });
}

/**
 * Helper function to validate order creation with middleware
 */
export async function validateOrderCreationMiddleware(
  request: NextRequest,
  userId: string
) {
  const validation = await validateOrderCreation(request, userId);
  
  logPaymentValidation(
    'order_creation',
    validation.isValid,
    userId,
    undefined,
    validation.error,
    request
  );
  
  return validation;
}

/**
 * Helper function to validate refund requests with middleware
 */
export async function validateRefundMiddleware(
  request: NextRequest,
  userId: string,
  isAdmin: boolean = false
) {
  const validation = await validateRefundRequest(request, userId, isAdmin);
  
  logPaymentValidation(
    'refund',
    validation.isValid,
    userId,
    validation.order?._id,
    validation.error,
    request
  );
  
  return validation;
}

/**
 * Error response helper
 */
export function createErrorResponse(
  error: string,
  code: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    { 
      success: false, 
      error,
      code,
      ...(details && { details })
    },
    { status }
  );
}

/**
 * Success response helper
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    { 
      success: true,
      data,
      ...(message && { message })
    },
    { status }
  );
}
