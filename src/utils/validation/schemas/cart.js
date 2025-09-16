import Joi from 'joi';

/**
 * Cart validation schemas
 */

/**
 * Add to cart schema
 */
export const addToCartSchema = Joi.object({
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
    .default(1)
    .messages({
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Quantity must be less than 100'
    })
});

/**
 * Update cart item schema
 */
export const updateCartItemSchema = Joi.object({
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
});

/**
 * Remove from cart schema
 */
export const removeFromCartSchema = Joi.object({
  productId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid product ID',
      'any.required': 'Product ID is required'
    })
});

/**
 * Cart item ID schema
 */
export const cartItemIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.guid': 'Invalid cart item ID',
    'any.required': 'Cart item ID is required'
  });

/**
 * Bulk cart operations schema
 */
export const bulkCartSchema = Joi.object({
  items: Joi.array()
    .items(Joi.object({
      productId: Joi.string()
        .uuid()
        .required(),
      quantity: Joi.number()
        .integer()
        .min(1)
        .max(99)
        .required()
    }))
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'Must contain at least one item',
      'array.max': 'Cannot add more than 50 items at once',
      'any.required': 'Items are required'
    })
});

/**
 * Clear cart schema
 */
export const clearCartSchema = Joi.object({
  confirm: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'Cart clearing must be confirmed',
      'any.required': 'Confirmation is required'
    })
});
