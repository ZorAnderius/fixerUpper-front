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
  setProducts,
  setLoading,
  setError,
  setPagination,
  setCategories,
  setProductStatuses,
  removeProduct,
  clearError,
  setCurrentProduct
} from './slice';

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters, { dispatch, rejectWithValue, getState }) => {
    try {
      // Check if products are already loaded with the same filters
      const currentState = getState();
      const existingProducts = currentState.products.products;
      const existingFilters = currentState.products.filters;
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(existingFilters);
      
      if (existingProducts && existingProducts.length > 0 && !filtersChanged) {
        return existingProducts;
      }
      dispatch(setLoading(true));
      dispatch(clearError());
      const response = await getAllProductsAPI(filters);
      
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
      } else if (response.totalPages) {
        // Fallback for direct response structure
        pagination = {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          itemsPerPage: response.itemsPerPage,
        };
      } else {
        // Default pagination if not provided
        pagination = {
          currentPage: filters?.page || 1,
          totalPages: 1,
          totalItems: products.length,
          itemsPerPage: filters?.limit || products.length,
        };
      }
      
      dispatch(setPagination(pagination));
      dispatch(setLoading(false));
      return { products, pagination };
    } catch (error) {
      console.error('fetchAllProducts error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
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
      
      // Set the current product in Redux state
      dispatch(setCurrentProduct(productData));
      dispatch(setLoading(false));
      return productData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch product';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await createProductAPI(productData);
      
      const newProduct = response.data || response;
      dispatch(setLoading(false));
      return newProduct;
    } catch (error) {
      console.error('createProduct error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await updateProductAPI(id, productData);
      
      const updatedProduct = response.data || response;
      dispatch(setLoading(false));
      return updatedProduct;
    } catch (error) {
      console.error('updateProduct error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await deleteProductAPI(id);
      
      dispatch(removeProduct(id));
      dispatch(setLoading(false));
      return id;
    } catch (error) {
      console.error('deleteProduct error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      // Check if categories are already loaded
      const currentState = getState();
      const existingCategories = currentState.products.categories;
      
      if (existingCategories && existingCategories.length > 0) {
        return existingCategories;
      }
      
      const response = await getAllCategoriesAPI();
      
      // Handle different response formats
      const categories = response.data || response;
      
      dispatch(setCategories(categories));
      return categories;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch categories';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch product statuses
export const fetchProductStatuses = createAsyncThunk(
  'products/fetchProductStatuses',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      // Check if product statuses are already loaded
      const currentState = getState();
      const existingStatuses = currentState.products.productStatuses;
      
      if (existingStatuses && existingStatuses.length > 0) {
        return existingStatuses;
      }
      
      const response = await getAllProductStatusesAPI();
      
      // Handle different response formats
      const statuses = response.data || response;
      
      dispatch(setProductStatuses(statuses));
      return statuses;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch product statuses';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);