/**
 * Security Headers Constants
 * Configuration for security headers
 */

// Security headers templates
export const SECURITY_HEADERS = {
  // Strict CSP for production
  STRICT_CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'nonce-{nonce}'"],
    'style-src': ["'self'", "'nonce-{nonce}'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://api.example.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  },

  // Relaxed CSP for development
  RELAXED_CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https:', 'ws:', 'wss:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

// Permissions Policy
export const PERMISSIONS_POLICY = {
  'camera': ['()'],
  'microphone': ['()'],
  'geolocation': ['()'],
  'payment': ['()'],
  'usb': ['()'],
  'magnetometer': ['()'],
  'gyroscope': ['()'],
  'accelerometer': ['()'],
  'ambient-light-sensor': ['()'],
  'autoplay': ["'self'"],
  'fullscreen': ["'self'"],
  'picture-in-picture': ["'self'"],
  'display-capture': ['()']
};

// Default validation patterns
export const VALIDATION_PATTERNS = {
  // Email pattern
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone pattern (Ukrainian format)
  PHONE: /^07\d{8}$/,
  
  // Alphanumeric with spaces
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  
  // Numbers only
  NUMBERS_ONLY: /^\d+$/,
  
  // Letters only
  LETTERS_ONLY: /^[a-zA-Z]+$/,
  
  // Safe filename
  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,
  
  // URL pattern
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  EXCEEDS_MAX_LENGTH: 'Input exceeds maximum length',
  BELOW_MIN_LENGTH: 'Input below minimum length',
  CONTAINS_FORBIDDEN_PATTERN: 'Input contains forbidden pattern',
  DOES_NOT_MATCH_WHITELIST: 'Input does not match allowed patterns',
  SQL_INJECTION_DETECTED: 'SQL injection threat detected',
  SPECIAL_CHARS_NOT_ALLOWED: 'Special characters are not allowed',
  VALIDATION_FAILED: 'Input validation failed'
};
