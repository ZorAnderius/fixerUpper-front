/**
 * React Hook for Web Security
 * Integrates web security protections into React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSecurityManager } from '../utils/security/webSecurity/index.js';

/**
 * Custom hook for web security
 * @param {Object} options - Configuration options
 * @returns {Object} - Web security utilities
 */
export const useWebSecurity = (options = {}) => {
  const [securityManager] = useState(() => new WebSecurityManager(options));
  const [securityStats, setSecurityStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const statsIntervalRef = useRef(null);

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      try {
        const stats = securityManager.getStats();
        setSecurityStats(stats);
      } catch (err) {
        setError(err.message);
      }
    };

    // Initial stats
    updateStats();

    // Update every 30 seconds
    statsIntervalRef.current = setInterval(updateStats, 30000);

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [securityManager]);

  /**
   * Validate file upload
   * @param {Object} file - File object
   * @param {string} identifier - User identifier
   * @returns {Promise<Object>} - Validation result
   */
  const validateFileUpload = useCallback(async (file, identifier) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = securityManager.uploadProtection.validateFileUpload(file, identifier);
      
      if (result.isValid) {
        securityManager.uploadProtection.recordUpload(identifier);
      } else if (result.shouldQuarantine) {
        securityManager.uploadProtection.quarantineFile(
          `${identifier}_${Date.now()}`, 
          file, 
          result.errors.join(', ')
        );
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [securityManager]);

  /**
   * Validate redirect URL
   * @param {string} url - URL to validate
   * @param {string} identifier - User identifier
   * @param {Object} context - Additional context
   * @returns {Object} - Validation result
   */
  const validateRedirect = useCallback((url, identifier, context = {}) => {
    try {
      const result = securityManager.redirectProtection.validateRedirect(url, identifier, context);
      
      if (!result.isValid || result.shouldBlock) {
        securityManager.redirectProtection.recordSuspiciousRedirect(
          identifier, 
          url, 
          result.reasons.join(', ')
        );
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [securityManager]);

  /**
   * Check for clickjacking attempts
   * @param {Object} requestData - Request data
   * @param {string} identifier - User identifier
   * @returns {Object} - Detection result
   */
  const checkClickjacking = useCallback((requestData, identifier) => {
    try {
      const result = securityManager.clickjackingProtection.detectClickjackingAttempt(requestData);
      
      if (result.isClickjacking) {
        securityManager.clickjackingProtection.blockFrameAttempt(
          identifier, 
          result.reasons.join(', ')
        );
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [securityManager]);

  /**
   * Process comprehensive security check
   * @param {Object} requestData - Request data
   * @param {string} identifier - User identifier
   * @returns {Object} - Security check result
   */
  const processSecurityCheck = useCallback((requestData, identifier) => {
    try {
      return securityManager.processSecurityCheck(requestData, identifier);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [securityManager]);

  /**
   * Generate security headers
   * @param {Object} requestData - Request data
   * @returns {Object} - Security headers
   */
  const generateSecurityHeaders = useCallback((requestData) => {
    try {
      return securityManager.generateSecurityHeaders(requestData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [securityManager]);

  /**
   * Add domain to redirect whitelist
   * @param {string} domain - Domain to whitelist
   */
  const addToRedirectWhitelist = useCallback((domain) => {
    try {
      securityManager.redirectProtection.addToWhitelist(domain);
    } catch (err) {
      setError(err.message);
    }
  }, [securityManager]);

  /**
   * Remove domain from redirect whitelist
   * @param {string} domain - Domain to remove
   */
  const removeFromRedirectWhitelist = useCallback((domain) => {
    try {
      securityManager.redirectProtection.removeFromWhitelist(domain);
    } catch (err) {
      setError(err.message);
    }
  }, [securityManager]);

  /**
   * Clear all security data
   */
  const clearSecurityData = useCallback(() => {
    try {
      securityManager.clearAllData();
      setSecurityStats(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [securityManager]);

  /**
   * Get frame busting JavaScript code
   * @returns {string} - Frame busting code
   */
  const getFrameBustingCode = useCallback(() => {
    return securityManager.clickjackingProtection.generateFrameBustingCode();
  }, [securityManager]);

  /**
   * Generate safe redirect URL
   * @param {string} url - Original URL
   * @param {string} fallback - Fallback URL
   * @returns {string} - Safe redirect URL
   */
  const generateSafeRedirect = useCallback((url, fallback = '/') => {
    return securityManager.redirectProtection.generateSafeRedirect(url, fallback);
  }, [securityManager]);

  return {
    // State
    securityStats,
    isLoading,
    error,

    // File upload protection
    validateFileUpload,

    // Redirect protection
    validateRedirect,
    addToRedirectWhitelist,
    removeFromRedirectWhitelist,
    generateSafeRedirect,

    // Clickjacking protection
    checkClickjacking,
    getFrameBustingCode,

    // General security
    processSecurityCheck,
    generateSecurityHeaders,
    clearSecurityData,

    // Utilities
    securityManager
  };
};

export default useWebSecurity;
