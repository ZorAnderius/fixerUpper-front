import { getAccessToken, setAccessToken, refreshToken } from './tokenManager';
import { getCSRFToken, setCSRFToken, clearCSRFToken } from './csrfService.js';
import api from './client';

// Auth services object
export const authServices = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    
    // Extract data from nested structure
    const { accessToken, user } = response.data.data;
    setAccessToken(accessToken, user);
    
    // CSRF token is set in cookie by backend, no need to handle it here
    
    return { accessToken, user };
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      
      // Extract data from nested structure
      const { accessToken, user } = response.data.data;
      setAccessToken(accessToken, user);
      
      // CSRF token is set in cookie by backend, no need to handle it here
      
      return { accessToken, user };
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear tokens on logout
      setAccessToken(null);
      clearCSRFToken();
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/current');
    
    // Extract data from nested structure
    const { user } = response.data.data;
    
    return { user };
  },

  updateAvatar: async (formData) => {
    const response = await api.patch('/users/update-avatar', formData);
    return response.data;
  },

  authenticateWithGoogleOAuth: async (data) => {
    const response = await api.post('/users/confirm-oauth', data);
    
    const result = response.data;
    setAccessToken(result.accessToken, result.user);
    
    return result;
  }
};