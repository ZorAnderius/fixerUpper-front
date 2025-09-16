/**
 * Advanced Rate Limiter
 * Protects against DDoS attacks and excessive API usage
 */

import { SECURITY_CONFIG } from './constants.js';

class RateLimiter {
  constructor(options = {}) {
    this.config = {
      windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
      maxRequests: options.maxRequests || 100,
      blockDuration: options.blockDuration || 60 * 60 * 1000, // 1 hour
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
      ...options
    };

    // In-memory storage (in production, use Redis or database)
    this.requests = new Map();
    this.blockedIPs = new Map();
    this.globalCounters = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - IP address or user ID
   * @param {Object} options - Request options
   * @returns {Object} - Rate limit result
   */
  checkRateLimit(identifier, options = {}) {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean expired entries
    this.cleanExpiredEntries(windowStart);

    // Check if IP is blocked
    if (this.isBlocked(identifier)) {
      return {
        allowed: false,
        reason: 'blocked',
        retryAfter: this.getBlockTimeRemaining(identifier),
        headers: this.getRateLimitHeaders(0, this.config.maxRequests, now)
      };
    }

    // Get or create request history
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const requestHistory = this.requests.get(identifier);
    const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);

    // Check rate limit
    if (recentRequests.length >= this.config.maxRequests) {
      // Block IP if too many requests
      this.blockIP(identifier, this.config.blockDuration);
      
      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        retryAfter: this.config.blockDuration,
        headers: this.getRateLimitHeaders(0, this.config.maxRequests, now)
      };
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Update global counters
    this.updateGlobalCounters(now, windowStart);

    return {
      allowed: true,
      remaining: this.config.maxRequests - recentRequests.length,
      resetTime: windowStart + this.config.windowMs,
      headers: this.getRateLimitHeaders(
        this.config.maxRequests - recentRequests.length,
        this.config.maxRequests,
        now
      )
    };
  }

  /**
   * Check rate limit for specific endpoint
   * @param {string} identifier - IP or user ID
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Endpoint-specific options
   * @returns {Object} - Rate limit result
   */
  checkEndpointRateLimit(identifier, endpoint, options = {}) {
    const endpointConfig = {
      ...this.config,
      ...SECURITY_CONFIG.endpoints[endpoint],
      ...options
    };

    const endpointKey = `${identifier}:${endpoint}`;
    return this.checkRateLimit(endpointKey, endpointConfig);
  }

  /**
   * Check rate limit for authentication attempts
   * @param {string} identifier - IP address
   * @param {string} username - Username (optional)
   * @returns {Object} - Rate limit result
   */
  checkAuthRateLimit(identifier, username = null) {
    const authConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per 15 minutes
      blockDuration: 60 * 60 * 1000, // 1 hour block
      ...SECURITY_CONFIG.auth
    };

    const authKey = username ? `${identifier}:${username}` : identifier;
    return this.checkRateLimit(authKey, authConfig);
  }

  /**
   * Check rate limit for form submissions
   * @param {string} identifier - IP address
   * @param {string} formType - Type of form (login, register, contact, etc.)
   * @returns {Object} - Rate limit result
   */
  checkFormRateLimit(identifier, formType) {
    const formConfig = {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 3, // 3 submissions per 5 minutes
      blockDuration: 30 * 60 * 1000, // 30 minutes block
      ...SECURITY_CONFIG.forms[formType]
    };

    const formKey = `${identifier}:${formType}`;
    return this.checkRateLimit(formKey, formConfig);
  }

  /**
   * Check global rate limit (all requests from all IPs)
   * @returns {Object} - Global rate limit result
   */
  checkGlobalRateLimit() {
    const globalConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000, // 1000 requests per minute globally
      ...SECURITY_CONFIG.global
    };

    const now = Date.now();
    const windowStart = now - globalConfig.windowMs;

    // Clean global counters
    this.cleanGlobalCounters(windowStart);

    // Count current requests
    let totalRequests = 0;
    this.requests.forEach(requestHistory => {
      totalRequests += requestHistory.filter(timestamp => timestamp > windowStart).length;
    });

    if (totalRequests >= globalConfig.maxRequests) {
      return {
        allowed: false,
        reason: 'global_rate_limit_exceeded',
        retryAfter: globalConfig.windowMs,
        totalRequests
      };
    }

    return {
      allowed: true,
      remaining: globalConfig.maxRequests - totalRequests,
      totalRequests
    };
  }

  /**
   * Block IP address
   * @param {string} identifier - IP address
   * @param {number} duration - Block duration in ms
   */
  blockIP(identifier, duration) {
    this.blockedIPs.set(identifier, Date.now() + duration);
  }

  /**
   * Unblock IP address
   * @param {string} identifier - IP address
   */
  unblockIP(identifier) {
    this.blockedIPs.delete(identifier);
  }

  /**
   * Check if IP is blocked
   * @param {string} identifier - IP address
   * @returns {boolean} - Is blocked
   */
  isBlocked(identifier) {
    const blockUntil = this.blockedIPs.get(identifier);
    if (!blockUntil) return false;

    if (blockUntil > Date.now()) {
      return true;
    } else {
      // Block expired, remove it
      this.blockedIPs.delete(identifier);
      return false;
    }
  }

  /**
   * Get remaining block time
   * @param {string} identifier - IP address
   * @returns {number} - Remaining time in ms
   */
  getBlockTimeRemaining(identifier) {
    const blockUntil = this.blockedIPs.get(identifier);
    if (!blockUntil) return 0;

    const remaining = blockUntil - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Get rate limit statistics
   * @param {string} identifier - IP address (optional)
   * @returns {Object} - Statistics
   */
  getStats(identifier = null) {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (identifier) {
      const requestHistory = this.requests.get(identifier) || [];
      const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);
      
      return {
        identifier,
        requestsInWindow: recentRequests.length,
        maxRequests: this.config.maxRequests,
        remaining: this.config.maxRequests - recentRequests.length,
        isBlocked: this.isBlocked(identifier),
        blockTimeRemaining: this.getBlockTimeRemaining(identifier)
      };
    }

    // Global stats
    let totalRequests = 0;
    let activeIPs = 0;
    
    this.requests.forEach(requestHistory => {
      const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);
      if (recentRequests.length > 0) {
        totalRequests += recentRequests.length;
        activeIPs++;
      }
    });

    return {
      totalRequests,
      activeIPs,
      blockedIPs: this.blockedIPs.size,
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests
    };
  }

  // Helper methods
  cleanExpiredEntries(windowStart) {
    this.requests.forEach((requestHistory, identifier) => {
      const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    });
  }

  cleanGlobalCounters(windowStart) {
    // Implementation for global counter cleanup
    // This would be more complex in a real application
  }

  updateGlobalCounters(now, windowStart) {
    // Update global counters for monitoring
    const minute = Math.floor(now / (60 * 1000));
    const currentCount = this.globalCounters.get(minute) || 0;
    this.globalCounters.set(minute, currentCount + 1);

    // Clean old counters
    const oldMinute = Math.floor(windowStart / (60 * 1000));
    this.globalCounters.delete(oldMinute);
  }

  getRateLimitHeaders(remaining, limit, now) {
    return {
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': Math.ceil((now + this.config.windowMs) / 1000),
      'X-RateLimit-Window': this.config.windowMs
    };
  }

  /**
   * Clear all data (for testing or maintenance)
   */
  clear() {
    this.requests.clear();
    this.blockedIPs.clear();
    this.globalCounters.clear();
  }
}

export { RateLimiter };
