/**
 * Bot Detection Module - Main Index
 * Combines all bot detection functionality
 */

import { analyzeUserAgent, getBotConfidence } from './userAgentAnalysis.js';
import { analyzeBehavior } from './behavioralAnalysis.js';
import { analyzeFingerprint, generateBrowserFingerprint } from './fingerprintAnalysis.js';
import { generateCAPTCHA, verifyCAPTCHA, validateChallenge } from './captcha.js';

class BotDetection {
  constructor(options = {}) {
    this.config = {
      enableBehavioralAnalysis: options.enableBehavioralAnalysis !== false,
      enableFingerprinting: options.enableFingerprinting !== false,
      enableCAPTCHA: options.enableCAPTCHA !== false,
      suspiciousThreshold: options.suspiciousThreshold || 0.7,
      autoBlockThreshold: options.autoBlockThreshold || 0.9,
      ...options
    };

    // Storage for behavioral data
    this.behavioralData = new Map(); // identifier -> behavior data
    this.suspiciousIPs = new Map(); // IP -> suspicion score
    this.knownBots = new Set(); // Known bot patterns
    this.captchaChallenges = new Map(); // identifier -> challenge data

    // Initialize known bot patterns
    this.initializeBotPatterns();
  }

  /**
   * Analyze request for bot behavior
   * @param {string} identifier - IP address or user ID
   * @param {Object} requestData - Request data
   * @returns {Object} - Bot detection result
   */
  analyzeRequest(identifier, requestData = {}) {
    const {
      userAgent = '',
      headers = {},
      timing = {},
      mouseMovements = [],
      keystrokeTiming = [],
      screenResolution = null,
      timezone = null,
      language = null,
      plugins = [],
      canvas = null,
      webgl = null
    } = requestData;

    // Initialize behavioral data if not exists
    if (!this.behavioralData.has(identifier)) {
      this.behavioralData.set(identifier, {
        requests: [],
        behaviors: [],
        suspicionScore: 0,
        lastActivity: Date.now()
      });
    }

    const behaviorData = this.behavioralData.get(identifier);
    const analysis = {
      isBot: false,
      suspicionScore: 0,
      reasons: [],
      confidence: 0,
      requiresCAPTCHA: false,
      shouldBlock: false
    };

    // 1. User Agent Analysis
    const uaAnalysis = analyzeUserAgent(userAgent);
    analysis.suspicionScore += uaAnalysis.score;
    analysis.reasons.push(...uaAnalysis.reasons);

    // 2. Behavioral Analysis
    if (this.config.enableBehavioralAnalysis) {
      const behaviorAnalysis = analyzeBehavior(identifier, {
        mouseMovements,
        keystrokeTiming,
        timing
      });
      analysis.suspicionScore += behaviorAnalysis.score;
      analysis.reasons.push(...behaviorAnalysis.reasons);
    }

    // 3. Fingerprinting Analysis
    if (this.config.enableFingerprinting) {
      const fingerprintAnalysis = analyzeFingerprint({
        screenResolution,
        timezone,
        language,
        plugins,
        canvas,
        webgl,
        headers
      });
      analysis.suspicionScore += fingerprintAnalysis.score;
      analysis.reasons.push(...fingerprintAnalysis.reasons);
    }

    // 4. Request Pattern Analysis
    const patternAnalysis = this.analyzeRequestPatterns(identifier, requestData);
    analysis.suspicionScore += patternAnalysis.score;
    analysis.reasons.push(...patternAnalysis.reasons);

    // Calculate final suspicion score (0-1)
    analysis.suspicionScore = Math.min(1, analysis.suspicionScore / 10);
    analysis.confidence = Math.min(1, analysis.reasons.length * 0.2);

    // Determine actions based on suspicion score
    if (analysis.suspicionScore >= this.config.autoBlockThreshold) {
      analysis.isBot = true;
      analysis.shouldBlock = true;
    } else if (analysis.suspicionScore >= this.config.suspiciousThreshold) {
      analysis.requiresCAPTCHA = true;
    }

    // Update behavioral data
    behaviorData.requests.push({
      timestamp: Date.now(),
      analysis,
      requestData
    });

    // Keep only last 100 requests
    if (behaviorData.requests.length > 100) {
      behaviorData.requests.splice(0, behaviorData.requests.length - 100);
    }

    behaviorData.suspicionScore = analysis.suspicionScore;
    behaviorData.lastActivity = Date.now();

    // Update suspicious IPs
    if (analysis.suspicionScore > 0.5) {
      this.suspiciousIPs.set(identifier, {
        score: analysis.suspicionScore,
        lastSeen: Date.now(),
        reasons: analysis.reasons
      });
    }

    return analysis;
  }

