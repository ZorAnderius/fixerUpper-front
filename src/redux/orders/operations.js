import { createAsyncThunk } from '@reduxjs/toolkit';
import { ordersServices } from '../../api/ordersServices';

// Fetch all orders
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async ({ page = 1, limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const response = await ordersServices.getAllOrders(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersServices.getOrderById(orderId);
      return response;
    } catch (error) {
      console.error('fetchOrderById error:', error);
      return rejectWithValue(error.message || 'Failed to fetch order');
    }
  }
);
