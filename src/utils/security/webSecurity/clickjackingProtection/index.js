/**
 * Clickjacking Protection Module - Main Index
 * Combines all clickjacking protection functionality
 */

import { generateSecurityHeaders, generateFrameBustingCode } from './headerGeneration.js';
import { detectClickjackingAttempt, detectFrameBustingAttempt } from './detection.js';
import { 
  blockFrameAttempt, 
  isFrameBlocked, 
  getFrameAttemptHistory,
  getBlockingStats,
  clearFrameAttempts
} from './blocking.js';
import { 
  DEFAULT_CLICKJACKING_CONFIG,
  SUSPICIOUS_REFERER_PATTERNS,
  FRAME_BUSTING_PATTERNS
} from './constants.js';

/**
 * Clickjacking Protection Class
 */
export class ClickjackingProtection {
  constructor(options = {}) {
    this.config = {
      ...DEFAULT_CLICKJACKING_CONFIG,
      ...options,
      suspiciousRefererPatterns: SUSPICIOUS_REFERER_PATTERNS,
      frameBustingPatterns: FRAME_BUSTING_PATTERNS
    };

    this.blockedFrames = new Set();
    this.frameAttempts = new Map();
  }

  /**
   * Detect clickjacking attempt
   * @param {Object} requestData - Request data
   * @returns {Object} - Detection result
   */
  detectClickjackingAttempt(requestData = {}) {
    return detectClickjackingAttempt(requestData, this.config);
  }

  /**
   * Generate security headers for clickjacking protection
   * @param {string} origin - Request origin
   * @returns {Object} - Security headers
   */
  generateSecurityHeaders(origin = null) {
    return generateSecurityHeaders(origin, this.config);
  }

  /**
   * Generate frame busting JavaScript code
   * @returns {string} - Frame busting JavaScript
   */
  generateFrameBustingCode() {
    return generateFrameBustingCode();
  }

  /**
   * Block frame attempt
   * @param {string} identifier - IP address or user ID
   * @param {string} reason - Reason for blocking
   */
  blockFrameAttempt(identifier, reason) {
    blockFrameAttempt(identifier, reason, this.blockedFrames, this.frameAttempts);
  }

  /**
   * Check if frame is blocked
   * @param {string} identifier - IP address or user ID
   * @returns {boolean} - Is blocked
   */
  isFrameBlocked(identifier) {
    return isFrameBlocked(identifier, this.blockedFrames);
  }

  /**
   * Get frame attempt history
   * @param {string} identifier - IP address or user ID
   * @returns {Array} - Attempt history
   */
  getFrameAttemptHistory(identifier) {
    return getFrameAttemptHistory(identifier, this.frameAttempts);
  }

  /**
   * Get protection statistics
   * @returns {Object} - Statistics
   */
  getStats() {
    return getBlockingStats(this.blockedFrames, this.frameAttempts);
  }

  /**
   * Clear frame attempts (for testing or maintenance)
   * @param {string} identifier - IP address or user ID (optional)
   */
  clearFrameAttempts(identifier = null) {
    clearFrameAttempts(identifier, this.blockedFrames, this.frameAttempts);
  }

  /**
   * Check if origin is trusted
   * @param {string} origin - Origin to check
   * @returns {boolean} - Is trusted
   */
  isTrustedOrigin(origin) {
    if (!origin) return false;

    return this.config.trustedDomains.some(domain => {
      if (domain === origin) return true;
      if (domain.startsWith('*.')) {
        const domainSuffix = domain.substring(2);
        return origin.endsWith(domainSuffix);
      }
      return false;
    });
  }

  /**
   * Add trusted domain
   * @param {string} domain - Domain to trust
   */
  addTrustedDomain(domain) {
    if (!this.config.trustedDomains.includes(domain)) {
      this.config.trustedDomains.push(domain);
    }
  }

  /**
   * Remove trusted domain
   * @param {string} domain - Domain to remove
   */
  removeTrustedDomain(domain) {
    const index = this.config.trustedDomains.indexOf(domain);
    if (index > -1) {
      this.config.trustedDomains.splice(index, 1);
    }
  }
}

// Default export
export default ClickjackingProtection;
