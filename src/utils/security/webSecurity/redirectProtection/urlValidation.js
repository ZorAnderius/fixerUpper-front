/**
 * URL Validation Module
 * Handles URL validation and sanitization
 */

/**
 * Validate redirect URL
 * @param {string} url - URL to validate
 * @param {Object} config - Configuration options
 * @returns {Object} - Validation result
 */
export const validateRedirectUrl = (url, config) => {
  const validation = {
    isValid: false,
    safeUrl: null,
    riskLevel: 'none',
    reasons: [],
    warnings: []
  };

  if (!url) {
    validation.isValid = false;
    validation.reasons.push('No redirect URL provided');
    return validation;
  }

  // Check for suspicious patterns
  const suspiciousCheck = checkSuspiciousPatterns(url, config);
  if (suspiciousCheck.isSuspicious) {
    validation.reasons.push(...suspiciousCheck.reasons);
    validation.riskLevel = suspiciousCheck.riskLevel;
    return validation;
  }

  // Check for URL encoding attacks
  const encodingCheck = checkEncodingAttacks(url, config);
  if (encodingCheck.isAttack) {
    validation.reasons.push(...encodingCheck.reasons);
    validation.riskLevel = 'high';
    return validation;
  }

  // Check if URL is in whitelist
  if (isWhitelisted(url, config)) {
    validation.isValid = true;
    validation.safeUrl = url;
    validation.riskLevel = 'none';
    return validation;
  }

  // Check if URL is same origin
  if (config.allowSameOrigin && isSameOrigin(url, config.currentOrigin)) {
    validation.isValid = true;
    validation.safeUrl = url;
    validation.riskLevel = 'low';
    return validation;
  }

  // Check if URL is relative
  if (config.allowRelativePaths && isRelativeUrl(url)) {
    validation.isValid = true;
    validation.safeUrl = url;
    validation.riskLevel = 'low';
    return validation;
  }

  // If strict mode is enabled, block all external redirects
  if (config.strictMode) {
    validation.reasons.push('External redirects not allowed in strict mode');
    validation.riskLevel = 'medium';
    return validation;
  }

  // Default: allow but warn
  validation.isValid = true;
  validation.safeUrl = url;
  validation.riskLevel = 'medium';
  validation.warnings.push('External redirect detected');

  return validation;
};

/**
 * Check for suspicious patterns in URL
 * @param {string} url - URL to check
 * @param {Object} config - Configuration options
 * @returns {Object} - Suspicious pattern check result
 */
export const checkSuspiciousPatterns = (url, config) => {
  const result = {
    isSuspicious: false,
    riskLevel: 'none',
    reasons: []
  };

  const lowerUrl = url.toLowerCase();

  // Check against suspicious patterns
  for (const pattern of config.suspiciousPatterns || []) {
    if (pattern.test(url)) {
      result.isSuspicious = true;
      result.riskLevel = 'high';
      result.reasons.push('URL contains suspicious patterns');
      break;
    }
  }

  // Check for suspicious domains
  for (const domain of config.suspiciousDomains || []) {
    if (lowerUrl.includes(domain)) {
      result.isSuspicious = true;
      result.riskLevel = 'medium';
      result.reasons.push(`URL contains suspicious domain: ${domain}`);
      break;
    }
  }

  // Check for double slashes (potential bypass attempt)
  if (url.includes('//') && !url.startsWith('http://') && !url.startsWith('https://')) {
    result.isSuspicious = true;
    result.riskLevel = 'medium';
    result.reasons.push('URL contains suspicious double slashes');
  }

  // Check for null bytes
  if (url.includes('\x00')) {
    result.isSuspicious = true;
    result.riskLevel = 'high';
    result.reasons.push('URL contains null bytes');
  }

  return result;
};

/**
 * Check for URL encoding attacks
 * @param {string} url - URL to check
 * @param {Object} config - Configuration options
 * @returns {Object} - Encoding attack check result
 */
export const checkEncodingAttacks = (url, config) => {
  const result = {
    isAttack: false,
    reasons: []
  };

  // Check for excessive encoding
  let encodingCount = 0;
  for (const pattern of config.encodingPatterns || []) {
    const matches = url.match(pattern);
    if (matches) {
      encodingCount += matches.length;
    }
  }

  if (encodingCount > 10) {
    result.isAttack = true;
    result.reasons.push('URL contains excessive encoding');
  }

  // Check for mixed encoding (potential bypass attempt)
  const hasEncoded = /%[0-9a-fA-F]{2}/.test(url);
  const hasNormal = /[a-zA-Z0-9._-]/.test(url);
  
  if (hasEncoded && hasNormal && encodingCount > 5) {
    result.isAttack = true;
    result.reasons.push('URL contains mixed encoding patterns');
  }

  return result;
};

/**
 * Check if URL is whitelisted
 * @param {string} url - URL to check
 * @param {Object} config - Configuration options
 * @returns {boolean} - Is whitelisted
 */
export const isWhitelisted = (url, config) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (config.allowedDomains || []).some(domain => {
      if (domain === hostname) return true;
      if (domain.startsWith('*.')) {
        const domainSuffix = domain.substring(2);
        return hostname.endsWith(domainSuffix);
      }
      return false;
    });
  } catch (error) {
    return false;
  }
};

/**
 * Check if URL is same origin
 * @param {string} url - URL to check
 * @param {string} currentOrigin - Current origin
 * @returns {boolean} - Is same origin
 */
export const isSameOrigin = (url, currentOrigin) => {
  if (!currentOrigin) return false;

  try {
    const urlObj = new URL(url);
    const currentObj = new URL(currentOrigin);
    
    return urlObj.origin === currentObj.origin;
  } catch (error) {
    return false;
  }
};

/**
 * Check if URL is relative
 * @param {string} url - URL to check
 * @returns {boolean} - Is relative URL
 */
export const isRelativeUrl = (url) => {
  return !url.includes('://') && !url.startsWith('//');
};

/**
 * Sanitize redirect URL
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
export const sanitizeRedirectUrl = (url) => {
  if (!url) return '';

  // Remove null bytes
  let sanitized = url.replace(/\x00/g, '');

  // Decode common URL encodings
  try {
    sanitized = decodeURIComponent(sanitized);
  } catch (error) {
    // If decoding fails, keep original
  }

  // Remove suspicious characters
  sanitized = sanitized.replace(/[<>\"'`]/g, '');

  // Normalize slashes
  sanitized = sanitized.replace(/\/+/g, '/');

  return sanitized;
};
