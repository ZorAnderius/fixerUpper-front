/**
 * SQL Injection Sanitization Module
 * Handles sanitization of input to prevent SQL injection
 */

import { SQL_SPECIAL_CHARS } from './detection.js';

/**
 * Sanitize input for SQL injection protection
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeSQLInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove or escape SQL special characters
  sanitized = removeSpecialCharacters(sanitized);
  
  // Remove SQL keywords
  sanitized = removeSQLKeywords(sanitized);
  
  // Clean up multiple spaces
  sanitized = normalizeSpaces(sanitized);

  return sanitized;
};

/**
 * Remove SQL special characters from input
 * @param {string} input - Input to process
 * @returns {string} - Processed input
 */
export const removeSpecialCharacters = (input) => {
  let result = input;

  SQL_SPECIAL_CHARS.forEach(char => {
    if (char === "'" || char === '"') {
      // Replace quotes with safe alternatives
      result = result.replace(new RegExp(char, 'g'), '');
    } else if (char === ';') {
      // Remove semicolons
      result = result.replace(/;/g, '');
    } else if (char === '--') {
      // Remove SQL comments
      result = result.replace(/--/g, '');
    } else if (char === '/*' || char === '*/') {
      // Remove block comments
      result = result.replace(/\/\*/g, '').replace(/\*\//g, '');
    }
  });

  return result;
};

/**
 * Remove SQL keywords from input
 * @param {string} input - Input to process
 * @returns {string} - Processed input
 */
export const removeSQLKeywords = (input) => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'UNION', 'SCRIPT', 'OR', 'AND', 'WHERE', 'FROM', 'INTO',
    'VALUES', 'SET', 'TABLE', 'DATABASE', 'SCHEMA'
  ];

  let result = input;

  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, '');
  });

  return result;
};

/**
 * Normalize spaces in input
 * @param {string} input - Input to process
 * @returns {string} - Processed input
 */
export const normalizeSpaces = (input) => {
  return input.replace(/\s+/g, ' ').trim();
};

/**
 * Escape SQL special characters instead of removing them
 * @param {string} input - Input to escape
 * @returns {string} - Escaped input
 */
export const escapeSQLInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/"/g, '""')  // Escape double quotes
    .replace(/;/g, '\\;') // Escape semicolons
    .replace(/--/g, '\\--') // Escape comments
    .replace(/\/\*/g, '\\/*') // Escape block comments
    .replace(/\*\//g, '\\*/'); // Escape block comments
};

/**
 * Clean input for safe database operations
 * @param {string} input - Input to clean
 * @param {Object} options - Cleaning options
 * @returns {string} - Cleaned input
 */
export const cleanInputForDatabase = (input, options = {}) => {
  const {
    removeKeywords = true,
    removeSpecialChars = true,
    escapeChars = false,
    maxLength = null
  } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let result = input;

  // Apply length limit
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  // Remove or escape special characters
  if (removeSpecialChars) {
    result = removeSpecialCharacters(result);
  } else if (escapeChars) {
    result = escapeSQLInput(result);
  }

  // Remove SQL keywords
  if (removeKeywords) {
    result = removeSQLKeywords(result);
  }

  // Normalize spaces
  result = normalizeSpaces(result);

  return result;
};
