/**
 * Rate Limiting Constants
 * Configuration and patterns for rate limiting
 */

// Default rate limiting configuration
export const RATE_LIMITING_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  blockDuration: 60 * 60 * 1000, // 1 hour
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

// Global rate limiting
export const GLOBAL_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000, // 1000 requests per minute globally
  blockDuration: 5 * 60 * 1000 // 5 minutes
};

// Authentication endpoints
export const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  blockDuration: 60 * 60 * 1000, // 1 hour
  progressiveDelay: true
};

// API endpoints configuration
export const API_ENDPOINTS = {
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
};

// Form submission limits
export const FORM_LIMITS = {
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
};

// Performance settings
export const PERFORMANCE_SETTINGS = {
  CACHE_TTL: {
    RATE_LIMIT: 15 * 60 * 1000, // 15 minutes
    BRUTE_FORCE: 60 * 60 * 1000, // 1 hour
    BOT_DETECTION: 30 * 60 * 1000 // 30 minutes
  },
  CLEANUP_INTERVALS: {
    RATE_LIMIT: 5 * 60 * 1000, // 5 minutes
    BRUTE_FORCE: 15 * 60 * 1000, // 15 minutes
    BOT_DETECTION: 10 * 60 * 1000 // 10 minutes
  },
  MAX_STORAGE: {
    RATE_LIMIT_ENTRIES: 10000,
    BRUTE_FORCE_ENTRIES: 1000,
    BOT_DETECTION_ENTRIES: 5000
  }
};
