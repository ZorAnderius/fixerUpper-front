import Joi from 'joi';

/**
 * User validation schemas
 */

// Common patterns for user data
const userPatterns = {
  noHtmlTags: /^[^<>]*$/,
  noScriptTags: /^(?!.*<script).*$/i,
  noSqlInjection: /^[^';\"\\-]+$/,
  namePattern: /^[a-zA-Z\s\-'\.]+$/
};

/**
 * User profile update schema
 */
export const userProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(userPatterns.namePattern)
    .pattern(userPatterns.noHtmlTags)
    .pattern(userPatterns.noScriptTags)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be less than 100 characters',
      'string.pattern.base': 'Name contains invalid characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .pattern(userPatterns.noHtmlTags)
    .pattern(userPatterns.noScriptTags)
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.max': 'Email must be less than 255 characters',
      'string.pattern.base': 'Email contains invalid characters',
      'any.required': 'Email is required'
    }),
  
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Invalid phone number format'
    }),
  
  address: Joi.object({
    street: Joi.string()
      .max(255)
      .pattern(/^[a-zA-Z0-9\s\-'\.]+$/)
      .allow('')
      .messages({
        'string.max': 'Street address must be less than 255 characters',
        'string.pattern.base': 'Street address contains invalid characters'
      }),
    
    city: Joi.string()
      .max(100)
      .pattern(userPatterns.namePattern)
      .allow('')
      .messages({
        'string.max': 'City must be less than 100 characters',
        'string.pattern.base': 'City contains invalid characters'
      }),
    
    postalCode: Joi.string()
      .max(20)
      .pattern(/^[a-zA-Z0-9\s\-]+$/)
      .allow('')
      .messages({
        'string.max': 'Postal code must be less than 20 characters',
        'string.pattern.base': 'Postal code contains invalid characters'
      }),
    
    country: Joi.string()
      .max(100)
      .pattern(userPatterns.namePattern)
      .allow('')
      .messages({
        'string.max': 'Country must be less than 100 characters',
        'string.pattern.base': 'Country contains invalid characters'
      })
  }).optional(),
  
  preferences: Joi.object({
    newsletter: Joi.boolean()
      .default(false),
    
    notifications: Joi.boolean()
      .default(true),
    
    language: Joi.string()
      .valid('en', 'uk', 'ru')
      .default('en')
      .messages({
        'any.only': 'Invalid language selection'
      })
  }).optional()
});

/**
 * Change password schema
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(userPatterns.noHtmlTags)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password must be less than 128 characters',
      'string.pattern.base': 'New password contains invalid characters',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

/**
 * User ID schema
 */
export const userIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.guid': 'Invalid user ID',
    'any.required': 'User ID is required'
  });

/**
 * User role schema
 */
export const userRoleSchema = Joi.object({
  role: Joi.string()
    .valid('user', 'administrator', 'moderator')
    .required()
    .messages({
      'any.only': 'Invalid user role',
      'any.required': 'Role is required'
    })
});

/**
 * User search schema
 */
export const userSearchSchema = Joi.object({
  query: Joi.string()
    .max(100)
    .pattern(userPatterns.namePattern)
    .allow('')
    .messages({
      'string.max': 'Search query must be less than 100 characters',
      'string.pattern.base': 'Search query contains invalid characters'
    }),
  
  role: Joi.string()
    .valid('user', 'administrator', 'moderator')
    .allow('')
    .messages({
      'any.only': 'Invalid user role'
    }),
  
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
 * User deletion schema
 */
export const userDeletionSchema = Joi.object({
  confirm: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'User deletion must be confirmed',
      'any.required': 'Confirmation is required'
    }),
  
  reason: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Reason must be less than 500 characters'
    })
});
