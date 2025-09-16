/**
 * Brute Force Protection System
 * Advanced protection against password brute force attacks
 */

class BruteForceProtection {
  constructor(options = {}) {
    this.config = {
      maxAttempts: options.maxAttempts || 5,
      windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
      blockDuration: options.blockDuration || 60 * 60 * 1000, // 1 hour
      progressiveDelay: options.progressiveDelay || true,
      maxDelay: options.maxDelay || 30 * 1000, // 30 seconds
      ...options
    };

    // Storage for failed attempts
    this.failedAttempts = new Map(); // identifier -> { attempts: [], lastAttempt: timestamp }
    this.blockedAccounts = new Map(); // identifier -> blockUntil
    this.suspiciousPatterns = new Map(); // pattern -> count
  }

  /**
   * Check if authentication attempt is allowed
   * @param {string} identifier - IP address or user ID
   * @param {Object} options - Additional options
   * @returns {Object} - Protection result
   */
  checkAuthAttempt(identifier, options = {}) {
    const {
      username = null,
      password = null,
      endpoint = 'login'
    } = options;

    const now = Date.now();
    const key = username ? `${identifier}:${username}` : identifier;

    // Check if account is blocked
    if (this.isBlocked(key)) {
      return {
        allowed: false,
        reason: 'account_blocked',
        retryAfter: this.getBlockTimeRemaining(key),
        attempts: this.getFailedAttempts(key),
        progressiveDelay: this.calculateProgressiveDelay(key)
      };
    }

    // Get failed attempts
    const attempts = this.getFailedAttempts(key);
    const recentAttempts = attempts.filter(timestamp => 
      timestamp > (now - this.config.windowMs)
    );

    // Check if max attempts exceeded
    if (recentAttempts.length >= this.config.maxAttempts) {
      this.blockAccount(key, this.config.blockDuration);
      
      // Log suspicious activity
      this.logSuspiciousActivity(identifier, username, endpoint, 'max_attempts_exceeded');

      return {
        allowed: false,
        reason: 'max_attempts_exceeded',
        retryAfter: this.config.blockDuration,
        attempts: recentAttempts.length,
        progressiveDelay: this.calculateProgressiveDelay(key)
      };
    }

    // Calculate progressive delay if enabled
    const delay = this.config.progressiveDelay ? 
      this.calculateProgressiveDelay(key) : 0;

    return {
      allowed: true,
      attempts: recentAttempts.length,
      remaining: this.config.maxAttempts - recentAttempts.length,
      progressiveDelay: delay,
      resetTime: Math.min(...recentAttempts) + this.config.windowMs
    };
  }

  /**
   * Record failed authentication attempt
   * @param {string} identifier - IP address or user ID
   * @param {Object} options - Attempt details
   */
  recordFailedAttempt(identifier, options = {}) {
    const {
      username = null,
      password = null,
      endpoint = 'login',
      reason = 'invalid_credentials'
    } = options;

    const now = Date.now();
    const key = username ? `${identifier}:${username}` : identifier;

    // Get or create attempts record
    if (!this.failedAttempts.has(key)) {
      this.failedAttempts.set(key, {
        attempts: [],
        lastAttempt: now,
        patterns: []
      });
    }

    const record = this.failedAttempts.get(key);
    
    // Add current attempt
    record.attempts.push(now);
    record.lastAttempt = now;

    // Analyze patterns
    this.analyzeAttackPatterns(identifier, username, password, endpoint, record);

    // Log suspicious activity
    this.logSuspiciousActivity(identifier, username, endpoint, reason);

    // Update record
    this.failedAttempts.set(key, record);

    // Check for rapid-fire attacks
    this.detectRapidFireAttacks(key, record);
  }

  /**
   * Record successful authentication attempt
   * @param {string} identifier - IP address or user ID
   * @param {string} username - Username
   */
  recordSuccessfulAttempt(identifier, username = null) {
    const key = username ? `${identifier}:${username}` : identifier;
    
    // Clear failed attempts on successful login
    this.failedAttempts.delete(key);
    this.unblockAccount(key);

    // Reset any progressive delays
    this.resetProgressiveDelay(key);
  }

  /**
   * Check if account is blocked
   * @param {string} key - Account key
   * @returns {boolean} - Is blocked
   */
  isBlocked(key) {
    const blockUntil = this.blockedAccounts.get(key);
    if (!blockUntil) return false;

    if (blockUntil > Date.now()) {
      return true;
    } else {
      // Block expired, remove it
      this.blockedAccounts.delete(key);
      return false;
    }
  }

  /**
   * Block account
   * @param {string} key - Account key
   * @param {number} duration - Block duration in ms
   */
  blockAccount(key, duration) {
    this.blockedAccounts.set(key, Date.now() + duration);
  }

  /**
   * Unblock account
   * @param {string} key - Account key
   */
  unblockAccount(key) {
    this.blockedAccounts.delete(key);
  }

