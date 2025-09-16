import { sanitizeInput } from './sanitizeInput.js';

/**
 * Sanitize product data specifically for product creation and updates.
 * @param {object} productData - Product data object containing title, description, etc.
 * @returns {object} - Sanitized product data object
 */
export const sanitizeProductData = (productData) => {
  if (!productData || typeof productData !== 'object') {
    return {};
  }

  const sanitized = {
    title: sanitizeInput(productData.title, 100),
    description: sanitizeInput(productData.description, 1000),
  };

  // Only add other fields if they exist and are valid
  if (productData.price !== undefined && typeof productData.price === 'number') {
    sanitized.price = productData.price;
  }
  
  if (productData.quantity !== undefined && typeof productData.quantity === 'number') {
    sanitized.quantity = productData.quantity;
  }
  
  if (productData.category_id !== undefined && typeof productData.category_id === 'string') {
    sanitized.category_id = productData.category_id;
  }
  
  if (productData.status_id !== undefined && typeof productData.status_id === 'string') {
    sanitized.status_id = productData.status_id;
  }
  
  if (productData.image_url !== undefined && typeof productData.image_url === 'string') {
    sanitized.image_url = productData.image_url;
  }
  
  // Keep File objects as-is (for image uploads)
  if (productData.product_image !== undefined && productData.product_image instanceof File) {
    sanitized.product_image = productData.product_image;
  }

  return sanitized;
};
