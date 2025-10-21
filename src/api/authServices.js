import {  setAccessToken } from './tokenManager';
import { clearCSRFToken } from './csrfService.js';
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
      const { accessToken, user, csrfToken } = response.data.data;
      setAccessToken(accessToken, user);
      
          // Store CSRF token from response body for cross-domain access
          if (csrfToken) {
            const { setCSRFToken } = await import('./csrfService.js');
            setCSRFToken(csrfToken);
          }
      
      return { accessToken, user };
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      // Logout request failed
    } finally {
      // Always clear tokens on logout
      setAccessToken(null);
      clearCSRFToken();
      
      // Clear all cookies manually
      if (typeof document !== 'undefined') {
        // Clear all cookies by setting them to expire in the past
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name) {
            // Clear cookie for current domain
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            // Clear cookie for parent domain (for cross-domain scenarios)
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            // Clear cookie for all subdomains
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          }
        });
      }
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/current');
    
    // Extract data from nested structure
    // API returns { message: "...", data: { user data, csrfToken } }
    const { user, csrfToken } = response.data.data;
    
        // Store CSRF token from response body for cross-domain access
        if (csrfToken) {
          const { setCSRFToken } = await import('./csrfService.js');
          setCSRFToken(csrfToken);
        }
    
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