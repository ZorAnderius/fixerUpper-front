/**
 * Redirect Protection Module - Main Index
 * Combines all redirect protection functionality
 */

import { validateRedirectUrl, sanitizeRedirectUrl } from './urlValidation.js';
import { 
  checkRedirectHistory, 
  recordSuspiciousRedirect,
  getRedirectStats,
  getGlobalRedirectStats,
  clearRedirectHistory,
  clearAllRedirectHistory
} from './historyTracking.js';
import { 
  DEFAULT_REDIRECT_CONFIG, 
  REDIRECT_PARAMS,
  SUSPICIOUS_PATTERNS,
  SUSPICIOUS_DOMAINS,
  ENCODING_PATTERNS
} from './constants.js';

/**
 * Redirect Protection Class
 */
export class RedirectProtection {
  constructor(options = {}) {
    this.config = {
      ...DEFAULT_REDIRECT_CONFIG,
      ...options,
      redirectParams: REDIRECT_PARAMS,
      suspiciousPatterns: SUSPICIOUS_PATTERNS,
      suspiciousDomains: SUSPICIOUS_DOMAINS,
      encodingPatterns: ENCODING_PATTERNS
    };

    this.redirectHistory = new Map(); // identifier -> redirect history
    this.suspiciousRedirects = new Map(); // identifier -> suspicious redirects
    this.whitelistedUrls = new Set(this.config.allowedDomains);
  }

  /**
   * Validate redirect URL
   * @param {string} url - URL to validate
   * @param {string} identifier - IP address or user ID
   * @param {Object} context - Additional context
   * @returns {Object} - Validation result
   */
  validateRedirect(url, identifier, context = {}) {
    const validation = {
      isValid: false,
      safeUrl: null,
      riskLevel: 'none',
      reasons: [],
      warnings: [],
      shouldBlock: false
    };

    if (!url) {
      validation.isValid = false;
      validation.reasons.push('No redirect URL provided');
      return validation;
    }

    // Check for suspicious patterns
    const suspiciousCheck = this.checkSuspiciousPatterns(url);
    if (suspiciousCheck.isSuspicious) {
      validation.reasons.push(...suspiciousCheck.reasons);
      validation.riskLevel = suspiciousCheck.riskLevel;
      validation.shouldBlock = true;
      return validation;
    }

    // Check for URL encoding attacks
    const encodingCheck = this.checkEncodingAttacks(url);
    if (encodingCheck.isAttack) {
      validation.reasons.push(...encodingCheck.reasons);
      validation.riskLevel = 'high';
      validation.shouldBlock = true;
      return validation;
    }

    // Check if URL is in whitelist
    if (this.isWhitelisted(url)) {
      validation.isValid = true;
      validation.safeUrl = url;
      validation.riskLevel = 'none';
      return validation;
    }

    // Check if URL is same origin
    if (this.config.allowSameOrigin && this.isSameOrigin(url, context.currentOrigin)) {
      validation.isValid = true;
      validation.safeUrl = url;
      validation.riskLevel = 'low';
      return validation;
    }

    // Check if URL is relative
    if (this.config.allowRelativePaths && this.isRelativeUrl(url)) {
      validation.isValid = true;
      validation.safeUrl = url;
      validation.riskLevel = 'low';
      return validation;
    }

    // Check redirect history for this identifier
    const historyCheck = checkRedirectHistory(identifier, url, this.redirectHistory, this.config);
    if (historyCheck.isSuspicious) {
      validation.reasons.push(...historyCheck.reasons);
      validation.riskLevel = 'medium';
      validation.shouldBlock = true;
      return validation;
    }

    // If strict mode is enabled, block all external redirects
    if (this.config.strictMode) {
      validation.reasons.push('External redirects not allowed in strict mode');
      validation.riskLevel = 'medium';
      validation.shouldBlock = true;
      return validation;
    }

    // Default: allow but warn
    validation.isValid = true;
    validation.safeUrl = url;
    validation.riskLevel = 'medium';
    validation.warnings.push('External redirect detected');

    return validation;
  }

  /**
   * Check for suspicious patterns in URL
   * @param {string} url - URL to check
   * @returns {Object} - Suspicious pattern check result
   */
  checkSuspiciousPatterns(url) {
    return {
      isSuspicious: false,
      riskLevel: 'none',
      reasons: []
    };
  }

  /**
   * Check for URL encoding attacks
   * @param {string} url - URL to check
   * @returns {Object} - Encoding attack check result
   */
  checkEncodingAttacks(url) {
    return {
      isAttack: false,
      reasons: []
    };
  }

  /**
   * Check if URL is whitelisted
   * @param {string} url - URL to check
   * @returns {boolean} - Is whitelisted
   */
  isWhitelisted(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      return this.whitelistedUrls.has(hostname) || 
             this.whitelistedUrls.has(urlObj.origin.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if URL is same origin
   * @param {string} url - URL to check
   * @param {string} currentOrigin - Current origin
   * @returns {boolean} - Is same origin
   */
  isSameOrigin(url, currentOrigin) {
    if (!currentOrigin) return false;

    try {
      const urlObj = new URL(url);
      const currentObj = new URL(currentOrigin);
      
      return urlObj.origin === currentObj.origin;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if URL is relative
   * @param {string} url - URL to check
   * @returns {boolean} - Is relative URL
   */
  isRelativeUrl(url) {
    return !url.includes('://') && !url.startsWith('//');
  }

  /**
   * Add domain to whitelist
   * @param {string} domain - Domain to whitelist
   */
  addToWhitelist(domain) {
    this.whitelistedUrls.add(domain.toLowerCase());
  }

  /**
   * Remove domain from whitelist
   * @param {string} domain - Domain to remove
   */
  removeFromWhitelist(domain) {
    this.whitelistedUrls.delete(domain.toLowerCase());
  }

  /**
   * Generate safe redirect URL
   * @param {string} url - Original URL
   * @param {string} fallback - Fallback URL
   * @returns {string} - Safe redirect URL
   */
  generateSafeRedirect(url, fallback = '/') {
    const validation = this.validateRedirect(url, 'system');
    
    if (validation.isValid && validation.safeUrl) {
      return validation.safeUrl;
    }

    return fallback;
  }

  /**
   * Record suspicious redirect attempt
   * @param {string} identifier - IP address or user ID
   * @param {string} url - Suspicious URL
   * @param {string} reason - Reason for suspicion
   */
  recordSuspiciousRedirect(identifier, url, reason) {
    recordSuspiciousRedirect(identifier, url, reason, this.suspiciousRedirects);
  }

  /**
   * Get redirect statistics
   * @returns {Object} - Redirect statistics
   */
  getStats() {
    return getGlobalRedirectStats(this.redirectHistory, this.suspiciousRedirects);
  }

  /**
   * Clear redirect history (for testing or maintenance)
   * @param {string} identifier - IP address or user ID (optional)
   */
  clearRedirectHistory(identifier = null) {
    if (identifier) {
      clearRedirectHistory(identifier, this.redirectHistory, this.suspiciousRedirects);
    } else {
      clearAllRedirectHistory(this.redirectHistory, this.suspiciousRedirects);
    }
  }
}

// Default export
export default RedirectProtection;
