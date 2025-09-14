import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCartItems as getCartItemsAPI,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI,
  checkoutCart as checkoutCartAPI
} from '../../api/cartServices';
import {
  setLoading,
  setError,
  setCartItems,
  addToCart as addToCartAction,
  updateCartItem as updateCartItemAction,
  removeFromCart as removeFromCartAction,
  revertAddToCart,
  revertUpdateCartItem,
  revertRemoveFromCart,
  clearCart
} from './slice';

// Fetch cart items - ONLY for initial load, not for sync
export const fetchCartItems = createAsyncThunk(
  'cart/fetchItems',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await getCartItemsAPI();
      
      // Only set cart items on initial load - don't sync during optimistic updates
      dispatch(setCartItems(response));
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      // If cart doesn't exist (404), that's normal for new users - just set empty cart
      if (error.response?.status === 404) {
        // console.log('fetchCartItems: Cart not found (404) - setting empty cart');
        dispatch(setCartItems({ cartItems: [], cartId: null }));
        dispatch(setLoading(false));
        return { cartItems: [], cartId: null };
      }
      
      // For other errors, log but don't set error state to avoid affecting auth flow
      console.warn('fetchCartItems: Error fetching cart:', error.response?.data?.message || error.message);
      dispatch(setCartItems({ cartItems: [], cartId: null }));
      dispatch(setLoading(false));
      return { cartItems: [], cartId: null };
    }
  }
);

// Add item to cart - SIMPLE action creator, no async thunk
export const addToCart = ({ productId, quantity = 1 }) => async (dispatch, getState) => {
  const state = getState();
  const product = state.products.items.find(p => p.id === productId);
  
  if (!product) {
    dispatch(setError('Product not found'));
    return;
  }
  
  // Store original state for potential revert
  const originalItemId = state.cart.itemIds.find(itemId => {
    const item = state.cart.itemsById[itemId];
    return (item.product_id === productId) || 
           (item.products?.id === productId) ||
           (item.product?.id === productId);
  });
  
  const originalQuantity = originalItemId ? state.cart.itemsById[originalItemId].quantity : 0;
  
  // Optimistic update - add to Redux immediately
  dispatch(addToCartAction({ product, quantity }));
  
  try {
    // Sync with backend in background
    await addToCartAPI(productId, quantity);
  } catch (error) {
    // If backend call fails, revert the optimistic update
    dispatch(revertAddToCart({ productId }));
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
    dispatch(setError(errorMessage));
  }
};

// Update cart item quantity - SIMPLE action creator, no async thunk
export const updateCartItem = ({ cartItemId, quantity }) => async (dispatch, getState) => {
  // Store original quantity for potential revert
  const state = getState();
  let originalQuantity = null;
  let itemId = null;
  for (const currentItemId of state.cart.itemIds) {
    const item = state.cart.itemsById[currentItemId];
    if (item && (item.id === cartItemId || 
        item.product_id === cartItemId ||
        (item.products && item.products.id === cartItemId))) {
      originalQuantity = item.quantity;
      itemId = currentItemId;
      break;
    }
  }
  
  // Calculate new quantity (quantity is difference from backend)
  const newQuantity = originalQuantity + quantity;
  
  // Update in Redux store immediately (optimistic update)
  dispatch(updateCartItemAction({ id: cartItemId, quantity: newQuantity }));
  
  try {
    // Sync with backend in background
    await updateCartItemAPI(cartItemId, quantity);
  } catch (error) {
    // If backend fails, revert the optimistic update
    if (originalQuantity !== null) {
      dispatch(revertUpdateCartItem({ cartItemId, originalQuantity }));
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart item';
    dispatch(setError(errorMessage));
  }
};

// Remove item from cart - SIMPLE action creator, no async thunk
export const removeFromCart = (cartItemId) => async (dispatch, getState) => {
  // Store original item for potential revert (before any changes)
  const state = getState();
  let originalItem = null;
  for (const itemId of state.cart.itemIds) {
    const item = state.cart.itemsById[itemId];
    if (item && (item.id === cartItemId || 
        item.product_id === cartItemId ||
        (item.products && item.products.id === cartItemId))) {
      originalItem = item;
      break;
    }
  }
  
  // Remove from Redux store immediately (optimistic update)
  dispatch(removeFromCartAction(cartItemId));
  
  try {
    // Sync with backend in background
    await removeFromCartAPI(cartItemId);
  } catch (error) {
    // If backend fails, revert the optimistic update
    if (originalItem) {
      dispatch(revertRemoveFromCart({ item: originalItem }));
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to remove from cart';
    dispatch(setError(errorMessage));
  }
};

// Checkout cart
export const checkoutCart = createAsyncThunk(
  'cart/checkout',
  async (cartId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await checkoutCartAPI(cartId);
      
      // Clear cart after successful checkout
      dispatch(clearCart());
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to checkout';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);