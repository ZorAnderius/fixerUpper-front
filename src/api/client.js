import axios from "axios";
import { getAccessToken, refreshToken } from "./tokenManager.js";
import { sanitizeInput } from "../utils/security/sanitizeInput.js";
import { getCSRFToken, clearCSRFToken } from "./csrfService.js";

const NODE_ENV = import.meta.env.NODE_ENV;

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're on Vercel (production)
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://fixerupper-back.onrender.com/api';
  }
  // Check if we're on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const localUrl =
      NODE_ENV === "development" ? "http://localhost:3000/api" : import.meta.env.VITE_API_BASE_URL;
    return localUrl;
  }
  // Default to environment variable or localhost
  const defaultUrl = NODE_ENV === "development" ? "http://localhost:3000/api" : import.meta.env.VITE_API_BASE_URL;
  return defaultUrl;
};

const baseURL = getApiUrl();

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: import.meta.env.VITE_API_TIMEOUT || 60000, // 60 секунд
});



api.interceptors.request.use(async (config) => {
  // Add access token
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token to headers for additional security
  const method = config.method?.toUpperCase();
  const requiresCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isAuthEndpoint = config.url?.includes('/users/login') || 
                        config.url?.includes('/users/register') || 
                        config.url?.includes('/users/confirm-oauth') ||
                        config.url?.includes('/users/request-google-oauth');
  
  if (requiresCSRF && !isAuthEndpoint) {
    try {
      const csrfToken = await getCSRFToken();
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    } catch (error) {
      // Don't throw error, let the request proceed
    }
  }

  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    config.data = sanitizeRequestData(config.data);
  }

  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
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
        // Token refresh failed
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
