/**
 * Security validation utilities
 */

/**
 * Validates if a string contains only safe characters
 * @param {string} str - String to validate
 * @param {RegExp} pattern - Pattern to match against
 * @returns {boolean} - True if string is safe
 */
export const validateSafeString = (str, pattern = /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+=\[\]{}|\\:";'<>?\/`~]*$/) => {
  if (typeof str !== 'string') {
    return false;
  }
  return pattern.test(str);
};

/**
 * Validates file upload security
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} - Validation result
 */
export const validateFileUpload = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!file) {
    result.isValid = false;
    result.errors.push('No file provided');
    return result;
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    result.isValid = false;
    result.errors.push('Invalid file type');
  }

  // Check file size
  if (file.size > maxSize) {
    result.isValid = false;
    result.errors.push('File too large');
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|com|scr|pif|vbs|js|jar|php|asp|aspx|jsp)$/i,
    /\.(sh|bash|zsh|fish|ps1|psm1)$/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      result.isValid = false;
      result.errors.push('Suspicious file extension');
      break;
    }
  }

  return result;
};

/**
 * Validates JSON data structure
 * @param {any} data - Data to validate
 * @param {Object} schema - Expected schema
 * @returns {boolean} - True if data matches schema
 */
export const validateJSONStructure = (data, schema) => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in data)) {
      return false;
    }

    const actualType = typeof data[key];
    if (actualType !== expectedType) {
      return false;
    }
  }

  return true;
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old entries
    for (const [key, timestamp] of this.requests.entries()) {
      if (timestamp < windowStart) {
        this.requests.delete(key);
      }
    }

    // Check current requests
    const currentRequests = Array.from(this.requests.values())
      .filter(timestamp => timestamp > windowStart).length;

    if (currentRequests >= this.maxRequests) {
      return false;
    }

    // Add current request
    this.requests.set(identifier, now);
    return true;
  }
}

/**
 * CSRF token validation
 * @param {string} token - Token to validate
 * @param {string} expectedToken - Expected token
 * @returns {boolean} - True if token is valid
 */
export const validateCSRFToken = (token, expectedToken) => {
  if (!token || !expectedToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }

  return result === 0;
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: true,
    score: 0,
    feedback: []
  };

  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.feedback.push('Password is required');
    return result;
  }

  // Length check
  if (password.length < 8) {
    result.isValid = false;
    result.feedback.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    result.score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) result.score += 1;
  if (/[A-Z]/.test(password)) result.score += 1;
  if (/[0-9]/.test(password)) result.score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) result.score += 1;

  // Common password patterns
  const commonPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
    /letmein/i
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      result.isValid = false;
      result.feedback.push('Password contains common patterns');
      break;
    }
  }

  // Minimum score requirement
  if (result.score < 3) {
    result.isValid = false;
    result.feedback.push('Password is too weak');
  }

  return result;
};



