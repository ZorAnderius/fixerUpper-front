import { createSlice } from '@reduxjs/toolkit';
import { fetchAllOrders, fetchOrderById } from './operations';

const initialState = {
  items: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  isOrderModalOpen: false,
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 5
  }
};

const ordersSlice = createSlice({
  name: 'orders',
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
    setOrders: (state, action) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addOrder: (state, action) => {
      state.items.unshift(action.payload);
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    openOrderModal: (state) => {
      state.isOrderModalOpen = true;
    },
    closeOrderModal: (state) => {
      state.isOrderModalOpen = false;
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Handle different response formats
        if (action.payload.data) {
          const data = action.payload.data;
          state.items = Array.isArray(data) ? data : data.orders || [];
          
          // Store pagination data if available
          if (data.page !== undefined) {
            state.pagination = {
              page: data.page,
              totalPages: data.totalPages || 1,
              totalItems: data.totalItems || 0,
              hasNextPage: data.hasNextPage || false,
              hasPreviousPage: data.hasPreviousPage || false,
              limit: data.limit || 5
            };
          }
        } else {
          state.items = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // console.log('fetchOrderById.fulfilled payload:', action.payload);
        state.currentOrder = action.payload.data || action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setLoading,
  setError,
  clearError,
  setOrders,
  setCurrentOrder,
  addOrder,
  clearCurrentOrder,
  openOrderModal,
  closeOrderModal
} = ordersSlice.actions;

export default ordersSlice.reducer;






