import api from './client';

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim();
  }
  return input;
};

// Get all products with filters
export const getAllProducts = async (filters = {}) => {
  try {
    const sanitizedFilters = {};
    
    // Sanitize filter values - only send non-empty values
    if (filters.category && filters.category !== '') {
      sanitizedFilters.category = sanitizeInput(filters.category);
    }
    if (filters.search && filters.search.trim() !== '') {
      sanitizedFilters.product = sanitizeInput(filters.search);
    }
    if (filters.sortBy) {
      sanitizedFilters.sortBy = sanitizeInput(filters.sortBy);
    }
    if (filters.page) {
      sanitizedFilters.page = parseInt(filters.page) || 1;
    }
    if (filters.limit) {
      sanitizedFilters.limit = parseInt(filters.limit) || 12;
    }
    
    // Only add params if they exist
    const params = new URLSearchParams();
    Object.keys(sanitizedFilters).forEach(key => {
      if (sanitizedFilters[key] !== undefined && sanitizedFilters[key] !== '') {
        params.append(key, sanitizedFilters[key]);
      }
    });
    
    const url = params.toString() ? `/products?${params.toString()}` : '/products';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    const sanitizedData = {};
    Object.keys(productData).forEach(key => {
      sanitizedData[key] = sanitizeInput(productData[key]);
    });
    
    const response = await api.post('/products', sanitizedData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const sanitizedData = {};
    Object.keys(productData).forEach(key => {
      sanitizedData[key] = sanitizeInput(productData[key]);
    });
    
    const response = await api.put(`/products/${id}`, sanitizedData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get all categories
export const getAllCategories = async () => {
  
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

// Get all product statuses
export const getAllProductStatuses = async () => {
  try {
    const response = await api.get('/product-statuses');
    return response.data;
  } catch (error) {
    console.error('Error fetching product statuses:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};