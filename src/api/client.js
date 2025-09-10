import axios from "axios";
import { getAccessToken, refreshToken } from "./tokenManager.js";
import { sanitizeInput } from "../helpers/security/sanitize.js";
import { RateLimiter } from "../helpers/security/validation.js";

// Rate limiter for API requests
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-No-CSRF": "1",
  },
  timeout: import.meta.env.VITE_API_TIMEOUT || 15000,
});

// Request interceptor for security
api.interceptors.request.use((config) => {
  // Rate limiting check
  const clientId = getClientId();
  if (!rateLimiter.isAllowed(clientId)) {
    return Promise.reject(new Error('Rate limit exceeded. Please try again later.'));
  }

  // Add access token
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Sanitize request data
  if (config.data && typeof config.data === 'object') {
    config.data = sanitizeRequestData(config.data);
  }

  // Security headers are handled by the server, not needed in client requests

  return config;
});

// Helper function to get client ID for rate limiting
const getClientId = () => {
  // Use a combination of user agent and IP-like identifier
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  return btoa(userAgent + screenResolution).substring(0, 16);
};

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

// Response interceptor for 401 + refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry)
      return Promise.reject(error);

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Refresh failed:", err);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
