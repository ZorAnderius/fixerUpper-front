import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  isOrderModalOpen: false
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




