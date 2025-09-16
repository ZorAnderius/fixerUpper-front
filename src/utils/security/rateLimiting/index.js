/**
 * Rate Limiting System - Main Index
 * Comprehensive protection against DDoS, brute force, and bot attacks
 */

// Export all rate limiting modules
export * from './rateLimiter.js';
export * from './bruteForceProtection.js';
export * from './botDetection/index.js';
export * from './securityHeaders.js';
export * from './monitoring.js';
export * from './constants/index.js';

// Default export with all functionality
import { RateLimiter } from './rateLimiter.js';
import { BruteForceProtection } from './bruteForceProtection.js';
import { BotDetection } from './botDetection/index.js';
import { SecurityHeaders } from './securityHeaders.js';
import { SecurityMonitor } from './monitoring.js';
import { DEFAULT_CONFIG } from './constants/index.js';

export default {
  RateLimiter,
  BruteForceProtection,
  BotDetection,
  SecurityHeaders,
  SecurityMonitor,
  config: DEFAULT_CONFIG
};
