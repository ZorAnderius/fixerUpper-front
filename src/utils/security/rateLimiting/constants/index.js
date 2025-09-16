/**
 * Security Constants - Main Index
 * Centralized exports for all security constants
 */

// Rate limiting constants
export * from './rateLimiting.js';

// Security constants
export * from './security.js';

// Bot detection constants
export * from './botDetection.js';

// Security headers constants
export * from './headers.js';

// Default configuration
export const DEFAULT_CONFIG = {
  // Rate limiting configuration
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
    blockDuration: 60 * 60 * 1000, // 1 hour
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Brute force protection configuration
  bruteForceProtection: {
    maxAttempts: 5, // 5 attempts per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 60 * 60 * 1000, // 1 hour
    progressiveDelay: true,
    maxDelay: 30 * 1000, // 30 seconds
    rapidFireThreshold: 10, // 10 attempts per minute
    rapidFireBlockDuration: 2 * 60 * 60 * 1000 // 2 hours
  },

  // Bot detection configuration
  botDetection: {
    enableBehavioralAnalysis: true,
    enableFingerprinting: true,
    enableCAPTCHA: true,
    suspiciousThreshold: 0.7,
    autoBlockThreshold: 0.9,
    captchaMaxAttempts: 3,
    captchaTimeout: 5 * 60 * 1000 // 5 minutes
  },

  // Security headers configuration
  securityHeaders: {
    enableCSP: true,
    enableHSTS: true,
    enableXFrameOptions: true,
    enableXSSProtection: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true
  },

  // Monitoring configuration
  monitoring: {
    enableRealTimeMonitoring: true,
    enableAlerting: true,
    retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    alertThresholds: {
      highRiskScore: 0.8,
      rapidRequests: 100,
      suspiciousIPs: 10,
      bruteForceAttempts: 5
    }
  }
};

// Security configuration for different endpoints
export const SECURITY_CONFIG = {
  // Global rate limiting
  global: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute globally
    blockDuration: 5 * 60 * 1000 // 5 minutes
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    blockDuration: 60 * 60 * 1000, // 1 hour
    progressiveDelay: true
  },

  // API endpoints
  endpoints: {
    '/api/auth/login': {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
      blockDuration: 60 * 60 * 1000
    },
    '/api/auth/register': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 registrations per hour
      blockDuration: 60 * 60 * 1000
    },
    '/api/auth/reset-password': {
      windowMs: 60 * 60 * 1000,
      maxRequests: 3,
      blockDuration: 60 * 60 * 1000
    },
    '/api/products': {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // 60 requests per minute
      blockDuration: 10 * 60 * 1000 // 10 minutes
    },
    '/api/orders': {
      windowMs: 60 * 1000,
      maxRequests: 20, // 20 orders per minute
      blockDuration: 30 * 60 * 1000 // 30 minutes
    },
    '/api/cart': {
      windowMs: 60 * 1000,
      maxRequests: 100, // 100 cart operations per minute
      blockDuration: 5 * 60 * 1000 // 5 minutes
    }
  },

  // Form submission limits
  forms: {
    login: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 3,
      blockDuration: 30 * 60 * 1000 // 30 minutes
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 2,
      blockDuration: 60 * 60 * 1000 // 1 hour
    },
    contact: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5,
      blockDuration: 60 * 60 * 1000 // 1 hour
    },
    checkout: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 3,
      blockDuration: 30 * 60 * 1000 // 30 minutes
    }
  }
};
