import api from './client';

// Get user's cart
export const getCartItems = async () => {
  const response = await api.get('http://localhost:3000/api/carts');
  return response.data;
};

// Add item to cart
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('http://localhost:3000/api/carts', {
    productId,
    quantity
  });
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  const response = await api.put(`http://localhost:3000/api/carts/${productId}`, {
    quantity
  });
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (productId) => {
  const response = await api.delete(`http://localhost:3000/api/carts/${productId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await api.delete('http://localhost:3000/api/carts');
  return response.data;
};

// Checkout cart
export const checkoutCart = async (cartItemId) => {
  const response = await api.post(`http://localhost:3000/api/carts/${cartItemId}/checkout`);
  return response.data;
};