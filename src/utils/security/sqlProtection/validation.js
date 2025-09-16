/**
 * SQL Injection Validation Module
 * Handles validation of input against SQL injection patterns
 */

import { detectSQLInjection } from './detection.js';
import { sanitizeSQLInput } from './sanitization.js';

/**
 * Validate input against SQL injection patterns
 * @param {string} input - Input to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateSQLInput = (input, options = {}) => {
  const {
    allowSpecialChars = false,
    maxLength = 255,
    strictMode = true,
    customPatterns = [],
    whitelistPatterns = []
  } = options;

  const detection = detectSQLInjection(input);
  
  // Additional validations
  const errors = [];

  // Length validation
  if (input && input.length > maxLength) {
    errors.push(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Strict mode validation
  if (strictMode && !detection.isSafe) {
    errors.push('Input contains potentially unsafe SQL patterns');
  }

  // Special characters validation
  if (!allowSpecialChars && detection.threats.some(t => t.type === 'suspicious_chars')) {
    errors.push('Input contains special characters that may be unsafe');
  }

  // Custom patterns validation
  if (customPatterns.length > 0) {
    const customErrors = validateCustomPatterns(input, customPatterns);
    errors.push(...customErrors);
  }

  // Whitelist validation
  if (whitelistPatterns.length > 0) {
    const whitelistErrors = validateWhitelistPatterns(input, whitelistPatterns);
    errors.push(...whitelistErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    detection,
    sanitizedInput: detection.sanitizedInput || sanitizeSQLInput(input)
  };
};

/**
 * Validate input against custom patterns
 * @param {string} input - Input to validate
 * @param {Array} patterns - Custom patterns to check
 * @returns {Array} - Array of error messages
 */
export const validateCustomPatterns = (input, patterns) => {
  const errors = [];

  patterns.forEach(pattern => {
    if (pattern instanceof RegExp && pattern.test(input)) {
      errors.push(`Input matches forbidden pattern: ${pattern}`);
    } else if (typeof pattern === 'string' && input.includes(pattern)) {
      errors.push(`Input contains forbidden string: ${pattern}`);
    }
  });

  return errors;
};

/**
 * Validate input against whitelist patterns
 * @param {string} input - Input to validate
 * @param {Array} patterns - Whitelist patterns
 * @returns {Array} - Array of error messages
 */
export const validateWhitelistPatterns = (input, patterns) => {
  const errors = [];

  // If whitelist is provided, input must match at least one pattern
  if (patterns.length > 0) {
    const matchesWhitelist = patterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(input);
      } else if (typeof pattern === 'string') {
        return input.includes(pattern);
      }
      return false;
    });

    if (!matchesWhitelist) {
      errors.push('Input does not match any allowed patterns');
    }
  }

  return errors;
};

/**
 * Validate multiple inputs at once
 * @param {Object} inputs - Object with input values
 * @param {Object} options - Validation options
 * @returns {Object} - Validation results for all inputs
 */
export const validateMultipleInputs = (inputs, options = {}) => {
  const results = {};
  let hasThreats = false;
  let overallErrors = [];

  Object.entries(inputs).forEach(([key, value]) => {
    const validation = validateSQLInput(value, options);
    results[key] = validation;
    
    if (!validation.isValid) {
      hasThreats = true;
      overallErrors.push(`${key}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    results,
    hasThreats,
    overallErrors,
    overallRiskLevel: hasThreats ? 'high' : 'none'
  };
};

/**
 * Create a validation rule set
 * @param {Object} rules - Validation rules
 * @returns {Function} - Validation function
 */
export const createValidationRules = (rules) => {
  return (input) => {
    const errors = [];

    // Length rules
    if (rules.minLength && input.length < rules.minLength) {
      errors.push(`Input must be at least ${rules.minLength} characters long`);
    }

    if (rules.maxLength && input.length > rules.maxLength) {
      errors.push(`Input must not exceed ${rules.maxLength} characters`);
    }

    // Pattern rules
    if (rules.allowedPatterns && rules.allowedPatterns.length > 0) {
      const patternErrors = validateWhitelistPatterns(input, rules.allowedPatterns);
      errors.push(...patternErrors);
    }

    if (rules.forbiddenPatterns && rules.forbiddenPatterns.length > 0) {
      const patternErrors = validateCustomPatterns(input, rules.forbiddenPatterns);
      errors.push(...patternErrors);
    }

    // SQL injection validation
    const sqlValidation = validateSQLInput(input, {
      strictMode: rules.strictMode !== false,
      allowSpecialChars: rules.allowSpecialChars === true,
      maxLength: rules.maxLength
    });

    if (!sqlValidation.isValid) {
      errors.push(...sqlValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedInput: sqlValidation.sanitizedInput
    };
  };
};
