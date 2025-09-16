import Joi from 'joi';

/**
 * Common validation schemas and patterns
 */

// Common patterns for all schemas
export const commonPatterns = {
  // HTML tags and scripts
  noHtmlTags: /^[^<>]*$/,
  noScriptTags: /^(?!.*<script).*$/i,
  // XSS patterns
  noXssPatterns: /^(?!.*javascript:|.*vbscript:|.*data:).*$/i,
  // SQL injection patterns
  noSqlInjection: /^[^';\"\\-]+$/,
  // File path traversal
  noPathTraversal: /^[^.\/\\]*$/,
  // Command injection
  noCommandInjection: /^[^|&$`;]*$/,
  // Name pattern
  namePattern: /^[a-zA-Z\s\-'\.]+$/,
  // Alphanumeric with spaces
  alphanumericSpaces: /^[a-zA-Z0-9\s\-'\.]+$/,
  // Phone number pattern
  phonePattern: /^[\+]?[1-9][\d]{0,15}$/,
  // Postal code pattern
  postalCodePattern: /^[a-zA-Z0-9\s\-]+$/
};

/**
 * Generic text input schema
 */
export const textInputSchema = Joi.string()
  .max(1000)
  .pattern(commonPatterns.noHtmlTags)
  .pattern(commonPatterns.noScriptTags)
  .pattern(commonPatterns.noSqlInjection)
  .allow('')
  .messages({
    'string.max': 'Text must be less than 1000 characters',
    'string.pattern.base': 'Text contains invalid characters'
  });

/**
 * URL validation schema
 */
export const urlSchema = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .max(500)
  .messages({
    'string.uri': 'Invalid URL format',
    'string.max': 'URL must be less than 500 characters'
  });

/**
 * File name validation schema
 */
export const fileNameSchema = Joi.string()
  .max(255)
  .pattern(/^[a-zA-Z0-9\s\-_\.]+$/)
  .pattern(commonPatterns.noPathTraversal)
  .messages({
    'string.max': 'File name must be less than 255 characters',
    'string.pattern.base': 'File name contains invalid characters'
  });

/**
 * UUID validation schema
 */
export const uuidSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.guid': 'Invalid UUID format',
    'any.required': 'UUID is required'
  });

/**
 * Optional UUID validation schema
 */
export const optionalUuidSchema = Joi.string()
  .uuid()
  .allow('')
  .messages({
    'string.guid': 'Invalid UUID format'
  });

/**
 * Pagination schema
 */
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(1)
    .messages({
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1',
      'number.max': 'Page must be less than 1000'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must be less than 100'
    })
});

/**
 * Date range schema
 */
export const dateRangeSchema = Joi.object({
  dateFrom: Joi.date()
    .iso()
    .allow('')
    .messages({
      'date.format': 'Invalid date format'
    }),
  
  dateTo: Joi.date()
    .iso()
    .min(Joi.ref('dateFrom'))
    .allow('')
    .messages({
      'date.format': 'Invalid date format',
      'date.min': 'End date must be after start date'
    })
});

/**
 * Search query schema
 */
export const searchQuerySchema = Joi.string()
  .max(100)
  .pattern(commonPatterns.noHtmlTags)
  .pattern(commonPatterns.noScriptTags)
  .pattern(commonPatterns.noSqlInjection)
  .allow('')
  .messages({
    'string.max': 'Search query must be less than 100 characters',
    'string.pattern.base': 'Search query contains invalid characters'
  });

/**
 * Sort options schema
 */
export const sortOptionsSchema = Joi.object({
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'title', 'name', 'price', 'quantity')
    .default('created_at')
    .messages({
      'any.only': 'Invalid sort option'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be "asc" or "desc"'
    })
});

/**
 * Confirmation schema
 */
export const confirmationSchema = Joi.object({
  confirm: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'Action must be confirmed',
      'any.required': 'Confirmation is required'
    })
});

/**
 * Notes schema
 */
export const notesSchema = Joi.string()
  .max(500)
  .allow('')
  .messages({
    'string.max': 'Notes must be less than 500 characters'
  });
