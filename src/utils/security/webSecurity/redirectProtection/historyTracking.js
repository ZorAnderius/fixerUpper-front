/**
 * History Tracking Module
 * Tracks redirect history and detects suspicious patterns
 */

/**
 * Check redirect history for suspicious patterns
 * @param {string} identifier - IP address or user ID
 * @param {string} url - URL to check
 * @param {Map} redirectHistory - Redirect history storage
 * @param {Object} config - Configuration options
 * @returns {Object} - History check result
 */
export const checkRedirectHistory = (identifier, url, redirectHistory, config) => {
  const result = {
    isSuspicious: false,
    reasons: []
  };

  if (!redirectHistory.has(identifier)) {
    redirectHistory.set(identifier, []);
  }

  const history = redirectHistory.get(identifier);
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Clean old entries
  const recentHistory = history.filter(entry => entry.timestamp > oneHourAgo);

  // Check for rapid redirects
  if (recentHistory.length >= (config.maxRedirectsPerHour || 10)) {
    result.isSuspicious = true;
    result.reasons.push('Too many redirects in short time period');
  }

  // Check for redirect loops
  const similarRedirects = recentHistory.filter(entry => 
    entry.url === url || urlsAreSimilar(entry.url, url)
  );

  if (similarRedirects.length >= (config.maxSimilarRedirects || 3)) {
    result.isSuspicious = true;
    result.reasons.push('Potential redirect loop detected');
  }

  // Record this redirect
  recentHistory.push({
    url,
    timestamp: now,
    userAgent: navigator.userAgent
  });

  // Keep only recent history
  history.splice(0, history.length - recentHistory.length);
  history.push(...recentHistory);

  return result;
};

/**
 * Check if two URLs are similar
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {boolean} - Are similar
 */
export const urlsAreSimilar = (url1, url2) => {
  try {
    const obj1 = new URL(url1);
    const obj2 = new URL(url2);
    
    return obj1.hostname === obj2.hostname && 
           obj1.pathname === obj2.pathname;
  } catch (error) {
    return url1 === url2;
  }
};

/**
 * Record suspicious redirect attempt
 * @param {string} identifier - IP address or user ID
 * @param {string} url - Suspicious URL
 * @param {string} reason - Reason for suspicion
 * @param {Map} suspiciousRedirects - Suspicious redirects storage
 */
export const recordSuspiciousRedirect = (identifier, url, reason, suspiciousRedirects) => {
  if (!suspiciousRedirects.has(identifier)) {
    suspiciousRedirects.set(identifier, []);
  }

  suspiciousRedirects.get(identifier).push({
    url,
    reason,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  });
};

/**
 * Get redirect statistics for identifier
 * @param {string} identifier - IP address or user ID
 * @param {Map} redirectHistory - Redirect history storage
 * @returns {Object} - Redirect statistics
 */
export const getRedirectStats = (identifier, redirectHistory) => {
  if (!redirectHistory.has(identifier)) {
    return {
      total: 0,
      hourly: 0,
      daily: 0
    };
  }

  const history = redirectHistory.get(identifier);
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  const hourly = history.filter(entry => entry.timestamp > oneHourAgo).length;
  const daily = history.filter(entry => entry.timestamp > oneDayAgo).length;

  return {
    total: history.length,
    hourly,
    daily
  };
};

/**
 * Get global redirect statistics
 * @param {Map} redirectHistory - Redirect history storage
 * @param {Map} suspiciousRedirects - Suspicious redirects storage
 * @returns {Object} - Global statistics
 */
export const getGlobalRedirectStats = (redirectHistory, suspiciousRedirects) => {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  let totalRedirects = 0;
  let suspiciousRedirectCount = 0;
  let blockedRedirects = 0;
  let activeUsers = 0;

  redirectHistory.forEach((history, identifier) => {
    const recentHistory = history.filter(entry => entry.timestamp > oneDayAgo);
    totalRedirects += recentHistory.length;
    
    if (recentHistory.length > 0) {
      activeUsers++;
    }
  });

  suspiciousRedirects.forEach((suspicious, identifier) => {
    const recentSuspicious = suspicious.filter(entry => entry.timestamp > oneDayAgo);
    suspiciousRedirectCount += recentSuspicious.length;
    blockedRedirects += recentSuspicious.length;
  });

  return {
    totalRedirects,
    suspiciousRedirects: suspiciousRedirectCount,
    blockedRedirects,
    activeUsers,
    totalUsers: redirectHistory.size
  };
};

/**
 * Clear redirect history for identifier
 * @param {string} identifier - IP address or user ID
 * @param {Map} redirectHistory - Redirect history storage
 * @param {Map} suspiciousRedirects - Suspicious redirects storage
 */
export const clearRedirectHistory = (identifier, redirectHistory, suspiciousRedirects) => {
  redirectHistory.delete(identifier);
  suspiciousRedirects.delete(identifier);
};

/**
 * Clear all redirect history
 * @param {Map} redirectHistory - Redirect history storage
 * @param {Map} suspiciousRedirects - Suspicious redirects storage
 */
export const clearAllRedirectHistory = (redirectHistory, suspiciousRedirects) => {
  redirectHistory.clear();
  suspiciousRedirects.clear();
};
