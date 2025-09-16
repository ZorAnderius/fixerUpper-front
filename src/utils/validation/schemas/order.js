import Joi from 'joi';

/**
 * Order validation schemas
 */

/**
 * Create order schema
 */
export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(Joi.object({
      productId: Joi.string()
        .uuid()
        .required()
        .messages({
          'string.guid': 'Invalid product ID',
          'any.required': 'Product ID is required'
        }),
      quantity: Joi.number()
        .integer()
        .min(1)
        .max(99)
        .required()
        .messages({
          'number.integer': 'Quantity must be a whole number',
          'number.min': 'Quantity must be at least 1',
          'number.max': 'Quantity must be less than 100',
          'any.required': 'Quantity is required'
        })
    }))
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'Order must contain at least one item',
      'array.max': 'Order cannot contain more than 20 items',
      'any.required': 'Order items are required'
    }),
  
  // Optional shipping information
  shippingAddress: Joi.object({
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
      .pattern(/^[a-zA-Z\s\-'\.]+$/)
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
      .pattern(/^[a-zA-Z\s\-'\.]+$/)
      .allow('')
      .messages({
        'string.max': 'Country must be less than 100 characters',
        'string.pattern.base': 'Country contains invalid characters'
      })
  }).optional(),
  
  notes: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Notes must be less than 500 characters'
    })
});

/**
 * Order ID schema
 */
export const orderIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.guid': 'Invalid order ID',
    'any.required': 'Order ID is required'
  });

/**
 * Order status update schema
 */
export const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Status is required'
    }),
  
  notes: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Notes must be less than 500 characters'
    })
});

/**
 * Order filter schema
 */
export const orderFilterSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .allow('')
    .messages({
      'any.only': 'Invalid order status'
    }),
  
  dateFrom: Joi.date()
    .iso()
    .allow('')
    .messages({
      'date.format': 'Invalid date format'
    }),
  
  dateTo: Joi.date()
    .iso()
    .allow('')
    .messages({
      'date.format': 'Invalid date format'
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
 * Order search schema
 */
export const orderSearchSchema = Joi.object({
  query: Joi.string()
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-'\.]+$/)
    .allow('')
    .messages({
      'string.max': 'Search query must be less than 100 characters',
      'string.pattern.base': 'Search query contains invalid characters'
    }),
  
  orderId: Joi.string()
    .uuid()
    .allow('')
    .messages({
      'string.guid': 'Invalid order ID'
    })
});
