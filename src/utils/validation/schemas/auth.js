import Joi from 'joi';

/**
 * Authentication validation schemas
 */

// Common patterns for auth
const authPatterns = {
  noHtmlTags: /^[^<>]*$/,
  noScriptTags: /^(?!.*<script).*$/i,
  noSqlInjection: /^[^';\"\\-]+$/
};

/**
 * Login schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .max(255)
    .pattern(authPatterns.noHtmlTags)
    .pattern(authPatterns.noScriptTags)
    .required()
    .messages({
      'string.pattern.base': 'Invalid email format',
      'string.max': 'Email must be less than 255 characters',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(authPatterns.noHtmlTags)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must be less than 128 characters',
      'string.pattern.base': 'Password contains invalid characters',
      'any.required': 'Password is required'
    })
});

/**
 * Registration schema
 */
export const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-'\.]+$/)
    .pattern(authPatterns.noHtmlTags)
    .pattern(authPatterns.noScriptTags)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must be less than 50 characters',
      'string.pattern.base': 'First name contains invalid characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-'\.]+$/)
    .pattern(authPatterns.noHtmlTags)
    .pattern(authPatterns.noScriptTags)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must be less than 50 characters',
      'string.pattern.base': 'Last name contains invalid characters',
      'any.required': 'Last name is required'
    }),
  
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .max(255)
    .pattern(authPatterns.noHtmlTags)
    .pattern(authPatterns.noScriptTags)
    .required()
    .messages({
      'string.pattern.base': 'Invalid email format',
      'string.max': 'Email must be less than 255 characters',
      'any.required': 'Email is required'
    }),
  
  phoneNumber: Joi.string()
    .pattern(/^07\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in format 07XXXXXXXX (10 digits starting with 07)',
      'any.required': 'Phone number is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(authPatterns.noHtmlTags)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must be less than 128 characters',
      'string.pattern.base': 'Password contains invalid characters',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),
  
  agreeToTerms: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must agree to the terms of use',
      'any.required': 'Terms agreement is required'
    })
});

/**
 * Password reset schema
 */
export const passwordResetSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .pattern(authPatterns.noHtmlTags)
    .pattern(authPatterns.noScriptTags)
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.max': 'Email must be less than 255 characters',
      'string.pattern.base': 'Email contains invalid characters',
      'any.required': 'Email is required'
    })
});

/**
 * New password schema
 */
export const newPasswordSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(authPatterns.noHtmlTags)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must be less than 128 characters',
      'string.pattern.base': 'Password contains invalid characters',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),
  
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    })
});
