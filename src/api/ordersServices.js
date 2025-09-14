import api from './client';

export const ordersServices = {
  // Get all orders for current user
  getAllOrders: async (page = 1, limit = 5) => {
    try {
      const response = await api.get(`/orders?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Orders API Error:', error);
      throw new Error(`Failed to fetch orders: ${error.response?.status || 'Unknown error'}`);
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Order API Error:', error);
      throw new Error(`Failed to fetch order: ${error.response?.status || 'Unknown error'}`);
    }
  },
};