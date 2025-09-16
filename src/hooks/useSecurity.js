/**
 * Security Hook - Comprehensive security integration
 * Combines rate limiting, bot detection, brute force protection, and monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RateLimiter } from '../utils/security/rateLimiting/rateLimiter';
import { BruteForceProtection } from '../utils/security/rateLimiting/bruteForceProtection';
import { BotDetection } from '../utils/security/rateLimiting/botDetection';
import { SecurityMonitor } from '../utils/security/rateLimiting/monitoring';
import { SecurityHeaders } from '../utils/security/rateLimiting/securityHeaders';
import { DEFAULT_CONFIG, SECURITY_CONFIG } from '../utils/security/rateLimiting/constants';

export const useSecurity = (options = {}) => {
  const {
    enableRateLimiting = true,
    enableBruteForceProtection = true,
    enableBotDetection = true,
    enableMonitoring = true,
    enableSecurityHeaders = true,
    customConfig = {}
  } = options;

  // Security instances
  const rateLimiter = useRef(null);
  const bruteForceProtection = useRef(null);
  const botDetection = useRef(null);
  const securityMonitor = useRef(null);
  const securityHeaders = useRef(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [securityStats, setSecurityStats] = useState({
    totalRequests: 0,
    blockedRequests: 0,
    suspiciousActivity: 0,
    botDetections: 0
  });
  const [currentThreats, setCurrentThreats] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);

  // Initialize security systems
  useEffect(() => {
    const initializeSecurity = () => {
      try {
        const config = { ...DEFAULT_CONFIG, ...customConfig };

        // Initialize rate limiter
        if (enableRateLimiting) {
          rateLimiter.current = new RateLimiter(config.rateLimiting);
        }

        // Initialize brute force protection
        if (enableBruteForceProtection) {
          bruteForceProtection.current = new BruteForceProtection(config.bruteForceProtection);
        }

        // Initialize bot detection
        if (enableBotDetection) {
          botDetection.current = new BotDetection(config.botDetection);
        }

        // Initialize security monitor
        if (enableMonitoring) {
          securityMonitor.current = new SecurityMonitor(config.monitoring);
        }

        // Initialize security headers
        if (enableSecurityHeaders) {
          securityHeaders.current = new SecurityHeaders(config.securityHeaders);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize security systems:', error);
      }
    };

    initializeSecurity();
  }, [enableRateLimiting, enableBruteForceProtection, enableBotDetection, enableMonitoring, enableSecurityHeaders, customConfig]);

  // Get client identifier (IP address simulation)
  const getClientIdentifier = useCallback(() => {
    // In a real application, this would get the actual IP address
    // For frontend, we'll use a combination of browser fingerprint and session
    const sessionId = sessionStorage.getItem('sessionId') || generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
    
    // Simple browser fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    
    return btoa(fingerprint + sessionId).substring(0, 16);
  }, []);

  // Generate session ID
  const generateSessionId = () => {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Check rate limit for API request
  const checkRateLimit = useCallback((endpoint = 'general', customOptions = {}) => {
    if (!enableRateLimiting || !rateLimiter.current) {
      return { allowed: true };
    }

    const identifier = getClientIdentifier();
    const endpointConfig = SECURITY_CONFIG.endpoints[endpoint] || SECURITY_CONFIG.global;
    const options = { ...endpointConfig, ...customOptions };

    return rateLimiter.current.checkEndpointRateLimit(identifier, endpoint, options);
  }, [enableRateLimiting, getClientIdentifier]);

  // Check authentication rate limit
  const checkAuthRateLimit = useCallback((username = null) => {
    if (!enableRateLimiting || !rateLimiter.current) {
      return { allowed: true };
    }

    const identifier = getClientIdentifier();
    return rateLimiter.current.checkAuthRateLimit(identifier, username);
  }, [enableRateLimiting, getClientIdentifier]);

  // Check form submission rate limit
  const checkFormRateLimit = useCallback((formType) => {
    if (!enableRateLimiting || !rateLimiter.current) {
      return { allowed: true };
    }

    const identifier = getClientIdentifier();
    return rateLimiter.current.checkFormRateLimit(identifier, formType);
  }, [enableRateLimiting, getClientIdentifier]);

  // Check brute force protection
  const checkBruteForce = useCallback((username = null) => {
    if (!enableBruteForceProtection || !bruteForceProtection.current) {
      return { allowed: true };
    }

    const identifier = getClientIdentifier();
    return bruteForceProtection.current.checkAuthAttempt(identifier, { username });
  }, [enableBruteForceProtection, getClientIdentifier]);

  // Record failed authentication attempt
  const recordFailedAuth = useCallback((username = null, details = {}) => {
    if (!enableBruteForceProtection || !bruteForceProtection.current) {
      return;
    }

    const identifier = getClientIdentifier();
    bruteForceProtection.current.recordFailedAttempt(identifier, {
      username,
      ...details
    });

    // Log to security monitor
    if (securityMonitor.current) {
      securityMonitor.current.logBruteForceAttempt(identifier, {
        username,
        attempts: bruteForceProtection.current.getFailedAttempts(identifier).length,
        ...details
      });
    }
  }, [enableBruteForceProtection, getClientIdentifier]);

  // Record successful authentication
  const recordSuccessfulAuth = useCallback((username = null) => {
    if (!enableBruteForceProtection || !bruteForceProtection.current) {
      return;
    }

    const identifier = getClientIdentifier();
    bruteForceProtection.current.recordSuccessfulAttempt(identifier, username);
  }, [enableBruteForceProtection, getClientIdentifier]);

  // Analyze request for bot behavior
  const analyzeRequest = useCallback((requestData = {}) => {
    if (!enableBotDetection || !botDetection.current) {
      return { isBot: false, suspicionScore: 0 };
    }

    const identifier = getClientIdentifier();
    return botDetection.current.analyzeRequest(identifier, {
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      ...requestData
    });
  }, [enableBotDetection, getClientIdentifier]);

  // Generate CAPTCHA challenge
  const generateCAPTCHA = useCallback(() => {
    if (!enableBotDetection || !botDetection.current) {
      return null;
    }

    const identifier = getClientIdentifier();
    return botDetection.current.generateCAPTCHA(identifier);
  }, [enableBotDetection, getClientIdentifier]);

  // Verify CAPTCHA response
  const verifyCAPTCHA = useCallback((answer) => {
    if (!enableBotDetection || !botDetection.current) {
      return { valid: true };
    }

    const identifier = getClientIdentifier();
    return botDetection.current.verifyCAPTCHA(identifier, answer);
  }, [enableBotDetection, getClientIdentifier]);

  // Log security event
  const logSecurityEvent = useCallback((eventData) => {
    if (!enableMonitoring || !securityMonitor.current) {
      return;
    }

    return securityMonitor.current.logSecurityEvent(eventData);
  }, [enableMonitoring]);

  // Get security statistics
  const getSecurityStats = useCallback(() => {
    const stats = {
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousActivity: 0,
      botDetections: 0,
      bruteForceAttempts: 0
    };

    if (rateLimiter.current) {
      const rateLimitStats = rateLimiter.current.getStats();
      stats.totalRequests = rateLimitStats.totalRequests;
      stats.blockedRequests = rateLimitStats.blockedIPs;
    }

    if (bruteForceProtection.current) {
      const bruteForceStats = bruteForceProtection.current.getStats();
      stats.bruteForceAttempts = bruteForceStats.totalFailedAttempts;
    }

    if (botDetection.current) {
      const botStats = botDetection.current.getStats();
      stats.botDetections = botStats.botDetections;
    }

    if (securityMonitor.current) {
      const monitorStats = securityMonitor.current.getSecurityMetrics();
      stats.suspiciousActivity = monitorStats.suspiciousRequests;
    }

    return stats;
  }, []);

  // Get security dashboard data
  const getDashboardData = useCallback((timeRange = 24 * 60 * 60 * 1000) => {
    if (!enableMonitoring || !securityMonitor.current) {
      return null;
    }

    return securityMonitor.current.getDashboardData({ timeRange });
  }, [enableMonitoring]);

  // Generate security report
  const generateSecurityReport = useCallback((timeRange = 24 * 60 * 60 * 1000) => {
    if (!enableMonitoring || !securityMonitor.current) {
      return null;
    }

    return securityMonitor.current.generateSecurityReport({ timeRange });
  }, [enableMonitoring]);

  // Get security headers
  const getSecurityHeaders = useCallback((type = 'default', options = {}) => {
    if (!enableSecurityHeaders || !securityHeaders.current) {
      return {};
    }

    switch (type) {
      case 'api':
        return securityHeaders.current.generateAPIHeaders(options);
      case 'html':
        return securityHeaders.current.generateHTMLHeaders(options);
      case 'assets':
        return securityHeaders.current.generateAssetHeaders(options);
      default:
        return securityHeaders.current.generateSecurityHeaders(options);
    }
  }, [enableSecurityHeaders]);

  // Validate security headers
  const validateSecurityHeaders = useCallback((headers) => {
    if (!enableSecurityHeaders || !securityHeaders.current) {
      return { valid: true, score: 100 };
    }

    return securityHeaders.current.validateHeaders(headers);
  }, [enableSecurityHeaders]);

  // Update security stats periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateStats = () => {
      const stats = getSecurityStats();
      setSecurityStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isInitialized, getSecurityStats]);

  // Check if current session is blocked
  useEffect(() => {
    if (!isInitialized) return;

    const checkBlockStatus = () => {
      const identifier = getClientIdentifier();
      let blocked = false;

      if (rateLimiter.current) {
        blocked = blocked || rateLimiter.current.isBlocked(identifier);
      }

      if (bruteForceProtection.current) {
        blocked = blocked || bruteForceProtection.current.isBlocked(identifier);
      }

      setIsBlocked(blocked);
    };

    checkBlockStatus();
    const interval = setInterval(checkBlockStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isInitialized, getClientIdentifier]);

  // Comprehensive security check
  const performSecurityCheck = useCallback(async (requestType, requestData = {}) => {
    const identifier = getClientIdentifier();
    const results = {
      allowed: true,
      reasons: [],
      actions: [],
      riskScore: 0
    };

    try {
      // 1. Rate limiting check
      if (enableRateLimiting && rateLimiter.current) {
        const rateLimitResult = rateLimiter.current.checkRateLimit(identifier);
        if (!rateLimitResult.allowed) {
          results.allowed = false;
          results.reasons.push('Rate limit exceeded');
          results.riskScore += 0.7;
          results.actions.push('block_request');
        }
      }

      // 2. Brute force protection check
      if (enableBruteForceProtection && bruteForceProtection.current) {
        const bruteForceResult = bruteForceProtection.current.checkAuthAttempt(identifier);
        if (!bruteForceResult.allowed) {
          results.allowed = false;
          results.reasons.push('Brute force protection triggered');
          results.riskScore += 0.8;
          results.actions.push('block_request');
        }
      }

      // 3. Bot detection
      if (enableBotDetection && botDetection.current) {
        const botResult = botDetection.current.analyzeRequest(identifier, requestData);
        if (botResult.isBot) {
          results.allowed = false;
          results.reasons.push('Bot detected');
          results.riskScore += 0.9;
          results.actions.push('require_captcha');
        } else if (botResult.requiresCAPTCHA) {
          results.reasons.push('CAPTCHA required');
          results.riskScore += 0.5;
          results.actions.push('require_captcha');
        }
      }

      // 4. Global rate limiting
      if (enableRateLimiting && rateLimiter.current) {
        const globalResult = rateLimiter.current.checkGlobalRateLimit();
        if (!globalResult.allowed) {
          results.allowed = false;
          results.reasons.push('Global rate limit exceeded');
          results.riskScore += 0.6;
          results.actions.push('block_request');
        }
      }

      // Log security event
      if (enableMonitoring && securityMonitor.current) {
        securityMonitor.current.logSecurityEvent({
          type: 'security_check',
          identifier,
          source: 'useSecurity',
          severity: results.riskScore > 0.7 ? 'high' : results.riskScore > 0.3 ? 'medium' : 'low',
          details: {
            requestType,
            requestData,
            results
          },
          riskScore: results.riskScore
        });
      }

    } catch (error) {
      console.error('Security check failed:', error);
      results.allowed = false;
      results.reasons.push('Security check error');
      results.riskScore = 1.0;
    }

    return results;
  }, [
    enableRateLimiting,
    enableBruteForceProtection,
    enableBotDetection,
    enableMonitoring,
    getClientIdentifier
  ]);

  return {
    // Initialization status
    isInitialized,
    isBlocked,

    // Statistics
    securityStats,
    getSecurityStats,

    // Rate limiting
    checkRateLimit,
    checkAuthRateLimit,
    checkFormRateLimit,

    // Brute force protection
    checkBruteForce,
    recordFailedAuth,
    recordSuccessfulAuth,

    // Bot detection
    analyzeRequest,
    generateCAPTCHA,
    verifyCAPTCHA,

    // Monitoring
    logSecurityEvent,
    getDashboardData,
    generateSecurityReport,

    // Security headers
    getSecurityHeaders,
    validateSecurityHeaders,

    // Comprehensive security check
    performSecurityCheck,

    // Utility functions
    getClientIdentifier
  };
};

export default useSecurity;
