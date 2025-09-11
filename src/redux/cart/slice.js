import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
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
    setCartItems: (state, action) => {
      
      // Handle different response formats from backend
      let cartItems = [];
      
      if (Array.isArray(action.payload)) {
        cartItems = action.payload;
      } else if (action.payload && Array.isArray(action.payload.data)) {
        cartItems = action.payload.data;
      } else if (action.payload && Array.isArray(action.payload.cart)) {
        cartItems = action.payload.cart;
      } else if (action.payload && Array.isArray(action.payload.cartItems)) {
        // Backend returns cartItems array - THIS IS THE CORRECT PATH
        cartItems = action.payload.cartItems;
      } else if (action.payload && action.payload.items && Array.isArray(action.payload.items)) {
        cartItems = action.payload.items;
      } else if (action.payload && action.payload.data && typeof action.payload.data === 'object' && !Array.isArray(action.payload.data)) {
        // Backend returns {status: 200, message: "...", data: {}}
        // This means empty cart - data object is empty
        cartItems = [];
      }
      
      
      
      state.items = cartItems;
      state.totalItems = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
      state.totalPrice = cartItems.reduce((total, item) => {
        const price = parseFloat(item.products?.price || item.price || 0);
        const quantity = item.quantity || 0;
        return total + (price * quantity);
      }, 0);
      state.isLoading = false;
      state.error = null;
      
      
    },
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      
      
      // Look for existing item by product ID (check both product_id and products.id)
      const existingItem = state.items.find(item => 
        (item.product_id === product.id) || 
        (item.products?.id === product.id) ||
        (item.product?.id === product.id)
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const newItem = {
          id: `temp_${Date.now()}`, // Temporary ID for optimistic update
          product_id: product.id,
          products: product, // Store as 'products' to match backend structure
          product: product, // Keep both for compatibility
          quantity: quantity,
          price: product.price
        };
        state.items.push(newItem);
      }
      
      // Recalculate totals
      state.totalItems = state.items.reduce((total, item) => total + (item.quantity || 0), 0);
      state.totalPrice = state.items.reduce((total, item) => {
        const price = parseFloat(item.products?.price || item.product?.price || item.price || 0);
        const qty = item.quantity || 0;
        return total + (price * qty);
      }, 0);
      
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = quantity;
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    // Revert optimistic update for failed addToCart
    revertAddToCart: (state, action) => {
      const { productId } = action.payload;
      state.items = state.items.filter(item => 
        item.product_id !== productId && 
        item.products?.id !== productId && 
        item.product?.id !== productId
      );
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
  }
});

export const {
  setLoading,
  setError,
  clearError,
  setCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  revertAddToCart,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;






