/**
 * Security Headers Management
 * Comprehensive security headers for protection against various attacks
 */

class SecurityHeaders {
  constructor(options = {}) {
    this.config = {
      enableCSP: options.enableCSP !== false,
      enableHSTS: options.enableHSTS !== false,
      enableXFrameOptions: options.enableXFrameOptions !== false,
      enableXSSProtection: options.enableXSSProtection !== false,
      enableReferrerPolicy: options.enableReferrerPolicy !== false,
      enablePermissionsPolicy: options.enablePermissionsPolicy !== false,
      ...options
    };

    this.defaultHeaders = this.generateDefaultHeaders();
  }

  /**
   * Generate comprehensive security headers
   * @param {Object} options - Custom options
   * @returns {Object} - Security headers
   */
  generateSecurityHeaders(options = {}) {
    const headers = { ...this.defaultHeaders };

    // Override with custom options
    if (options.csp) {
      headers['Content-Security-Policy'] = options.csp;
    }

    if (options.hsts) {
      headers['Strict-Transport-Security'] = options.hsts;
    }

    if (options.xFrameOptions) {
      headers['X-Frame-Options'] = options.xFrameOptions;
    }

    if (options.referrerPolicy) {
      headers['Referrer-Policy'] = options.referrerPolicy;
    }

    if (options.permissionsPolicy) {
      headers['Permissions-Policy'] = options.permissionsPolicy;
    }

    return headers;
  }

  /**
   * Generate default security headers
   * @returns {Object} - Default headers
   */
  generateDefaultHeaders() {
    const headers = {};

    // Content Security Policy
    if (this.config.enableCSP) {
      headers['Content-Security-Policy'] = this.generateCSP();
    }

    // HTTP Strict Transport Security
    if (this.config.enableHSTS) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    // X-Frame-Options
    if (this.config.enableXFrameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    // X-Content-Type-Options
    headers['X-Content-Type-Options'] = 'nosniff';

    // X-XSS-Protection
    if (this.config.enableXSSProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    // Permissions Policy
    if (this.config.enablePermissionsPolicy) {
      headers['Permissions-Policy'] = this.generatePermissionsPolicy();
    }

    // Additional security headers
    headers['X-Permitted-Cross-Domain-Policies'] = 'none';
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    return headers;
  }

  /**
   * Generate Content Security Policy
   * @param {Object} options - CSP options
   * @returns {string} - CSP header value
   */
  generateCSP(options = {}) {
    const policies = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for React development
        "'unsafe-eval'",   // Required for Vite development
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:'
      ],
      'connect-src': [
        "'self'",
        'https://api.example.com',
        'wss:',
        'ws:'
      ],
      'media-src': [
        "'self'",
        'data:',
        'blob:'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    };

    // Override with custom policies
    Object.assign(policies, options);

    // Convert to CSP string
    const cspString = Object.entries(policies)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    return cspString;
  }

  /**
   * Generate Permissions Policy
   * @param {Object} options - Permissions options
   * @returns {string} - Permissions Policy header value
   */
  generatePermissionsPolicy(options = {}) {
    const permissions = {
      'camera': ['()'],
      'microphone': ['()'],
      'geolocation': ['()'],
      'payment': ['()'],
      'usb': ['()'],
      'magnetometer': ['()'],
      'gyroscope': ['()'],
      'accelerometer': ['()'],
      'ambient-light-sensor': ['()'],
      'autoplay': ["'self'"],
      'fullscreen': ["'self'"],
      'picture-in-picture': ["'self'"],
      'display-capture': ['()']
    };

    // Override with custom permissions
    Object.assign(permissions, options);

    // Convert to Permissions Policy string
    const policyString = Object.entries(permissions)
      .map(([feature, allowlist]) => {
        return `${feature}=(${allowlist.join(' ')})`;
      })
      .join(', ');

    return policyString;
  }

  /**
   * Generate headers for API responses
   * @param {Object} options - Additional options
   * @returns {Object} - API headers
   */
  generateAPIHeaders(options = {}) {
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Add rate limiting headers
    if (options.rateLimit) {
      headers['X-RateLimit-Limit'] = options.rateLimit.limit;
      headers['X-RateLimit-Remaining'] = options.rateLimit.remaining;
      headers['X-RateLimit-Reset'] = options.rateLimit.reset;
      headers['Retry-After'] = options.rateLimit.retryAfter;
    }

    // Add CORS headers
    if (options.cors) {
      headers['Access-Control-Allow-Origin'] = options.cors.origin || "'self'";
      headers['Access-Control-Allow-Methods'] = options.cors.methods || 'GET, POST, PUT, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = options.cors.headers || 'Content-Type, Authorization';
      headers['Access-Control-Allow-Credentials'] = options.cors.credentials || 'true';
    }

    return headers;
  }

  /**
   * Generate headers for static assets
   * @param {Object} options - Asset options
   * @returns {Object} - Asset headers
   */
  generateAssetHeaders(options = {}) {
    const maxAge = options.maxAge || 31536000; // 1 year
    const headers = {
      'Cache-Control': `public, max-age=${maxAge}, immutable`,
      'X-Content-Type-Options': 'nosniff'
    };

    // Add integrity headers for critical assets
    if (options.integrity) {
      headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
    }

    return headers;
  }

  /**
   * Generate headers for HTML pages
   * @param {Object} options - Page options
   * @returns {Object} - HTML headers
   */
  generateHTMLHeaders(options = {}) {
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': this.generatePermissionsPolicy()
    };

    // Add CSP for HTML
    if (this.config.enableCSP) {
      headers['Content-Security-Policy'] = this.generateCSP(options.csp);
    }

    // Add HSTS for HTTPS
    if (this.config.enableHSTS && options.https) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    return headers;
  }

