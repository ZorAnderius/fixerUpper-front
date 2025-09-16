import api from './client';

// Get user's cart
export const getCartItems = async () => {
  try {
    const response = await api.get('/carts');
    
    // Backend returns {status: 200, message: "...", data: cart}
    // We need to extract cartItems from the cart object
    const backendData = response.data;
    if (backendData.status === 200 && backendData.data) {
      const cart = backendData.data;
      // Extract cartItems from cart object
      const cartItems = cart.cartItems || cart.items || [];
      
      const transformedResponse = {
        ...backendData,
        cartItems: cartItems,
        cartId: cart.id || cart.cart_id // Add cart ID
      };
      return transformedResponse;
    }
    
    return backendData;
  } catch (error) {
    // If cart doesn't exist (404) or user not authenticated, return empty cart
    if (error.response?.status === 404 || error.response?.status === 401) {
      return {
        status: 200,
        message: 'Cart is empty',
        cartItems: [],
        cartId: null
      };
    }
    // Re-throw other errors
    throw error;
  }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/carts/add', {
    product_id: productId,
    quantity
  });
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.patch(`/carts/${cartItemId}/update`, {
    quantity
  });
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  const response = await api.delete(`/carts/${cartItemId}/remove`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await api.delete('/carts');
  return response.data;
};

// Checkout cart
export const checkoutCart = async (cartId) => {
  const response = await api.post(`/carts/${cartId}/checkout`);
  return response.data;
};