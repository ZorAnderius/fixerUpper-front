import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe HTML string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (dirty, options = {}) => {
  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  };

  const config = { ...defaultOptions, ...options };
  
  try {
    return DOMPurify.sanitize(dirty, config);
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return '';
  }
};

/**
 * Sanitizes plain text by escaping HTML entities
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validates and sanitizes URL to prevent malicious redirects
 * @param {string} url - The URL to validate
 * @param {Array} allowedProtocols - Array of allowed protocols
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeURL = (url, allowedProtocols = ['http:', 'https:', 'mailto:']) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);
    
    // Check if protocol is allowed
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return null;
    }

    // Additional security checks
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      return null;
    }

    return urlObj.toString();
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
};

/**
 * Sanitizes form input by trimming and escaping
 * @param {string} input - The input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input, maxLength = 1000) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
};

/**
 * Validates email format and sanitizes it
 * @param {string} email - The email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const sanitized = sanitizeInput(email, 254); // RFC 5321 limit
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(sanitized) ? sanitized.toLowerCase() : null;
};

/**
 * Validates and sanitizes phone number
 * @param {string} phone - The phone number to validate
 * @returns {string|null} - Sanitized phone or null if invalid
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // For Ukrainian format: should be exactly 10 digits starting with 07
  // Pattern: 07XXXXXXXXX (07 + 8 more digits)
  if (digits.length === 10 && digits.startsWith('07')) {
    return digits;
  }
  
  // If it's 11 digits and starts with 07, take first 10
  if (digits.length === 11 && digits.startsWith('07')) {
    return digits.slice(0, 10);
  }
  
  // If it's 9 digits and starts with 7, add 0 at the beginning
  if (digits.length === 9 && digits.startsWith('7')) {
    return `0${digits}`;
  }
  
  // If it's 8 digits, add 07 at the beginning
  if (digits.length === 8) {
    return `07${digits}`;
  }
  
  return null;
};

