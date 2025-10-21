import axios from "axios";
import { getAccessToken, refreshToken } from "./tokenManager.js";
import { sanitizeInput } from "../utils/security/sanitizeInput.js";
import { getCSRFToken, clearCSRFToken } from "./csrfService.js";


// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're on Vercel (production)
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://fixerupper-back.onrender.com/api';
  }
  // Check if we're on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  }
  // Default to environment variable or localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
};

const baseURL = getApiUrl();

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
});



api.interceptors.request.use(async (config) => {
  // Add access token
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toUpperCase();
  const requiresCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isAuthEndpoint = config.url?.includes('/users/login') || 
                        config.url?.includes('/users/register') || 
                        config.url?.includes('/users/confirm-oauth') ||
                        config.url?.includes('/users/request-google-oauth');
  
  if (requiresCSRF && !isAuthEndpoint) {
    try {
      console.log(`🔒 Adding CSRF token for ${method} request to ${config.url}`);
      const csrfToken = await getCSRFToken();
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
        console.log('✅ CSRF token added to headers');
      }
    } catch (error) {
      console.error('❌ Failed to get CSRF token:', error);
    }
  }

  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    config.data = sanitizeRequestData(config.data);
  }

  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('🚨 API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle CSRF token errors
    if (error.response?.status === 403 && 
        (error.response?.data?.message === 'CSRF header missing' || 
         error.response?.data?.error === 'CSRF token mismatch')) {
      console.log('🔒 CSRF token error detected');
      clearCSRFToken();
      // Optionally retry the request with a new CSRF token
      if (error.config && !error.config._retry) {
        error.config._retry = true;
        try {
          const csrfToken = await getCSRFToken();
          error.config.headers['x-csrf-token'] = csrfToken;
          return api.request(error.config);
        } catch (csrfError) {
          console.error('Failed to retry with new CSRF token:', csrfError);
        }
      }
    }
    
    // Handle token refresh on 401 and 403 errors
    if ((error.response?.status === 401 || error.response?.status === 403) && error.config && !error.config._retry) {
      error.config._retry = true;
      try {
        await refreshToken();
        const newToken = getAccessToken();
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to sanitize request data
const sanitizeRequestData = (data) => {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeInput(key);
      sanitized[sanitizedKey] = sanitizeRequestData(value);
    }
    return sanitized;
  }
  
  return data;
};


export default api;