  /**
   * Get remaining block time
   * @param {string} key - Account key
   * @returns {number} - Remaining time in ms
   */
  getBlockTimeRemaining(key) {
    const blockUntil = this.blockedAccounts.get(key);
    if (!blockUntil) return 0;

    const remaining = blockUntil - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Get failed attempts for account
   * @param {string} key - Account key
   * @returns {Array} - Array of timestamps
   */
  getFailedAttempts(key) {
    const record = this.failedAttempts.get(key);
    return record ? record.attempts : [];
  }

  /**
   * Calculate progressive delay based on failed attempts
   * @param {string} key - Account key
   * @returns {number} - Delay in ms
   */
  calculateProgressiveDelay(key) {
    const attempts = this.getFailedAttempts(key);
    const now = Date.now();
    const recentAttempts = attempts.filter(timestamp => 
      timestamp > (now - this.config.windowMs)
    );

    if (recentAttempts.length === 0) return 0;

    // Progressive delay: 1s, 2s, 4s, 8s, 16s, maxDelay
    const delayMultiplier = Math.min(recentAttempts.length, 5);
    const delay = Math.min(
      Math.pow(2, delayMultiplier - 1) * 1000,
      this.config.maxDelay
    );

    return delay;
  }

  /**
   * Analyze attack patterns
   * @param {string} identifier - IP address
   * @param {string} username - Username
   * @param {string} password - Password (for pattern analysis)
   * @param {string} endpoint - Endpoint
   * @param {Object} record - Attempt record
   */
  analyzeAttackPatterns(identifier, username, password, endpoint, record) {
    // Pattern 1: Multiple usernames from same IP
    if (username && !record.usernames) {
      record.usernames = new Set();
    }
    if (username) {
      record.usernames.add(username);
    }

    // Pattern 2: Sequential password attempts
    if (password) {
      if (!record.passwords) record.passwords = [];
      record.passwords.push(password);
      
      // Check for sequential patterns (password1, password2, etc.)
      const sequentialPattern = /^password(\d+)$/i;
      if (record.passwords.length > 2 && 
          record.passwords.every(p => sequentialPattern.test(p))) {
        this.flagSuspiciousPattern(identifier, 'sequential_passwords');
      }
    }

    // Pattern 3: Common password attempts
    const commonPasswords = ['password', '123456', 'admin', 'root', 'test'];
    if (password && commonPasswords.includes(password.toLowerCase())) {
      this.flagSuspiciousPattern(identifier, 'common_password_attempt');
    }

    // Pattern 4: Multiple usernames from same IP
    if (record.usernames && record.usernames.size > 5) {
      this.flagSuspiciousPattern(identifier, 'multiple_usernames');
    }
  }

  /**
   * Detect rapid-fire attacks
   * @param {string} key - Account key
   * @param {Object} record - Attempt record
   */
  detectRapidFireAttacks(key, record) {
    const now = Date.now();
    const recentAttempts = record.attempts.filter(timestamp => 
      timestamp > (now - 60 * 1000) // Last minute
    );

    // If more than 10 attempts in last minute, block immediately
    if (recentAttempts.length > 10) {
      this.blockAccount(key, this.config.blockDuration * 2); // Double block time
      this.logSuspiciousActivity(null, null, null, 'rapid_fire_attack');
    }
  }

  /**
   * Flag suspicious pattern
   * @param {string} identifier - IP address
   * @param {string} pattern - Pattern type
   */
  flagSuspiciousPattern(identifier, pattern) {
    const key = `${identifier}:${pattern}`;
    const current = this.suspiciousPatterns.get(key) || 0;
    this.suspiciousPatterns.set(key, current + 1);

    // If pattern occurs too frequently, block IP
    if (current >= 3) {
      this.blockAccount(identifier, this.config.blockDuration);
    }
  }

  /**
   * Log suspicious activity
   * @param {string} identifier - IP address
   * @param {string} username - Username
   * @param {string} endpoint - Endpoint
   * @param {string} reason - Reason for logging
   */
  logSuspiciousActivity(identifier, username, endpoint, reason) {
    const logEntry = {
      timestamp: Date.now(),
      identifier,
      username,
      endpoint,
      reason,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    // In a real application, this would be sent to a logging service
    console.warn('Suspicious activity detected:', logEntry);

    // Store in localStorage for monitoring (frontend only)
    if (typeof localStorage !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('security_logs') || '[]');
        existing.push(logEntry);
        
        // Keep only last 100 entries
        if (existing.length > 100) {
          existing.splice(0, existing.length - 100);
        }
        
        localStorage.setItem('security_logs', JSON.stringify(existing));
      } catch (error) {
        console.error('Failed to log suspicious activity:', error);
      }
    }
  }

  /**
   * Reset progressive delay
   * @param {string} key - Account key
   */
  resetProgressiveDelay(key) {
    // Progressive delay is calculated on-the-fly, no need to reset
  }

  /**
   * Get protection statistics
   * @param {string} identifier - IP address (optional)
   * @returns {Object} - Statistics
   */
  getStats(identifier = null) {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (identifier) {
      const attempts = this.getFailedAttempts(identifier);
      const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
      
      return {
        identifier,
        failedAttempts: recentAttempts.length,
        maxAttempts: this.config.maxAttempts,
        remaining: this.config.maxAttempts - recentAttempts.length,
        isBlocked: this.isBlocked(identifier),
        blockTimeRemaining: this.getBlockTimeRemaining(identifier),
        progressiveDelay: this.calculateProgressiveDelay(identifier)
      };
    }

    // Global stats
    let totalFailedAttempts = 0;
    let blockedAccounts = 0;
    let suspiciousPatterns = 0;

    this.failedAttempts.forEach((record, key) => {
      const recentAttempts = record.attempts.filter(timestamp => timestamp > windowStart);
      totalFailedAttempts += recentAttempts.length;
    });

    blockedAccounts = this.blockedAccounts.size;
    suspiciousPatterns = this.suspiciousPatterns.size;

    return {
      totalFailedAttempts,
      blockedAccounts,
      suspiciousPatterns,
      windowMs: this.config.windowMs,
      maxAttempts: this.config.maxAttempts
    };
  }

  /**
   * Clear all data (for testing or maintenance)
   */
  clear() {
    this.failedAttempts.clear();
    this.blockedAccounts.clear();
    this.suspiciousPatterns.clear();
  }
}

export { BruteForceProtection };
