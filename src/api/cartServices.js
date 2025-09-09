import api from './client';

// Get cart items
export const getCartItems = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (cartData) => {
  try {
    const response = await api.post('/cart', cartData);
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Update cart item
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Checkout cart
export const checkoutCart = async (checkoutData) => {
  try {
    const response = await api.post('/cart/checkout', checkoutData);
    return response.data;
  } catch (error) {
    console.error('Error checking out cart:', error);
    throw error;
  }
};