  /**
   * Generate CAPTCHA challenge
   * @param {string} identifier - IP address
   * @returns {Object} - CAPTCHA challenge data
   */
  generateCAPTCHA(identifier) {
    const challenge = generateCAPTCHA(identifier);
    this.captchaChallenges.set(identifier, challenge);
    return challenge;
  }

  /**
   * Verify CAPTCHA response
   * @param {string} identifier - IP address
   * @param {string} answer - User's answer
   * @returns {Object} - Verification result
   */
  verifyCAPTCHA(identifier, answer) {
    const challenge = this.captchaChallenges.get(identifier);
    const result = verifyCAPTCHA(challenge, answer);
    
    if (result.valid || result.reason === 'Max attempts exceeded') {
      this.captchaChallenges.delete(identifier);
    }
    
    return result;
  }

  /**
   * Analyze request patterns
   * @param {string} identifier - IP address
   * @param {Object} requestData - Request data
   * @returns {Object} - Analysis result
   */
  analyzeRequestPatterns(identifier, requestData) {
    const analysis = { score: 0, reasons: [] };
    const behaviorData = this.behavioralData.get(identifier);

    if (!behaviorData) return analysis;

    const recentRequests = behaviorData.requests.slice(-10);
    
    // Check for rapid requests
    if (recentRequests.length >= 5) {
      const timeSpan = recentRequests[recentRequests.length - 1].timestamp - recentRequests[0].timestamp;
      if (timeSpan < 5000) { // 5 seconds
        analysis.score += 1;
        analysis.reasons.push('Rapid request pattern');
      }
    }

    // Check for identical request patterns
    const identicalRequests = recentRequests.filter(req => 
      req.requestData.userAgent === requestData.userAgent &&
      req.requestData.headers['accept-language'] === requestData.headers['accept-language']
    );

    if (identicalRequests.length > 3) {
      analysis.score += 0.5;
      analysis.reasons.push('Identical request patterns');
    }

    return analysis;
  }

  /**
   * Initialize known bot patterns
   */
  initializeBotPatterns() {
    const botUserAgents = [
      'Googlebot',
      'Bingbot',
      'Slurp',
      'DuckDuckBot',
      'Baiduspider',
      'YandexBot',
      'facebookexternalhit',
      'Twitterbot',
      'LinkedInBot',
      'WhatsApp',
      'TelegramBot'
    ];

    botUserAgents.forEach(ua => this.knownBots.add(ua.toLowerCase()));
  }

  /**
   * Get detection statistics
   * @returns {Object} - Statistics
   */
  getStats() {
    const now = Date.now();
    const windowStart = now - (24 * 60 * 60 * 1000); // Last 24 hours

    let totalRequests = 0;
    let botDetections = 0;
    let captchaChallenges = 0;

    this.behavioralData.forEach((data, identifier) => {
      const recentRequests = data.requests.filter(req => req.timestamp > windowStart);
      totalRequests += recentRequests.length;
      
      if (data.suspicionScore > 0.7) {
        botDetections++;
      }
    });

    captchaChallenges = this.captchaChallenges.size;

    return {
      totalRequests,
      botDetections,
      captchaChallenges,
      suspiciousIPs: this.suspiciousIPs.size,
      knownBots: this.knownBots.size
    };
  }

  /**
   * Clear all data (for testing or maintenance)
   */
  clear() {
    this.behavioralData.clear();
    this.suspiciousIPs.clear();
    this.captchaChallenges.clear();
  }
}

export { BotDetection };
