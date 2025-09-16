/**
 * Security Constants
 * Security-related configuration and patterns
 */

// Risk levels
export const RISK_LEVELS = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Event types
export const EVENT_TYPES = {
  AUTHENTICATION_ATTEMPT: 'authentication_attempt',
  BRUTE_FORCE_ATTEMPT: 'brute_force_attempt',
  BOT_DETECTION: 'bot_detection',
  RATE_LIMIT_VIOLATION: 'rate_limit_violation',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SECURITY_HEADER_VIOLATION: 'security_header_violation',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  CSRF_ATTEMPT: 'csrf_attempt'
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Threat categories
export const THREAT_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  INJECTION: 'injection',
  XSS: 'xss',
  CSRF: 'csrf',
  DOS: 'dos',
  BRUTE_FORCE: 'brute_force',
  BOT: 'bot',
  MALWARE: 'malware',
  PHISHING: 'phishing'
};

// Alert thresholds
export const ALERT_THRESHOLDS = {
  HIGH_RISK_SCORE: 0.8,
  RAPID_REQUESTS: 100,
  SUSPICIOUS_IPS: 10,
  BRUTE_FORCE_ATTEMPTS: 5,
  BOT_DETECTIONS: 20,
  SQL_INJECTION_ATTEMPTS: 3,
  XSS_ATTEMPTS: 3
};

// Attack patterns
export const ATTACK_PATTERNS = {
  // SQL injection patterns
  SQL_INJECTION: [
    /union.*select/i,
    /select.*from/i,
    /insert.*into/i,
    /update.*set/i,
    /delete.*from/i,
    /drop.*table/i,
    /create.*table/i,
    /alter.*table/i,
    /exec\s*\(/i,
    /sp_executesql/i
  ],

  // XSS patterns
  XSS: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi
  ],

  // CSRF patterns
  CSRF: [
    /<form[^>]*action[^>]*>/gi,
    /<img[^>]*src[^>]*>/gi,
    /<iframe[^>]*src[^>]*>/gi,
    /fetch\s*\(/gi,
    /XMLHttpRequest/gi,
    /axios\./gi
  ]
};
