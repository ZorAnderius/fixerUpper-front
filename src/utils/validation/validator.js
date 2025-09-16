import Joi from 'joi';

/**
 * Validation utility functions
 */

/**
 * Validate data against a Joi schema
 * @param {object} data - Data to validate
 * @param {object} schema - Joi schema
 * @returns {object} - Validation result
 */
export const validateData = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false, // Show all validation errors
    stripUnknown: true, // Remove unknown fields
    convert: true // Convert types when possible
  });

  return {
    isValid: !error,
    data: value,
    errors: error ? error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    })) : []
  };
};

/**
 * Validate and sanitize user input
 * @param {object} input - User input data
 * @param {object} schema - Joi schema
 * @returns {object} - Validation result with sanitized data
 */
export const validateAndSanitize = (input, schema) => {
  const result = validateData(input, schema);
  
  if (!result.isValid) {
    return {
      isValid: false,
      data: null,
      errors: result.errors
    };
  }

  return {
    isValid: true,
    data: result.data,
    errors: []
  };
};

/**
 * Validate form data with error handling
 * @param {object} formData - Form data
 * @param {object} schema - Joi schema
 * @param {function} onError - Error callback function
 * @returns {object} - Sanitized form data or null
 */
export const validateForm = (formData, schema, onError = null) => {
  const result = validateAndSanitize(formData, schema);
  
  if (!result.isValid) {
    if (onError && typeof onError === 'function') {
      onError(result.errors);
    }
    return null;
  }
  
  return result.data;
};

/**
 * Create a validation middleware for forms
 * @param {object} schema - Joi schema
 * @returns {function} - Validation middleware
 */
export const createValidationMiddleware = (schema) => {
  return (data) => {
    return validateAndSanitize(data, schema);
  };
};

/**
 * Validate multiple fields individually
 * @param {object} data - Data to validate
 * @param {object} schema - Joi schema
 * @returns {object} - Field-by-field validation results
 */
export const validateFields = (data, schema) => {
  const results = {};
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    error.details.forEach(detail => {
      const field = detail.path[0];
      if (!results[field]) {
        results[field] = [];
      }
      results[field].push(detail.message);
    });
  }
  
  return results;
};

/**
 * Check if a single field is valid
 * @param {any} value - Field value
 * @param {object} fieldSchema - Joi field schema
 * @returns {boolean} - Is field valid
 */
export const validateField = (value, fieldSchema) => {
  const { error } = fieldSchema.validate(value);
  return !error;
};
