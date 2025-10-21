/**
 * CSRF Token Service
 * Handles fetching and managing CSRF tokens for secure API requests
 */

let csrfToken = null;
let tokenExpiry = null;
const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes

/**
 * Get CSRF token from cookie (since backend sets it in cookie)
 */
const getCSRFTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrfToken') {
      const token = decodeURIComponent(value);
      return token;
    }
  }
  return null;
};

/**
 * Set CSRF token from server response (used during auth operations)
 */
export const setCSRFToken = (token) => {
  csrfToken = token;
  tokenExpiry = Date.now() + TOKEN_LIFETIME;
};

/**
 * Get current CSRF token
 */
export const getCSRFToken = async () => {
  console.log('🔍 Getting CSRF token...');
  console.log('📄 All cookies:', document.cookie);
  
  // First try to get from cookie (backend sets this)
  const cookieToken = getCSRFTokenFromCookie();
  console.log('🍪 CSRF token from cookie:', cookieToken);
  
  if (cookieToken) {
    csrfToken = cookieToken;
    tokenExpiry = Date.now() + TOKEN_LIFETIME;
    console.log('✅ Using CSRF token from cookie');
    return csrfToken;
  }

  // Check if we have a cached token that's still valid
  if (csrfToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('✅ Using cached CSRF token');
    return csrfToken;
  }

  // If no valid token, throw error
  console.error('❌ No valid CSRF token available');
  throw new Error('No valid CSRF token available. Please authenticate first.');
};

/**
 * Clear CSRF token (e.g., on logout)
 */
export const clearCSRFToken = () => {
  csrfToken = null;
  tokenExpiry = null;
  
  // Clear cookie by setting it to expire in the past
  document.cookie = 'csrfToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

/**
 * Check if CSRF token is valid
 */
export const isCSRFTokenValid = () => {
  return csrfToken && tokenExpiry && Date.now() < tokenExpiry;
};
