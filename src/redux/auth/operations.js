import { createAsyncThunk } from '@reduxjs/toolkit';
import { authServices } from '../../api/authServices';
import { setAuth, clearAuth } from './slice';
import { clearCart } from '../cart/slice';
import { fetchCartItems } from '../cart/operations';

// Register user
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authServices.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await authServices.login(credentials);
      
      // Load user's cart after successful login (async, don't wait)
      dispatch(fetchCartItems()).catch(error => {
        // Cart fetch failed, but login still successful
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await authServices.logout();
      // Clear cart when user logs out
      dispatch(clearCart());
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authServices.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get current user');
    }
  }
);

// Update user avatar
export const updateUserAvatar = createAsyncThunk(
  'auth/updateUserAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authServices.updateAvatar(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update avatar');
    }
  }
);

// Google OAuth authentication
export const authenticateWithGoogleOAuth = createAsyncThunk(
  'auth/authenticateWithGoogleOAuth',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      // If we already have accessToken and user, just set them
      if (data.accessToken && data.user) {
        dispatch(setAuth({ user: data.user }));
        return { user: data.user, accessToken: data.accessToken };
      }
      
      // Otherwise, call the API service
      const response = await authServices.authenticateWithGoogleOAuth(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Google authentication failed');
    }
  }
);
