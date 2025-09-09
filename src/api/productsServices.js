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
  console.log('getAllProducts called with filters:', filters);
  
  try {
    const sanitizedFilters = {};
    
    // Sanitize filter values
    if (filters.category) {
      sanitizedFilters.category = sanitizeInput(filters.category);
    }
    if (filters.search) {
      sanitizedFilters.search = sanitizeInput(filters.search);
    }
    if (filters.sortBy) {
      sanitizedFilters.sortBy = sanitizeInput(filters.sortBy);
    }
    if (filters.page) {
      sanitizedFilters.page = parseInt(filters.page) || 1;
    }
    if (filters.limit) {
      sanitizedFilters.limit = parseInt(filters.limit) || 10;
    }
    
    const params = new URLSearchParams(sanitizedFilters);
    const url = `/products?${params.toString()}`;
    console.log('Making API request to:', url);
    console.log('Full URL:', api.defaults.baseURL + url);
    const response = await api.get(url);
    console.log('Products API response status:', response.status);
    console.log('Products API response data:', response.data);
    console.log('Products API response data type:', typeof response.data);
    console.log('Products API response data keys:', Object.keys(response.data || {}));
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
    console.log('Making API request to /products/' + id);
    const response = await api.get(`/products/${id}`);
    console.log('Product API response status:', response.status);
    console.log('Product API response data:', response.data);
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
    
    console.log('Making API request to POST /products');
    const response = await api.post('/products', sanitizedData);
    console.log('Create product API response status:', response.status);
    console.log('Create product API response data:', response.data);
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
    
    console.log('Making API request to PUT /products/' + id);
    const response = await api.put(`/products/${id}`, sanitizedData);
    console.log('Update product API response status:', response.status);
    console.log('Update product API response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    console.log('Making API request to DELETE /products/' + id);
    const response = await api.delete(`/products/${id}`);
    console.log('Delete product API response status:', response.status);
    console.log('Delete product API response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get all categories
export const getAllCategories = async () => {
  console.log('getAllCategories called');
  console.log('API base URL:', api.defaults.baseURL);
  
  try {
    console.log('Making API request to /categories');
    const response = await api.get('/categories');
    console.log('Categories API response status:', response.status);
    console.log('Categories API response data:', response.data);
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
  console.log('getAllProductStatuses called');
  
  try {
    console.log('Making API request to /product-statuses');
    const response = await api.get('/product-statuses');
    console.log('Product statuses API response status:', response.status);
    console.log('Product statuses API response data:', response.data);
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