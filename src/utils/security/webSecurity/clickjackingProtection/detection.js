/**
 * Detection Module
 * Detects clickjacking attempts and suspicious patterns
 */

/**
 * Detect clickjacking attempt
 * @param {Object} requestData - Request data
 * @param {Object} config - Configuration options
 * @returns {Object} - Detection result
 */
export const detectClickjackingAttempt = (requestData, config) => {
  const detection = {
    isClickjacking: false,
    confidence: 0,
    reasons: [],
    riskLevel: 'none'
  };

  const { headers = {}, referer = '', origin = '' } = requestData;

  // Check for suspicious referer patterns
  if (referer) {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(referer)) {
        detection.isClickjacking = true;
        detection.confidence += 0.3;
        detection.reasons.push('Suspicious referer pattern detected');
      }
    }
  }

  // Check for missing or suspicious origin
  if (!origin || origin === 'null') {
    detection.confidence += 0.2;
    detection.reasons.push('Missing or null origin');
  }

  // Check for iframe-related headers
  if (headers['x-frame-options'] && 
      headers['x-frame-options'].toLowerCase() === 'deny') {
    detection.confidence += 0.1;
    detection.reasons.push('X-Frame-Options set to DENY');
  }

  // Check for frame busting attempts
  if (detectFrameBustingAttempt(requestData)) {
    detection.isClickjacking = true;
    detection.confidence += 0.4;
    detection.reasons.push('Frame busting attempt detected');
  }

  // Determine risk level
  if (detection.confidence >= 0.7) {
    detection.riskLevel = 'high';
  } else if (detection.confidence >= 0.4) {
    detection.riskLevel = 'medium';
  } else if (detection.confidence >= 0.2) {
    detection.riskLevel = 'low';
  }

  return detection;
};

/**
 * Detect frame busting attempt
 * @param {Object} requestData - Request data
 * @returns {boolean} - Is frame busting attempt
 */
export const detectFrameBustingAttempt = (requestData) => {
  const { userAgent = '', headers = {} } = requestData;

  // Check for frame busting in user agent
  const frameBustingPatterns = [
    /top\.location/i,
    /parent\.location/i,
    /window\.top/i,
    /window\.parent/i,
    /self\.top/i
  ];

  for (const pattern of frameBustingPatterns) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }

  // Check for suspicious headers that might indicate frame busting
  if (headers['x-requested-with'] === 'XMLHttpRequest' && 
      headers['x-frame-options'] === 'SAMEORIGIN') {
    return true;
  }

  return false;
};

/**
 * Check for suspicious iframe patterns
 * @param {Object} requestData - Request data
 * @returns {Object} - Iframe pattern check result
 */
export const checkIframePatterns = (requestData) => {
  const result = {
    isSuspicious: false,
    patterns: [],
    riskLevel: 'none'
  };

  const { headers = {}, referer = '' } = requestData;

  // Check for iframe-related headers
  if (headers['x-frame-options']) {
    result.patterns.push('X-Frame-Options header present');
  }

  // Check for iframe in referer
  if (referer && referer.includes('iframe')) {
    result.isSuspicious = true;
    result.patterns.push('Iframe detected in referer');
    result.riskLevel = 'medium';
  }

  // Check for frame-related JavaScript
  if (requestData.userAgent && 
      (requestData.userAgent.includes('frame') || requestData.userAgent.includes('iframe'))) {
    result.isSuspicious = true;
    result.patterns.push('Frame-related JavaScript detected');
    result.riskLevel = 'high';
  }

  return result;
};
