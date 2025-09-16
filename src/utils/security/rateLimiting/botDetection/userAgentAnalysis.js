/**
 * User Agent Analysis Module
 * Analyzes user agent strings for bot patterns
 */

// Known bot patterns
export const BOT_USER_AGENT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /php/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /webdriver/i,
  /puppeteer/i,
  /playwright/i
];

// Browser components that should be present
export const BROWSER_COMPONENTS = [
  'mozilla',
  'webkit', 
  'chrome',
  'firefox',
  'safari',
  'edge'
];

/**
 * Analyze User Agent for bot patterns
 * @param {string} userAgent - User agent string
 * @returns {Object} - Analysis result
 */
export const analyzeUserAgent = (userAgent) => {
  const analysis = { score: 0, reasons: [] };

  if (!userAgent) {
    analysis.score += 2;
    analysis.reasons.push('Missing user agent');
    return analysis;
  }

  const ua = userAgent.toLowerCase();

  // Check against known bot patterns
  for (const pattern of BOT_USER_AGENT_PATTERNS) {
    if (pattern.test(ua)) {
      analysis.score += 1.5;
      analysis.reasons.push(`Bot pattern detected: ${pattern.source}`);
    }
  }

  // Check for missing browser components
  const hasBrowserComponent = BROWSER_COMPONENTS.some(component => 
    ua.includes(component)
  );
  
  if (!hasBrowserComponent) {
    analysis.score += 1;
    analysis.reasons.push('Missing browser components');
  }

  // Suspicious user agent characteristics
  if (ua.length < 20) {
    analysis.score += 1;
    analysis.reasons.push('Suspiciously short user agent');
  }

  if (ua.includes('mozilla') && !ua.includes('firefox') && 
      !ua.includes('chrome') && !ua.includes('safari')) {
    analysis.score += 0.5;
    analysis.reasons.push('Inconsistent browser identification');
  }

  return analysis;
};

/**
 * Get bot confidence level
 * @param {Object} analysis - Analysis result
 * @returns {string} - Confidence level
 */
export const getBotConfidence = (analysis) => {
  if (analysis.score >= 3) return 'high';
  if (analysis.score >= 1.5) return 'medium';
  if (analysis.score >= 0.5) return 'low';
  return 'none';
};
