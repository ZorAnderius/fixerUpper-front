import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  currentProduct: null,
  categories: [],
  productStatuses: [],
  isLoading: false,
  error: null,
  filters: {
    category: '',
    search: '',
    sortBy: 'newest',
    page: 1,
    limit: 12
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  }
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setProducts: (state, action) => {
      console.log('setProducts called with payload:', action.payload);
      console.log('setProducts payload type:', typeof action.payload);
      console.log('setProducts payload isArray:', Array.isArray(action.payload));
      
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProductStatuses: (state, action) => {
      state.productStatuses = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addProduct: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentProduct && state.currentProduct.id === action.payload.id) {
        state.currentProduct = action.payload;
      }
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.currentProduct && state.currentProduct.id === action.payload) {
        state.currentProduct = null;
      }
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  }
});

export const {
  setLoading,
  setError,
  clearError,
  setProducts,
  setCurrentProduct,
  setCategories,
  setProductStatuses,
  setFilters,
  setPagination,
  addProduct,
  updateProduct,
  removeProduct,
  clearCurrentProduct
} = productsSlice.actions;

export default productsSlice.reducer;

