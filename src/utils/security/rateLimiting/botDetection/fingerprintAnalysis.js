/**
 * Fingerprint Analysis Module
 * Analyzes browser fingerprint for bot detection
 */

/**
 * Analyze browser fingerprint
 * @param {Object} fingerprint - Browser fingerprint data
 * @returns {Object} - Analysis result
 */
export const analyzeFingerprint = (fingerprint) => {
  const analysis = { score: 0, reasons: [] };

  // Check for missing or suspicious screen resolution
  if (!fingerprint.screenResolution || fingerprint.screenResolution.width < 800) {
    analysis.score += 0.5;
    analysis.reasons.push('Suspicious screen resolution');
  }

  // Check for missing timezone
  if (!fingerprint.timezone) {
    analysis.score += 0.5;
    analysis.reasons.push('Missing timezone information');
  }

  // Check for missing language
  if (!fingerprint.language) {
    analysis.score += 0.5;
    analysis.reasons.push('Missing language information');
  }

  // Check for too few plugins (bots often have minimal plugins)
  if (fingerprint.plugins && fingerprint.plugins.length < 2) {
    analysis.score += 0.5;
    analysis.reasons.push('Very few browser plugins');
  }

  // Check for missing canvas fingerprint
  if (!fingerprint.canvas) {
    analysis.score += 0.5;
    analysis.reasons.push('Missing canvas fingerprint');
  }

  // Check for missing WebGL fingerprint
  if (!fingerprint.webgl) {
    analysis.score += 0.5;
    analysis.reasons.push('Missing WebGL fingerprint');
  }

  return analysis;
};

/**
 * Generate browser fingerprint
 * @returns {Object} - Browser fingerprint data
 */
export const generateBrowserFingerprint = () => {
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    screenResolution: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    plugins: Array.from(navigator.plugins).map(plugin => plugin.name),
    canvas: generateCanvasFingerprint(),
    webgl: generateWebGLFingerprint(),
    timestamp: Date.now()
  };

  return fingerprint;
};

/**
 * Generate canvas fingerprint
 * @returns {string} - Canvas fingerprint
 */
export const generateCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Canvas fingerprint', 2, 2);
    
    return canvas.toDataURL();
  } catch (error) {
    return null;
  }
};

/**
 * Generate WebGL fingerprint
 * @returns {Object} - WebGL fingerprint
 */
export const generateWebGLFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;

    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      extensions: gl.getSupportedExtensions()
    };
  } catch (error) {
    return null;
  }
};
