/**
 * Redirect Protection Constants
 * Configuration and patterns for redirect protection
 */

// Default configuration
export const DEFAULT_REDIRECT_CONFIG = {
  allowedDomains: [],
  allowSameOrigin: true,
  allowRelativePaths: true,
  strictMode: false,
  enableLogging: false,
  maxRedirectDepth: 5,
  maxRedirectsPerHour: 10,
  maxSimilarRedirects: 3
};

// Common redirect parameters
export const REDIRECT_PARAMS = [
  'redirect', 'redirect_uri', 'redirect_url', 'return_url',
  'return', 'url', 'next', 'continue', 'goto', 'target',
  'destination', 'callback', 'callback_url', 'returnto',
  'return_to', 'referer', 'referrer', 'from', 'to'
];

// Suspicious URL patterns
export const SUSPICIOUS_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /<script/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /eval\s*\(/i,
  /document\.cookie/i,
  /window\.location/i
];

// Common redirect domains (often used in attacks)
export const SUSPICIOUS_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'short.link',
  'rebrand.ly', 'cutt.ly', 'is.gd', 'v.gd', 'ow.ly'
];

// URL encoding patterns
export const ENCODING_PATTERNS = [
  /%2f/gi, // /
  /%5c/gi, // \
  /%3a/gi, // :
  /%2e/gi, // .
  /%20/gi, // space
  /%00/gi  // null byte
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
  NO_URL: 'No redirect URL provided',
  SUSPICIOUS_PATTERN: 'URL contains suspicious patterns',
  SUSPICIOUS_DOMAIN: 'URL contains suspicious domain',
  DOUBLE_SLASHES: 'URL contains suspicious double slashes',
  NULL_BYTES: 'URL contains null bytes',
  EXCESSIVE_ENCODING: 'URL contains excessive encoding',
  MIXED_ENCODING: 'URL contains mixed encoding patterns',
  STRICT_MODE: 'External redirects not allowed in strict mode',
  RAPID_REDIRECTS: 'Too many redirects in short time period',
  REDIRECT_LOOP: 'Potential redirect loop detected'
};

// Warning messages
export const WARNING_MESSAGES = {
  EXTERNAL_REDIRECT: 'External redirect detected',
  UNTRUSTED_DOMAIN: 'Redirecting to untrusted domain',
  SUSPICIOUS_PARAMETER: 'Suspicious redirect parameter detected'
};