  /**
   * Validate security headers
   * @param {Object} headers - Headers to validate
   * @returns {Object} - Validation result
   */
  validateHeaders(headers) {
    const validation = {
      valid: true,
      warnings: [],
      errors: [],
      score: 100
    };

    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection'
    ];

    const recommendedHeaders = [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'Referrer-Policy',
      'Permissions-Policy'
    ];

    // Check required headers
    requiredHeaders.forEach(header => {
      if (!headers[header]) {
        validation.errors.push(`Missing required header: ${header}`);
        validation.score -= 20;
      }
    });

    // Check recommended headers
    recommendedHeaders.forEach(header => {
      if (!headers[header]) {
        validation.warnings.push(`Missing recommended header: ${header}`);
        validation.score -= 5;
      }
    });

    // Validate specific headers
    this.validateCSP(headers['Content-Security-Policy'], validation);
    this.validateHSTS(headers['Strict-Transport-Security'], validation);
    this.validateXFrameOptions(headers['X-Frame-Options'], validation);

    validation.valid = validation.errors.length === 0;
    validation.score = Math.max(0, validation.score);

    return validation;
  }

  /**
   * Validate Content Security Policy
   * @param {string} csp - CSP header value
   * @param {Object} validation - Validation object to update
   */
  validateCSP(csp, validation) {
    if (!csp) {
      validation.warnings.push('Content-Security-Policy is missing');
      return;
    }

    // Check for unsafe directives
    if (csp.includes("'unsafe-inline'") && !csp.includes('nonce-')) {
      validation.warnings.push('CSP uses unsafe-inline without nonce');
    }

    if (csp.includes("'unsafe-eval'")) {
      validation.warnings.push('CSP uses unsafe-eval which is risky');
    }

    // Check for required directives
    const requiredDirectives = ['default-src', 'script-src', 'object-src'];
    requiredDirectives.forEach(directive => {
      if (!csp.includes(directive)) {
        validation.warnings.push(`CSP missing ${directive} directive`);
      }
    });
  }

  /**
   * Validate HSTS header
   * @param {string} hsts - HSTS header value
   * @param {Object} validation - Validation object to update
   */
  validateHSTS(hsts, validation) {
    if (!hsts) {
      validation.warnings.push('Strict-Transport-Security is missing');
      return;
    }

    // Check for proper max-age
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    if (!maxAgeMatch) {
      validation.errors.push('HSTS missing max-age directive');
      return;
    }

    const maxAge = parseInt(maxAgeMatch[1]);
    if (maxAge < 31536000) { // Less than 1 year
      validation.warnings.push('HSTS max-age is less than 1 year');
    }

    // Check for includeSubDomains
    if (!hsts.includes('includeSubDomains')) {
      validation.warnings.push('HSTS should include includeSubDomains');
    }
  }

  /**
   * Validate X-Frame-Options header
   * @param {string} xfo - X-Frame-Options header value
   * @param {Object} validation - Validation object to update
   */
  validateXFrameOptions(xfo, validation) {
    if (!xfo) {
      validation.errors.push('X-Frame-Options is missing');
      return;
    }

    const validValues = ['DENY', 'SAMEORIGIN'];
    const uriMatch = xfo.match(/ALLOW-FROM\s+(.+)/);
    
    if (!validValues.includes(xfo) && !uriMatch) {
      validation.errors.push('Invalid X-Frame-Options value');
    }
  }

  /**
   * Get security score
   * @param {Object} headers - Headers to score
   * @returns {number} - Security score (0-100)
   */
  getSecurityScore(headers) {
    const validation = this.validateHeaders(headers);
    return validation.score;
  }

  /**
   * Generate security report
   * @param {Object} headers - Headers to analyze
   * @returns {Object} - Security report
   */
  generateSecurityReport(headers) {
    const validation = this.validateHeaders(headers);
    const report = {
      timestamp: new Date().toISOString(),
      score: validation.score,
      grade: this.getSecurityGrade(validation.score),
      validation,
      recommendations: this.generateRecommendations(validation),
      headers: Object.keys(headers).sort()
    };

    return report;
  }

  /**
   * Get security grade based on score
   * @param {number} score - Security score
   * @returns {string} - Security grade
   */
  getSecurityGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Generate security recommendations
   * @param {Object} validation - Validation result
   * @returns {Array} - Recommendations
   */
  generateRecommendations(validation) {
    const recommendations = [];

    if (validation.errors.length > 0) {
      recommendations.push('Fix critical security issues immediately');
    }

    if (validation.warnings.length > 0) {
      recommendations.push('Address security warnings for better protection');
    }

    if (!validation.warnings.some(w => w.includes('Content-Security-Policy'))) {
      recommendations.push('Implement Content Security Policy');
    }

    if (!validation.warnings.some(w => w.includes('Strict-Transport-Security'))) {
      recommendations.push('Enable HTTP Strict Transport Security');
    }

    recommendations.push('Regularly audit and update security headers');
    recommendations.push('Use security headers testing tools');

    return recommendations;
  }
}

export { SecurityHeaders };
