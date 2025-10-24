import api from './client';

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '')
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
    // Always set limit to 9
    sanitizedFilters.limit = 9;
    
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
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('quantity', productData.quantity);
    formData.append('category_id', productData.category_id);
    formData.append('status_id', productData.status_id);
    
    // Add image file if present
    if (productData.product_image && productData.product_image instanceof File) {
      formData.append('product_image', productData.product_image);
    }
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    // Create FormData for file upload (similar to createProduct)
    const formData = new FormData();
    
    // Add ALL text fields (backend expects complete object)
    formData.append('title', productData.title || '');
    formData.append('description', productData.description || '');
    formData.append('price', productData.price || 0);
    formData.append('quantity', productData.quantity || 0);
    formData.append('category_id', productData.category_id || '');
    formData.append('status_id', productData.status_id || '');
    
    // Add image file if present
    if (productData.product_image && productData.product_image instanceof File) {
      formData.append('product_image', productData.product_image);
    }
    
    
    const response = await api.patch(`/products/${id}/edit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}/delete`);
    return response.data;
  } catch (error) {
  }
};

// Get all categories
export const getAllCategories = async () => {
  
  try {
    const response = await api.get('/categories');
    // API returns { status, message, data: [...] }
    // We need to return the data array
    const categories = response.data.data || response.data;
    return categories;
  } catch (error) {
  }
};

// Get all product statuses
export const getAllProductStatuses = async () => {
  try {
    const response = await api.get('/product-statuses');
    // API returns { status, message, data: [...] }
    // We need to return the data array and map status field to name field
    const statuses = response.data.data.map(item => ({
      id: item.id,
      name: item.status
    }));
    return statuses;
  } catch (error) {
  }
};