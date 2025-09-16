/**
 * Bot Detection Constants
 * Patterns and configuration for bot detection
 */

// Bot user agent patterns
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

// Behavioral patterns
export const BEHAVIORAL_PATTERNS = {
  NO_MOUSE_MOVEMENT: 'no_mouse_movement',
  STRAIGHT_LINE_MOVEMENT: 'straight_line_movement',
  CONSISTENT_TIMING: 'consistent_timing',
  NO_HUMAN_LIKE_DELAYS: 'no_human_like_delays',
  RAPID_FORM_FILLING: 'rapid_form_filling',
  NO_SCROLLING: 'no_scrolling'
};

// Fingerprinting patterns
export const FINGERPRINT_PATTERNS = {
  MISSING_CANVAS: 'missing_canvas',
  MISSING_WEBGL: 'missing_webgl',
  MINIMAL_PLUGINS: 'minimal_plugins',
  GENERIC_SCREEN_RES: 'generic_screen_resolution',
  MISSING_TIMEZONE: 'missing_timezone',
  MISSING_LANGUAGE: 'missing_language'
};

// CAPTCHA configuration
export const CAPTCHA_CONFIG = {
  TYPES: {
    MATH: 'math',
    TEXT: 'text',
    IMAGE: 'image',
    RECAPTCHA: 'recaptcha',
    HCAPTCHA: 'hcaptcha'
  },
  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  },
  TIMEOUT: 5 * 60 * 1000, // 5 minutes
  MAX_ATTEMPTS: 3,
  REFRESH_INTERVAL: 60 * 1000 // 1 minute
};

// Bot detection thresholds
export const BOT_DETECTION_THRESHOLDS = {
  SUSPICIOUS: 0.7,
  AUTO_BLOCK: 0.9,
  CAPTCHA_REQUIRED: 0.6,
  PROGRESSIVE_DELAY: 0.4
};
