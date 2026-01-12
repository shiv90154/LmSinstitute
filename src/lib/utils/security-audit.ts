/**
 * Security audit utilities and tests
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Security configuration constants
export const SECURITY_CONFIG = {
  JWT_MIN_LENGTH: 32,
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  CSRF_TOKEN_LENGTH: 32,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

// Security headers validation
export const REQUIRED_SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
} as const;

// Security audit results interface
export interface SecurityAuditResult {
  passed: boolean;
  score: number;
  issues: SecurityIssue[];
  recommendations: string[];
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  location?: string;
  fix?: string;
}

// Main security audit class
export class SecurityAuditor {
  private issues: SecurityIssue[] = [];
  private recommendations: string[] = [];

  // Run complete security audit
  async runAudit(): Promise<SecurityAuditResult> {
    this.issues = [];
    this.recommendations = [];

    // Run all security checks
    await this.auditEnvironmentVariables();
    await this.auditDependencies();
    await this.auditAuthenticationSecurity();
    await this.auditPaymentSecurity();
    await this.auditVideoProtection();
    await this.auditInputValidation();
    await this.auditRateLimiting();
    await this.auditErrorHandling();

    // Calculate security score
    const score = this.calculateSecurityScore();

    return {
      passed: score >= 80,
      score,
      issues: this.issues,
      recommendations: this.recommendations,
    };
  }

  // Audit environment variables
  private async auditEnvironmentVariables(): Promise<void> {
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'JWT_SECRET',
      'MONGODB_URI',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.addIssue({
          severity: 'critical',
          category: 'Environment',
          description: `Missing required environment variable: ${envVar}`,
          fix: `Set ${envVar} in your environment configuration`,
        });
      } else if (envVar.includes('SECRET') && process.env[envVar]!.length < SECURITY_CONFIG.JWT_MIN_LENGTH) {
        this.addIssue({
          severity: 'high',
          category: 'Environment',
          description: `${envVar} is too short (minimum ${SECURITY_CONFIG.JWT_MIN_LENGTH} characters)`,
          fix: `Generate a longer, more secure secret for ${envVar}`,
        });
      }
    }

    // Check for development secrets in production
    if (process.env.NODE_ENV === 'production') {
      const devSecrets = ['dev', 'test', 'development', 'localhost'];
      for (const envVar of requiredEnvVars) {
        const value = process.env[envVar]?.toLowerCase() || '';
        if (devSecrets.some(dev => value.includes(dev))) {
          this.addIssue({
            severity: 'critical',
            category: 'Environment',
            description: `${envVar} appears to contain development values in production`,
            fix: `Use production-grade secrets for ${envVar}`,
          });
        }
      }
    }
  }

  // Audit dependencies for known vulnerabilities
  private async auditDependencies(): Promise<void> {
    // In a real implementation, this would check against vulnerability databases
    this.recommendations.push('Run `npm audit` regularly to check for dependency vulnerabilities');
    this.recommendations.push('Keep all dependencies updated to their latest secure versions');
  }

  // Audit authentication security
  private async auditAuthenticationSecurity(): Promise<void> {
    // Check JWT configuration
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < SECURITY_CONFIG.JWT_MIN_LENGTH) {
      this.addIssue({
        severity: 'critical',
        category: 'Authentication',
        description: 'JWT secret is missing or too weak',
        fix: 'Generate a strong, random JWT secret of at least 32 characters',
      });
    }

    // Check NextAuth configuration
    if (!process.env.NEXTAUTH_SECRET) {
      this.addIssue({
        severity: 'critical',
        category: 'Authentication',
        description: 'NextAuth secret is missing',
        fix: 'Set NEXTAUTH_SECRET environment variable',
      });
    }

    // Check session configuration
    this.recommendations.push('Implement session timeout and automatic logout');
    this.recommendations.push('Use secure, httpOnly cookies for session management');
    this.recommendations.push('Implement proper password hashing with bcrypt');
  }

  // Audit payment security
  private async auditPaymentSecurity(): Promise<void> {
    // Check Razorpay configuration
    if (!process.env.RAZORPAY_KEY_SECRET) {
      this.addIssue({
        severity: 'critical',
        category: 'Payment',
        description: 'Razorpay secret key is missing',
        fix: 'Set RAZORPAY_KEY_SECRET environment variable',
      });
    }

    // Webhook security recommendations
    this.recommendations.push('Always verify Razorpay webhook signatures');
    this.recommendations.push('Use HTTPS for all payment-related communications');
    this.recommendations.push('Implement proper payment state validation');
    this.recommendations.push('Log all payment transactions for audit purposes');
  }

  // Audit video protection
  private async auditVideoProtection(): Promise<void> {
    this.recommendations.push('Ensure YouTube videos are set to unlisted or private');
    this.recommendations.push('Implement proper iframe sandboxing for video embeds');
    this.recommendations.push('Use CSP headers to restrict video source domains');
    this.recommendations.push('Implement video access logging for security monitoring');
  }

  // Audit input validation
  private async auditInputValidation(): Promise<void> {
    this.recommendations.push('Validate all user inputs on both client and server side');
    this.recommendations.push('Use parameterized queries to prevent SQL injection');
    this.recommendations.push('Sanitize all user-generated content before display');
    this.recommendations.push('Implement proper file upload validation and scanning');
  }

  // Audit rate limiting
  private async auditRateLimiting(): Promise<void> {
    this.recommendations.push('Implement rate limiting on all API endpoints');
    this.recommendations.push('Use progressive delays for repeated failed login attempts');
    this.recommendations.push('Monitor and alert on suspicious activity patterns');
  }

  // Audit error handling
  private async auditErrorHandling(): Promise<void> {
    this.recommendations.push('Never expose sensitive information in error messages');
    this.recommendations.push('Log all security-related errors for monitoring');
    this.recommendations.push('Implement proper error boundaries in React components');
    this.recommendations.push('Use generic error messages for authentication failures');
  }

  // Add security issue
  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  // Calculate security score based on issues
  private calculateSecurityScore(): number {
    let score = 100;
    
    for (const issue of this.issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }
}

// Security validation utilities
export class SecurityValidator {
  // Validate request headers
  static validateSecurityHeaders(headers: Headers): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const [header, expectedValue] of Object.entries(REQUIRED_SECURITY_HEADERS)) {
      const actualValue = headers.get(header);
      if (!actualValue || actualValue !== expectedValue) {
        issues.push({
          severity: 'medium',
          category: 'Headers',
          description: `Missing or incorrect security header: ${header}`,
          fix: `Set ${header} header to: ${expectedValue}`,
        });
      }
    }

    return issues;
  }

  // Validate input against XSS
  static validateXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ];

    return !xssPatterns.some(pattern => pattern.test(input));
  }

  // Validate SQL injection patterns
  static validateSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\b.*=.*)/gi,
      /(--|\/\*|\*\/)/gi,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi,
    ];

    return !sqlPatterns.some(pattern => pattern.test(input));
  }

  // Validate file upload security
  static validateFileUpload(filename: string, mimeType: string, size: number): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

    // Check file size
    if (size > maxSize) {
      issues.push({
        severity: 'medium',
        category: 'File Upload',
        description: 'File size exceeds maximum allowed limit',
        fix: 'Reduce file size or increase limit if necessary',
      });
    }

    // Check MIME type
    if (!allowedTypes.includes(mimeType)) {
      issues.push({
        severity: 'high',
        category: 'File Upload',
        description: 'File type not allowed',
        fix: 'Only upload allowed file types',
      });
    }

    // Check file extension
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      issues.push({
        severity: 'high',
        category: 'File Upload',
        description: 'File extension not allowed',
        fix: 'Use allowed file extensions only',
      });
    }

    return issues;
  }

  // Validate password strength
  static validatePasswordStrength(password: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      issues.push({
        severity: 'high',
        category: 'Password',
        description: `Password is too short (minimum ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters)`,
        fix: 'Use a longer password',
      });
    }

    if (!/[a-z]/.test(password)) {
      issues.push({
        severity: 'medium',
        category: 'Password',
        description: 'Password should contain lowercase letters',
        fix: 'Add lowercase letters to password',
      });
    }

    if (!/[A-Z]/.test(password)) {
      issues.push({
        severity: 'medium',
        category: 'Password',
        description: 'Password should contain uppercase letters',
        fix: 'Add uppercase letters to password',
      });
    }

    if (!/\d/.test(password)) {
      issues.push({
        severity: 'medium',
        category: 'Password',
        description: 'Password should contain numbers',
        fix: 'Add numbers to password',
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push({
        severity: 'low',
        category: 'Password',
        description: 'Password should contain special characters',
        fix: 'Add special characters to password',
      });
    }

    return issues;
  }
}

// CSRF protection utilities
export class CSRFProtection {
  static generateToken(): string {
    return crypto.randomBytes(SECURITY_CONFIG.CSRF_TOKEN_LENGTH).toString('hex');
  }

  static validateToken(token: string, sessionToken: string): boolean {
    try {
      const tokenBuffer = Buffer.from(token, 'hex');
      const sessionBuffer = Buffer.from(sessionToken, 'hex');
      
      // Ensure buffers are the same length for timingSafeEqual
      if (tokenBuffer.length !== sessionBuffer.length) {
        return false;
      }
      
      return crypto.timingSafeEqual(tokenBuffer, sessionBuffer);
    } catch (error) {
      return false;
    }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static checkLimit(
    identifier: string,
    maxRequests: number = SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    windowMs: number = SECURITY_CONFIG.RATE_LIMIT_WINDOW
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    
    const current = this.requests.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset or initialize
      const resetTime = now + windowMs;
      this.requests.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: maxRequests - 1, resetTime };
    }
    
    if (current.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime };
    }
    
    current.count++;
    this.requests.set(key, current);
    
    return { 
      allowed: true, 
      remaining: maxRequests - current.count, 
      resetTime: current.resetTime 
    };
  }
}
