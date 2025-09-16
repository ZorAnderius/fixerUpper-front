/**
 * Security utilities index
 * Main export file for all sanitization functions
 */

export { sanitizeHtml } from './sanitizeHtml.js';
export { sanitizeInput } from './sanitizeInput.js';
export { sanitizeProductData } from './sanitizeProductData.js';
export { sanitizeUserInput } from './sanitizeUserInput.js';
export { sanitizeSearchQuery } from './sanitizeSearchQuery.js';

// Export SQL injection protection utilities
export * from './sqlProtection/index.js';
