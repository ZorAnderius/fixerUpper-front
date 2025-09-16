import { sanitizeInput } from './sanitizeInput.js';

/**
 * Sanitize a search query string.
 * Removes dangerous content, special characters (except alphanumeric and hyphens),
 * normalizes whitespace, and limits length.
 * @param {string} query - The search query string.
 * @param {number} maxLength - The maximum allowed length for the query.
 * @returns {string} The sanitized search query.
 */
export const sanitizeSearchQuery = (query, maxLength = 100) => {
  if (typeof query !== 'string') {
    return '';
  }

  // Use sanitizeInput for initial cleaning of dangerous content
  let sanitized = sanitizeInput(query, maxLength);

  // Remove all non-alphanumeric characters except hyphens, apostrophes, dots, and spaces
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');

  // Normalize whitespace (replace multiple spaces with single space, trim)
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
};
