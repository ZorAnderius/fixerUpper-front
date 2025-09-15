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
    if (productData.product_image) {
      formData.append('product_image', productData.product_image);
    }
    
    console.log('Sending product data:', {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      quantity: productData.quantity,
      category_id: productData.category_id,
      status_id: productData.status_id,
      hasImage: !!productData.product_image
    });
    
    // Debug FormData contents
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    // Create FormData for file upload (similar to createProduct)
    const formData = new FormData();
    
    // Add text fields (only if they have values)
    if (productData.title !== undefined) {
      formData.append('title', productData.title);
    }
    if (productData.description !== undefined) {
      formData.append('description', productData.description);
    }
    if (productData.price !== undefined) {
      formData.append('price', productData.price);
    }
    if (productData.quantity !== undefined) {
      formData.append('quantity', productData.quantity);
    }
    if (productData.category_id !== undefined) {
      formData.append('category_id', productData.category_id);
    }
    if (productData.status_id !== undefined) {
      formData.append('status_id', productData.status_id);
    }
    
    // Add image file if present
    if (productData.product_image) {
      formData.append('product_image', productData.product_image);
    }
    
    // console.log('Updating product with data:', {
    //   id,
    //   title: productData.title,
    //   description: productData.description,
    //   price: productData.price,
    //   quantity: productData.quantity,
    //   category_id: productData.category_id,
    //   status_id: productData.status_id,
    //   hasImage: !!productData.product_image
    // });
    
    // Debug FormData contents
    // console.log('FormData entries:');
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    
    const response = await api.patch(`/products/${id}/edit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}/delete`);
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
    // console.log('getAllCategories response:', response.data);
    // API returns { status, message, data: [...] }
    // We need to return the data array
    const categories = response.data.data || response.data;
    // console.log('Extracted categories:', categories);
    return categories;
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
    // console.log('getAllProductStatuses response:', response.data);
    // API returns { status, message, data: [...] }
    // We need to return the data array and map status field to name field
    const statuses = response.data.data.map(item => ({
      id: item.id,
      name: item.status // Map 'status' field to 'name' field for consistency
    }));
    // console.log('Mapped statuses:', statuses);
    return statuses;
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