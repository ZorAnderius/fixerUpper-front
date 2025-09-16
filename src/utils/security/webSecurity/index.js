/**
 * Web Security Module - Main Index
 * Comprehensive protection against web-based attacks
 */

// Import all web security modules
import { ClickjackingProtection } from './clickjackingProtection/index.js';
import { UploadProtection } from './uploadProtection/index.js';
import { RedirectProtection } from './redirectProtection/index.js';

/**
 * Web Security Manager Class
 * Manages all web security protections
 */
export class WebSecurityManager {
  constructor(options = {}) {
    this.config = {
      enableClickjackingProtection: options.enableClickjackingProtection !== false,
      enableUploadProtection: options.enableUploadProtection !== false,
      enableRedirectProtection: options.enableRedirectProtection !== false,
      strictMode: options.strictMode || false,
      ...options
    };

    // Initialize protection modules
    this.clickjackingProtection = new ClickjackingProtection(
      options.clickjacking || {}
    );
    
    this.uploadProtection = new UploadProtection(
      options.upload || {}
    );
    
    this.redirectProtection = new RedirectProtection(
      options.redirect || {}
    );

    // Security events tracking
    this.securityEvents = [];
    this.blockedRequests = new Map();
  }

  /**
   * Process security check for request
   * @param {Object} requestData - Request data
   * @param {string} identifier - IP address or user ID
   * @returns {Object} - Security check result
   */
  processSecurityCheck(requestData, identifier) {
    const securityCheck = {
      allowed: true,
      riskLevel: 'none',
      warnings: [],
      blocks: [],
      securityHeaders: {},
      sanitizedData: { ...requestData }
    };

    // Clickjacking protection
    if (this.config.enableClickjackingProtection) {
      const clickjackingCheck = this.clickjackingProtection.detectClickjackingAttempt(requestData);
      if (clickjackingCheck.isClickjacking) {
        securityCheck.blocks.push('clickjacking');
        securityCheck.riskLevel = this.getHigherRiskLevel(securityCheck.riskLevel, clickjackingCheck.riskLevel);
        securityCheck.warnings.push(...clickjackingCheck.reasons);
      }
    }

    // Upload protection
    if (this.config.enableUploadProtection && requestData.file) {
      const uploadValidation = this.uploadProtection.validateFileUpload(requestData.file, identifier);
      if (!uploadValidation.isValid) {
        securityCheck.blocks.push('upload');
        securityCheck.riskLevel = this.getHigherRiskLevel(securityCheck.riskLevel, uploadValidation.riskLevel);
        securityCheck.warnings.push(...uploadValidation.errors);
      }
    }

    // Redirect protection
    if (this.config.enableRedirectProtection && requestData.redirectUrl) {
      const redirectValidation = this.redirectProtection.validateRedirect(
        requestData.redirectUrl, 
        identifier, 
        { currentOrigin: requestData.origin }
      );
      if (!redirectValidation.isValid || redirectValidation.shouldBlock) {
        securityCheck.blocks.push('redirect');
        securityCheck.riskLevel = this.getHigherRiskLevel(securityCheck.riskLevel, redirectValidation.riskLevel);
        securityCheck.warnings.push(...redirectValidation.reasons);
      }
    }

    // Determine if request should be blocked
    if (securityCheck.blocks.length > 0) {
      securityCheck.allowed = false;
      this.blockedRequests.set(identifier, {
        timestamp: Date.now(),
        blocks: securityCheck.blocks,
        riskLevel: securityCheck.riskLevel,
        requestData
      });
    }

    // Generate security headers
    securityCheck.securityHeaders = this.generateSecurityHeaders(requestData);

    // Log security event
    this.logSecurityEvent(identifier, securityCheck);

    return securityCheck;
  }

