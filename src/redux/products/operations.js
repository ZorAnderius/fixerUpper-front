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
  addProduct,
  updateProduct as updateProductAction,
  removeProduct
} from './slice';

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      console.log('fetchAllProducts thunk called with filters:', filters);
      const response = await getAllProductsAPI(filters);
      console.log('fetchAllProducts response:', response);
      
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
      
      console.log('fetchAllProducts processed products:', products);
      console.log('fetchAllProducts products type:', typeof products);
      console.log('fetchAllProducts products isArray:', Array.isArray(products));
      console.log('fetchAllProducts products length:', products?.length);
      
      dispatch(setProducts(products));
      
      // Handle pagination from different response formats
      let pagination;
      if (response.data && response.data.pagination) {
        pagination = response.data.pagination;
      } else if (response.pagination) {
        pagination = response.pagination;
      }
      
      if (pagination) {
        dispatch({
          type: 'products/setPagination',
          payload: pagination
        });
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
      console.log('fetchProductById: Starting fetch for ID:', id);
      dispatch(setLoading(true));
      const response = await getProductByIdAPI(id);
      console.log('fetchProductById: API response:', response);
      
      // Extract the actual product data from response.data
      const productData = response.data || response;
      console.log('fetchProductById: Extracted product data:', productData);
      
      dispatch(setCurrentProduct(productData));
      console.log('fetchProductById: Product set in state:', productData);
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
      
      dispatch(updateProductAction(response));
      return response;
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
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await deleteProductAPI(id);
      
      dispatch(removeProduct(id));
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
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
      console.log('fetchCategories thunk called');
      const response = await getAllCategoriesAPI();
      console.log('fetchCategories response:', response);
      
      // Handle different response formats
      const categories = response.data || response;
      console.log('fetchCategories processed categories:', categories);
      
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
