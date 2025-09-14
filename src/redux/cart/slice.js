import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  itemsById: {}, // Normalized state - items by ID
  itemIds: [],   // Array of item IDs for ordering
  cartId: null,
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
      const { cartItems, cartId } = action.payload;
      
      // Normalize cart items into itemsById and itemIds
      state.itemsById = {};
      state.itemIds = [];
      
      if (cartItems && Array.isArray(cartItems)) {
        cartItems.forEach(item => {
          const itemId = item.id || `temp_${Date.now()}_${Math.random()}`;
          state.itemsById[itemId] = item;
          state.itemIds.push(itemId);
        });
      }
      
      state.cartId = cartId;
      state.isLoading = false;
      state.error = null;
    },
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      
      // Look for existing item by product ID
      let existingItemId = null;
      for (const itemId of state.itemIds) {
        const item = state.itemsById[itemId];
        if ((item.product_id === product.id) || 
            (item.products?.id === product.id) ||
            (item.product?.id === product.id)) {
          existingItemId = itemId;
          break;
        }
      }
      
      if (existingItemId) {
        // Update existing item quantity
        state.itemsById[existingItemId].quantity += quantity;
      } else {
        // Add new item
        const newItemId = `temp_${Date.now()}_${Math.random()}`;
        const newItem = {
          id: newItemId,
          product_id: product.id,
          products: product,
          product: product,
          quantity: quantity,
          price: product.price
        };
        state.itemsById[newItemId] = newItem;
        state.itemIds.push(newItemId);
      }
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      
      // Find item by id in normalized state
      let itemId = null;
      for (const currentItemId of state.itemIds) {
        const item = state.itemsById[currentItemId];
        if (item.id === id || 
            item.product_id === id ||
            (item.products && item.products.id === id)) {
          itemId = currentItemId;
          break;
        }
      }
      
      if (itemId && state.itemsById[itemId]) {
        // Update quantity (don't auto-remove on quantity 0)
        state.itemsById[itemId].quantity = quantity;
      }
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      
      // Find and remove item from normalized state
      let itemToRemove = null;
      for (const currentItemId of state.itemIds) {
        const item = state.itemsById[currentItemId];
        if (item.id === itemId || 
            item.product_id === itemId ||
            (item.products && item.products.id === itemId)) {
          itemToRemove = currentItemId;
          break;
        }
      }
      
      if (itemToRemove) {
        delete state.itemsById[itemToRemove];
        state.itemIds = state.itemIds.filter(id => id !== itemToRemove);
      }
    },
    // Revert optimistic update for failed addToCart
    revertAddToCart: (state, action) => {
      const { productId } = action.payload;
      
      // Find and remove the optimistically added item
      let itemToRemove = null;
      for (const currentItemId of state.itemIds) {
        const item = state.itemsById[currentItemId];
        if ((item.product_id === productId) || 
            (item.products?.id === productId) ||
            (item.product?.id === productId)) {
          itemToRemove = currentItemId;
          break;
        }
      }
      
      if (itemToRemove) {
        delete state.itemsById[itemToRemove];
        state.itemIds = state.itemIds.filter(id => id !== itemToRemove);
      }
    },
    // Revert optimistic update for failed updateCartItem
    revertUpdateCartItem: (state, action) => {
      const { cartItemId, originalQuantity } = action.payload;
      
      // Find item in normalized state
      let itemId = null;
      for (const currentItemId of state.itemIds) {
        const item = state.itemsById[currentItemId];
        if (item.id === cartItemId || 
            item.product_id === cartItemId ||
            (item.products && item.products.id === cartItemId)) {
          itemId = currentItemId;
          break;
        }
      }
      
      if (itemId && state.itemsById[itemId]) {
        state.itemsById[itemId].quantity = originalQuantity;
      }
    },
    // Revert optimistic update for failed removeFromCart
    revertRemoveFromCart: (state, action) => {
      const { item } = action.payload;
      const itemId = item.id || `temp_${Date.now()}_${Math.random()}`;
      state.itemsById[itemId] = item;
      state.itemIds.push(itemId);
    },
    clearCart: (state) => {
      state.itemsById = {};
      state.itemIds = [];
      state.cartId = null;
      state.error = null;
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
  revertUpdateCartItem,
  revertRemoveFromCart,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;