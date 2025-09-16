import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllProducts as getAllProductsAPI,
  getProductById as getProductByIdAPI,
  createProduct as createProductAPI,
  updateProduct as updateProductAPI,
  deleteProduct as deleteProductAPI,
  getAllCategories as getAllCategoriesAPI,
  getAllProductStatuses as getAllProductStatusesAPI
} from '../../api/productsServices';
import {
  setLoading,
  setError,
  setProducts,
  setCurrentProduct,
  setCategories,
  setProductStatuses,
  setFilters,
  setPagination,
  addProduct,
  updateProduct as updateProductAction,
  removeProduct
} from './slice';

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading(true));
      
      // Get current filters from state and merge with provided filters
      const currentState = getState();
      const currentFilters = currentState.products.filters;
      const mergedFilters = { ...currentFilters, ...(filters || {}) };
      
      
      const response = await getAllProductsAPI(mergedFilters);
      
      // Handle different response formats from API
      let products;
      if (response.data && response.data.products) {
        // Format: { data: { products: [...] } }
        products = response.data.products;
      } else if (response.products) {
        // Format: { products: [...] }
        products = response.products;
      } else if (Array.isArray(response)) {
        // Format: [...]
        products = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Format: { data: [...] }
        products = response.data;
      } else if (response.data && response.data.id) {
        // Format: { data: { single product } } - wrap in array
        products = [response.data];
      } else if (response.id) {
        // Format: { single product } - wrap in array
        products = [response];
      } else {
        // Fallback
        products = response;
      }
      
      
      dispatch(setProducts(products));
      
      // Handle pagination from API response
      let pagination;
      
      
      // Extract pagination from response.data (backend structure)
      if (response.data && response.data.totalPages) {
        pagination = {
          currentPage: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.totalItems || 0,
          itemsPerPage: response.data.limit || 9,
          hasNextPage: response.data.hasNextPage || false,
          hasPreviousPage: response.data.hasPreviousPage || false
        };
      }
      
      if (pagination) {
        dispatch(setPagination(pagination));
      } else {
        // If no pagination data, create default pagination
        const defaultPagination = {
          currentPage: mergedFilters.page || 1,
          totalPages: Math.ceil(products.length / 9),
          totalItems: products.length,
          itemsPerPage: 9
        };
        dispatch(setPagination(defaultPagination));
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await getProductByIdAPI(id);
      
      // Extract the actual product data from response.data
      const productData = response.data || response;
      
      dispatch(setCurrentProduct(productData));
      return productData;
    } catch (error) {
      console.error('fetchProductById: Error occurred:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch product';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Create product (Admin)
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await createProductAPI(productData);
      
      dispatch(addProduct(response));
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Update product (Admin)
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await updateProductAPI(id, productData);
      
      // Extract the updated product data from response
      const updatedProduct = response.data || response;
      
      dispatch(updateProductAction(updatedProduct));
      dispatch(setLoading(false)); // Add this line
      return updatedProduct;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete product (Admin)
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading(true));
      await deleteProductAPI(id);
      
      dispatch(removeProduct(id));
      dispatch(setLoading(false));
      
      return id;
    } catch (error) {
      console.error('Delete product error:', error);
      
      let errorMessage = 'Failed to delete product';
      
      // Handle specific error types
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        // Check for foreign key constraint errors
        if (backendMessage.includes('foreign key constraint') || 
            backendMessage.includes('cartItems_product_id_fkey')) {
          errorMessage = 'Cannot delete product: it is currently in users\' carts. Please remove it from all carts first.';
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await getAllCategoriesAPI();
      
      // Handle different response formats
      const categories = response.data || response;
      
      dispatch(setCategories(categories));
      return categories;
    } catch (error) {
      console.error('fetchCategories error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch categories';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch product statuses
export const fetchProductStatuses = createAsyncThunk(
  'products/fetchStatuses',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await getAllProductStatusesAPI();
      dispatch(setProductStatuses(response));
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch product statuses';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);
