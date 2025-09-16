/**
 * Clickjacking Protection Constants
 * Configuration and patterns for clickjacking protection
 */

// Default configuration
export const DEFAULT_CLICKJACKING_CONFIG = {
  enableXFrameOptions: true,
  enableCSPFrameAncestors: true,
  allowSameOrigin: false,
  trustedDomains: [],
  enableJavaScriptProtection: true
};

// Suspicious referer patterns
export const SUSPICIOUS_REFERER_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /<script/i,
  /<iframe/i,
  /<object/i,
  /<embed/i
];

// Frame busting patterns
export const FRAME_BUSTING_PATTERNS = [
  /top\.location/i,
  /parent\.location/i,
  /window\.top/i,
  /window\.parent/i,
  /self\.top/i
];

// Risk levels
export const RISK_LEVELS = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error messages
export const ERROR_MESSAGES = {
  SUSPICIOUS_REFERER: 'Suspicious referer pattern detected',
  MISSING_ORIGIN: 'Missing or null origin',
  FRAME_BUSTING_DETECTED: 'Frame busting attempt detected',
  IFRAME_DETECTED: 'Iframe detected in referer',
  FRAME_JAVASCRIPT: 'Frame-related JavaScript detected'
};

// Header values
export const HEADER_VALUES = {
  X_FRAME_OPTIONS: {
    DENY: 'DENY',
    SAMEORIGIN: 'SAMEORIGIN',
    ALLOW_FROM: 'ALLOW-FROM'
  },
  CSP_FRAME_ANCESTORS: {
    NONE: "'none'",
    SELF: "'self'",
    ALL: "'*'"
  }
};
