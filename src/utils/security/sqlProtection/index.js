/**
 * SQL Injection Protection Module - Main Index
 * Centralized exports for all SQL protection functionality
 */

// Core detection functionality
export {
  detectSQLInjection,
  SQL_INJECTION_PATTERNS,
  SQL_SPECIAL_CHARS
} from './detection.js';

// Sanitization functionality
export {
  sanitizeSQLInput,
  removeSpecialCharacters,
  removeSQLKeywords,
  normalizeSpaces,
  escapeSQLInput,
  cleanInputForDatabase
} from './sanitization.js';

// Validation functionality
export {
  validateSQLInput,
  validateCustomPatterns,
  validateWhitelistPatterns,
  validateMultipleInputs,
  createValidationRules
} from './validation.js';

// Handler functionality
export {
  createSafeInputHandler,
  createProtectedFormHandler,
  createProtectedChangeHandler,
  createProtectedSetter,
  createBatchProcessor
} from './handlers.js';

// Constants and configuration
export {
  DEFAULT_CONFIG,
  RISK_LEVELS,
  THREAT_TYPES,
  SEVERITY_LEVELS,
  SQL_KEYWORDS,
  SQL_SPECIAL_CHARACTERS,
  DEFAULT_PATTERNS,
  ERROR_MESSAGES,
  CONFIG_PRESETS,
  PERFORMANCE_SETTINGS,
  LOG_LEVELS,
  LOGGING_CONFIG
} from './constants.js';

// Re-export main functions for backward compatibility
export {
  detectSQLInjection as detect
} from './detection.js';

export {
  sanitizeSQLInput as sanitize
} from './sanitization.js';

export {
  validateSQLInput as validate
} from './validation.js';

export {
  createSafeInputHandler as createHandler
} from './handlers.js';

// Import all functions for default export
import { detectSQLInjection } from './detection.js';
import { 
  sanitizeSQLInput, 
  removeSpecialCharacters, 
  removeSQLKeywords, 
  normalizeSpaces, 
  escapeSQLInput, 
  cleanInputForDatabase 
} from './sanitization.js';
import { 
  validateSQLInput, 
  validateCustomPatterns, 
  validateWhitelistPatterns, 
  validateMultipleInputs, 
  createValidationRules 
} from './validation.js';
import { 
  createSafeInputHandler, 
  createProtectedFormHandler, 
  createProtectedChangeHandler, 
  createProtectedSetter, 
  createBatchProcessor 
} from './handlers.js';
import { 
  DEFAULT_CONFIG, 
  CONFIG_PRESETS, 
  RISK_LEVELS, 
  THREAT_TYPES, 
  SEVERITY_LEVELS, 
  SQL_KEYWORDS, 
  SQL_SPECIAL_CHARACTERS, 
  DEFAULT_PATTERNS, 
  ERROR_MESSAGES, 
  PERFORMANCE_SETTINGS, 
  LOG_LEVELS, 
  LOGGING_CONFIG 
} from './constants.js';

// Default export with all functionality
export default {
  // Detection
  detect: detectSQLInjection,
  detectSQLInjection,
  
  // Sanitization
  sanitize: sanitizeSQLInput,
  sanitizeSQLInput,
  removeSpecialCharacters,
  removeSQLKeywords,
  normalizeSpaces,
  escapeSQLInput,
  cleanInputForDatabase,
  
  // Validation
  validate: validateSQLInput,
  validateSQLInput,
  validateCustomPatterns,
  validateWhitelistPatterns,
  validateMultipleInputs,
  createValidationRules,
  
  // Handlers
  createSafeInputHandler,
  createProtectedFormHandler,
  createProtectedChangeHandler,
  createProtectedSetter,
  createBatchProcessor,
  
  // Configuration
  config: {
    DEFAULT_CONFIG,
    CONFIG_PRESETS,
    RISK_LEVELS,
    THREAT_TYPES,
    SEVERITY_LEVELS,
    SQL_KEYWORDS,
    SQL_SPECIAL_CHARACTERS,
    DEFAULT_PATTERNS,
    ERROR_MESSAGES,
    PERFORMANCE_SETTINGS,
    LOG_LEVELS,
    LOGGING_CONFIG
  }
};