  /**
   * Generate comprehensive security headers
   * @param {Object} requestData - Request data
   * @returns {Object} - Security headers
   */
  generateSecurityHeaders(requestData) {
    const headers = {};

    // Clickjacking protection headers
    if (this.config.enableClickjackingProtection) {
      const clickjackingHeaders = this.clickjackingProtection.generateSecurityHeaders(requestData.origin);
      Object.assign(headers, clickjackingHeaders);
    }

    // Additional security headers
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=()';

    // Content Security Policy
    if (this.config.strictMode) {
      headers['Content-Security-Policy'] = this.generateStrictCSP();
    } else {
      headers['Content-Security-Policy'] = this.generateRelaxedCSP();
    }

    return headers;
  }

  /**
   * Generate strict Content Security Policy
   * @returns {string} - Strict CSP
   */
  generateStrictCSP() {
    return [
      "default-src 'self'",
      "script-src 'self' 'nonce-{nonce}'",
      "style-src 'self' 'nonce-{nonce}'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  /**
   * Generate relaxed Content Security Policy
   * @returns {string} - Relaxed CSP
   */
  generateRelaxedCSP() {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  /**
   * Get higher risk level between two levels
   * @param {string} level1 - First risk level
   * @param {string} level2 - Second risk level
   * @returns {string} - Higher risk level
   */
  getHigherRiskLevel(level1, level2) {
    const levels = ['none', 'low', 'medium', 'high', 'critical'];
    const index1 = levels.indexOf(level1);
    const index2 = levels.indexOf(level2);
    return levels[Math.max(index1, index2)];
  }

  /**
   * Log security event
   * @param {string} identifier - IP address or user ID
   * @param {Object} securityCheck - Security check result
   */
  logSecurityEvent(identifier, securityCheck) {
    const event = {
      identifier,
      timestamp: Date.now(),
      riskLevel: securityCheck.riskLevel,
      blocks: securityCheck.blocks,
      warnings: securityCheck.warnings,
      allowed: securityCheck.allowed,
      userAgent: navigator.userAgent
    };

    this.securityEvents.push(event);

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents.splice(0, this.securityEvents.length - 1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', event);
    }
  }

  /**
   * Get security statistics
   * @returns {Object} - Security statistics
   */
  getStats() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const recentEvents = this.securityEvents.filter(event => event.timestamp > oneDayAgo);
    const blockedEvents = recentEvents.filter(event => !event.allowed);

    const stats = {
      totalEvents: this.securityEvents.length,
      recentEvents: recentEvents.length,
      blockedEvents: blockedEvents.length,
      blockedRequests: this.blockedRequests.size,
      riskLevels: {
        none: recentEvents.filter(e => e.riskLevel === 'none').length,
        low: recentEvents.filter(e => e.riskLevel === 'low').length,
        medium: recentEvents.filter(e => e.riskLevel === 'medium').length,
        high: recentEvents.filter(e => e.riskLevel === 'high').length,
        critical: recentEvents.filter(e => e.riskLevel === 'critical').length
      },
      blockTypes: {
        clickjacking: blockedEvents.filter(e => e.blocks.includes('clickjacking')).length,
        upload: blockedEvents.filter(e => e.blocks.includes('upload')).length,
        redirect: blockedEvents.filter(e => e.blocks.includes('redirect')).length
      }
    };

    // Add module-specific stats
    if (this.config.enableClickjackingProtection) {
      stats.clickjacking = this.clickjackingProtection.getStats();
    }

    if (this.config.enableUploadProtection) {
      stats.upload = this.uploadProtection.getQuarantineStats();
    }

    if (this.config.enableRedirectProtection) {
      stats.redirect = this.redirectProtection.getStats();
    }

    return stats;
  }

  /**
   * Clear all security data (for testing or maintenance)
   */
  clearAllData() {
    this.securityEvents = [];
    this.blockedRequests.clear();
    
    if (this.config.enableClickjackingProtection) {
      this.clickjackingProtection.clearFrameAttempts();
    }
    
    if (this.config.enableUploadProtection) {
      this.uploadProtection.clearQuarantine();
    }
    
    if (this.config.enableRedirectProtection) {
      this.redirectProtection.clearRedirectHistory();
    }
  }
}

// Export individual modules
export { ClickjackingProtection, UploadProtection, RedirectProtection };

// Default export
export default WebSecurityManager;
