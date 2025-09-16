import Joi from 'joi';

/**
 * Product validation schemas
 */

// Common patterns for products
const productPatterns = {
  noHtmlTags: /^[^<>]*$/,
  noScriptTags: /^(?!.*<script).*$/i,
  noSqlInjection: /^[^';\"\\-]+$/,
  noCommandInjection: /^[^|&$`;]*$/
};

/**
 * Product creation/update schema
 */
export const productSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(100)
    .pattern(productPatterns.noHtmlTags)
    .pattern(productPatterns.noScriptTags)
    .pattern(productPatterns.noSqlInjection)
    .required()
    .messages({
      'string.min': 'Title is required',
      'string.max': 'Title must be less than 100 characters',
      'string.pattern.base': 'Title contains invalid characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .min(1)
    .max(1000)
    .pattern(productPatterns.noScriptTags)
    .allow('')
    .messages({
      'string.min': 'Description is required',
      'string.max': 'Description must be less than 1000 characters',
      'string.pattern.base': 'Description contains invalid characters'
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .required()
    .messages({
      'number.positive': 'Price must be positive',
      'number.max': 'Price must be less than 999,999.99',
      'any.required': 'Price is required'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(0)
    .max(9999)
    .required()
    .messages({
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity cannot be negative',
      'number.max': 'Quantity must be less than 10,000',
      'any.required': 'Quantity is required'
    }),
  
  category_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid category ID',
      'any.required': 'Category is required'
    }),
  
  status_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid status ID',
      'any.required': 'Status is required'
    }),
  
  // Optional fields
  image_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.uri': 'Invalid image URL format',
      'string.max': 'Image URL must be less than 500 characters'
    })
});

/**
 * Product search schema
 */
export const productSearchSchema = Joi.object({
  query: Joi.string()
    .max(100)
    .pattern(productPatterns.noHtmlTags)
    .pattern(productPatterns.noScriptTags)
    .pattern(productPatterns.noSqlInjection)
    .allow('')
    .messages({
      'string.max': 'Search query must be less than 100 characters',
      'string.pattern.base': 'Search query contains invalid characters'
    }),
  
  category: Joi.string()
    .uuid()
    .allow('')
    .messages({
      'string.guid': 'Invalid category ID'
    }),
  
  sortBy: Joi.string()
    .valid('title', 'price', 'created_at', 'updated_at')
    .allow('')
    .messages({
      'any.only': 'Invalid sort option'
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
    .max(50)
    .default(9)
    .messages({
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must be less than 50'
    })
});

/**
 * Product filter schema
 */
export const productFilterSchema = Joi.object({
  category: Joi.string()
    .uuid()
    .allow('')
    .messages({
      'string.guid': 'Invalid category ID'
    }),
  
  minPrice: Joi.number()
    .min(0)
    .max(999999.99)
    .messages({
      'number.min': 'Minimum price cannot be negative',
      'number.max': 'Minimum price must be less than 999,999.99'
    }),
  
  maxPrice: Joi.number()
    .min(0)
    .max(999999.99)
    .messages({
      'number.min': 'Maximum price cannot be negative',
      'number.max': 'Maximum price must be less than 999,999.99'
    }),
  
  inStock: Joi.boolean()
    .optional(),
  
  status: Joi.string()
    .uuid()
    .allow('')
    .messages({
      'string.guid': 'Invalid status ID'
    })
});

/**
 * Product ID schema
 */
export const productIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.guid': 'Invalid product ID',
    'any.required': 'Product ID is required'
  });

/**
 * Product image upload schema
 */
export const productImageSchema = Joi.object({
  product_image: Joi.any()
    .optional()
    .messages({
      'any.invalid': 'Invalid image file'
    })
});
