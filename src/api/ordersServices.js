import { getAccessToken } from './tokenManager';

const API_BASE_URL = 'http://localhost:3000/api';

export const ordersServices = {
  // Get all orders for current user
  getAllOrders: async (page = 1, limit = 10) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/orders?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-No-CSRF': '1',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-No-CSRF': '1',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return response.json();
  },
};