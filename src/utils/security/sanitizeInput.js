import DOMPurify from 'dompurify';

/**
 * Sanitize general user input by removing dangerous content and limiting its length.
 * @param {string} input - The string to sanitize.
 * @param {number} maxLength - The maximum allowed length for the input.
 * @returns {string} The sanitized string.
 */
export const sanitizeInput = (input, maxLength = 255) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace and limit length
  let sanitized = input.trim().substring(0, maxLength);

  // Use DOMPurify to remove dangerous content, but keep it as plain text
  sanitized = DOMPurify.sanitize(sanitized, { USE_PROFILES: { html: false } });

  // Additional regex to remove protocols and event handlers that DOMPurify might miss in plain text mode
  sanitized = sanitized
    .replace(/javascript:[^\s]*/gi, '') // Remove javascript: protocol and everything after until space
    .replace(/on\w+=[^\s]*/gi, '') // Remove event handlers like onclick=...
    .replace(/data:[^\s]*/gi, '') // Remove data: protocol and everything after until space
    .replace(/vbscript:[^\s]*/gi, ''); // Remove vbscript: protocol and everything after until space

  // Normalize whitespace (replace multiple spaces with single space, trim)
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
};
