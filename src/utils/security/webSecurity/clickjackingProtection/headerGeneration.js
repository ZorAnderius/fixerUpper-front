/**
 * Header Generation Module
 * Generates security headers for clickjacking protection
 */

/**
 * Generate X-Frame-Options header
 * @param {string} origin - Request origin
 * @param {Object} config - Configuration options
 * @returns {string} - X-Frame-Options header value
 */
export const generateXFrameOptionsHeader = (origin, config) => {
  if (!config.enableXFrameOptions) {
    return null;
  }

  // Check if origin is trusted
  if (origin && isTrustedOrigin(origin, config)) {
    return 'SAMEORIGIN';
  }

  // Default to DENY for maximum protection
  return 'DENY';
};

/**
 * Generate CSP frame-ancestors directive
 * @param {string} origin - Request origin
 * @param {Object} config - Configuration options
 * @returns {string} - CSP frame-ancestors value
 */
export const generateCSPFrameAncestors = (origin, config) => {
  if (!config.enableCSPFrameAncestors) {
    return null;
  }

  if (origin && isTrustedOrigin(origin, config)) {
    return "'self'";
  }

  return "'none'";
};

/**
 * Check if origin is trusted
 * @param {string} origin - Origin to check
 * @param {Object} config - Configuration options
 * @returns {boolean} - Is trusted
 */
export const isTrustedOrigin = (origin, config) => {
  if (!origin) return false;

  return (config.trustedDomains || []).some(domain => {
    if (domain === origin) return true;
    if (domain.startsWith('*.')) {
      const domainSuffix = domain.substring(2);
      return origin.endsWith(domainSuffix);
    }
    return false;
  });
};

/**
 * Generate security headers for clickjacking protection
 * @param {string} origin - Request origin
 * @param {Object} config - Configuration options
 * @returns {Object} - Security headers
 */
export const generateSecurityHeaders = (origin, config) => {
  const headers = {};

  // X-Frame-Options header
  const xFrameOptions = generateXFrameOptionsHeader(origin, config);
  if (xFrameOptions) {
    headers['X-Frame-Options'] = xFrameOptions;
  }

  // CSP frame-ancestors directive
  const frameAncestors = generateCSPFrameAncestors(origin, config);
  if (frameAncestors) {
    headers['Content-Security-Policy'] = `frame-ancestors ${frameAncestors}`;
  }

  // Additional security headers
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  return headers;
};

/**
 * Generate frame busting JavaScript code
 * @returns {string} - Frame busting JavaScript
 */
export const generateFrameBustingCode = () => {
  return `
    (function() {
      if (window !== window.top) {
        try {
          window.top.location = window.location;
        } catch (e) {
          // If we can't access top, try to break out
          document.body.innerHTML = '<h1>This page cannot be displayed in a frame</h1>';
        }
      }
    })();
  `;
};
