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
  clearCart
} from './slice';

// Fetch cart items
export const fetchCartItems = createAsyncThunk(
  'cart/fetchItems',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await getCartItemsAPI();
      
      
      // Backend returns: { status: 200, message: "...", data: {...}, cartItems: [...] }
      // We need to pass the full response object to setCartItems
      dispatch(setCartItems(response));
      return response;
    } catch (error) {
      // If cart doesn't exist (404), that's normal for new users - just set empty cart
      if (error.response?.status === 404) {
        console.log('fetchCartItems: Cart not found (404) - setting empty cart');
        dispatch(setCartItems({ cartItems: [], cartId: null }));
        return { cartItems: [], cartId: null };
      }
      
      // For other errors, log but don't set error state to avoid affecting auth flow
      console.warn('fetchCartItems: Error fetching cart:', error.response?.data?.message || error.message);
      dispatch(setCartItems({ cartItems: [], cartId: null }));
      return { cartItems: [], cartId: null };
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading(true));
      
      // First add to Redux store for immediate UI update (optimistic update)
      const state = getState();
      const product = state.products.items.find(p => p.id === productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Optimistic update - add to Redux immediately
      dispatch(addToCartAction({ product, quantity }));
      
      // Then sync with backend
      const response = await addToCartAPI(productId, quantity);
      
      
      // Backend should return the updated cart items
      if (response.cartItems && Array.isArray(response.cartItems)) {
        // Update Redux with server response to ensure consistency
        dispatch(setCartItems(response));
      } else if (response.data && response.data.cartItems && Array.isArray(response.data.cartItems)) {
        // Backend might return cartItems in data object
        dispatch(setCartItems(response));
      } else {
        // If backend doesn't return cartItems, fetch the full cart to ensure sync
        dispatch(fetchCartItems());
      }
      
      return response;
    } catch (error) {
      // If backend call fails, we should revert the optimistic update
      
      // Remove the item we optimistically added
      dispatch(revertAddToCart({ productId }));
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ cartItemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      // Update in Redux store first
      dispatch(updateCartItemAction({ id: cartItemId, quantity }));
      
      // Then sync with backend
      const response = await updateCartItemAPI(cartItemId, quantity);
      
      
      // Update with server response - backend returns same structure as getCartItems
      dispatch(setCartItems(response));
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart item';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      // Remove from Redux store first
      dispatch(removeFromCartAction(cartItemId));
      
      // Then sync with backend
      await removeFromCartAPI(cartItemId);
      
      return cartItemId;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove from cart';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

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
