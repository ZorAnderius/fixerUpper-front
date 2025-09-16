import axios from "axios";
import { getAccessToken, refreshToken } from "./tokenManager.js";
import { sanitizeInput } from "../utils/security/sanitizeInput.js";
// import { RateLimiter } from "../helpers/security/validation.js";
import { getCSRFToken, clearCSRFToken } from "./csrfService.js";

// Rate limiter for API requests (temporarily disabled)
// const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
});

// Request interceptor for security
api.interceptors.request.use(async (config) => {
  // Rate limiting check (temporarily disabled)
  // const clientId = getClientId();
  // if (!rateLimiter.isAllowed(clientId)) {
  //   return Promise.reject(new Error('Rate limit exceeded. Please try again later.'));
  // }

  // Add access token
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token only for POST/PUT/PATCH/DELETE requests EXCEPT auth endpoints
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
      // Continue without CSRF token - some endpoints might not require it
    }
  }

  // Sanitize request data (skip FormData)
  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    config.data = sanitizeRequestData(config.data);
  }

  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle CSRF token errors
    if (error.response?.status === 403 && 
        (error.response?.data?.message === 'CSRF header missing' || 
         error.response?.data?.error === 'CSRF token mismatch')) {
      clearCSRFToken();
      // Optionally retry the request with a new CSRF token
      if (error.config && !error.config._retry) {
        error.config._retry = true;
        try {
          const csrfToken = await getCSRFToken();
          error.config.headers['x-csrf-token'] = csrfToken;
          return api.request(error.config);
        } catch (csrfError) {
          // Failed to retry with new CSRF token
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

// Helper function to get client ID for rate limiting (temporarily disabled)
// const getClientId = () => {
//   // Use a combination of user agent and IP-like identifier
//   const userAgent = navigator.userAgent;
//   const screenResolution = `${screen.width}x${screen.height}`;
//   return btoa(userAgent + screenResolution).substring(0, 16);
// };

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
