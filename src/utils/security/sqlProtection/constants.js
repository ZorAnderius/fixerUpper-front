/**
 * SQL Injection Protection Constants Module
 * Contains constants, configurations, and default settings
 */

// Default configuration options
export const DEFAULT_CONFIG = {
  // Detection settings
  detection: {
    enabled: true,
    logThreats: false,
    strictMode: false
  },

  // Sanitization settings
  sanitization: {
    enabled: true,
    removeKeywords: true,
    removeSpecialChars: true,
    escapeChars: false,
    normalizeSpaces: true
  },

  // Validation settings
  validation: {
    enabled: true,
    maxLength: 255,
    minLength: 0,
    allowSpecialChars: false,
    strictMode: false
  },

  // Handler settings
  handlers: {
    sanitize: true,
    validate: true,
    blockSubmission: true,
    logThreats: false
  }
};

// Risk level definitions
export const RISK_LEVELS = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Threat types
export const THREAT_TYPES = {
  SQL_PATTERN: 'sql_pattern',
  SUSPICIOUS_CHARS: 'suspicious_chars',
  EXCESSIVE_LENGTH: 'excessive_length',
  CUSTOM_PATTERN: 'custom_pattern',
  WHITELIST_VIOLATION: 'whitelist_violation'
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Common SQL keywords for detection
export const SQL_KEYWORDS = {
  DATA_MANIPULATION: [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE'
  ],
  DATA_DEFINITION: [
    'CREATE', 'DROP', 'ALTER', 'TRUNCATE'
  ],
  DATA_CONTROL: [
    'GRANT', 'REVOKE', 'DENY'
  ],
  TRANSACTION_CONTROL: [
    'COMMIT', 'ROLLBACK', 'SAVEPOINT'
  ],
  QUERY_OPERATORS: [
    'UNION', 'OR', 'AND', 'WHERE', 'FROM', 'INTO', 'VALUES', 'SET'
  ],
  FUNCTIONS: [
    'CONCAT', 'SUBSTRING', 'LENGTH', 'CHAR', 'ASCII', 'HEX', 'UNHEX', 'MD5', 'SHA1'
  ],
  INJECTION_PATTERNS: [
    'SLEEP', 'WAITFOR', 'DELAY', 'BENCHMARK'
  ]
};

// SQL special characters
export const SQL_SPECIAL_CHARACTERS = {
  QUOTES: ["'", '"', '`'],
  TERMINATORS: [';'],
  COMMENTS: ['--', '/*', '*/'],
  WILDCARDS: ['%', '*', '?'],
  ESCAPE_CHARS: ['\\', '\0', '\n', '\r', '\t']
};

// Default validation patterns
export const DEFAULT_PATTERNS = {
  // Email pattern
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone pattern (Ukrainian format)
  PHONE: /^07\d{8}$/,
  
  // Alphanumeric with spaces
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  
  // Numbers only
  NUMBERS_ONLY: /^\d+$/,
  
  // Letters only
  LETTERS_ONLY: /^[a-zA-Z]+$/,
  
  // Safe filename
  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,
  
  // URL pattern
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  EXCEEDS_MAX_LENGTH: 'Input exceeds maximum length',
  BELOW_MIN_LENGTH: 'Input below minimum length',
  CONTAINS_FORBIDDEN_PATTERN: 'Input contains forbidden pattern',
  DOES_NOT_MATCH_WHITELIST: 'Input does not match allowed patterns',
  SQL_INJECTION_DETECTED: 'SQL injection threat detected',
  SPECIAL_CHARS_NOT_ALLOWED: 'Special characters are not allowed',
  VALIDATION_FAILED: 'Input validation failed'
};

// Configuration presets
export const CONFIG_PRESETS = {
  // Strict mode - maximum security
  STRICT: {
    detection: { enabled: true, logThreats: true, strictMode: true },
    sanitization: { enabled: true, removeKeywords: true, removeSpecialChars: true },
    validation: { enabled: true, strictMode: true, allowSpecialChars: false },
    handlers: { sanitize: true, validate: true, blockSubmission: true }
  },

  // Moderate mode - balanced security
  MODERATE: {
    detection: { enabled: true, logThreats: false, strictMode: false },
    sanitization: { enabled: true, removeKeywords: true, removeSpecialChars: true },
    validation: { enabled: true, strictMode: false, allowSpecialChars: false },
    handlers: { sanitize: true, validate: true, blockSubmission: false }
  },

  // Lenient mode - minimal interference
  LENIENT: {
    detection: { enabled: true, logThreats: false, strictMode: false },
    sanitization: { enabled: false, removeKeywords: false, removeSpecialChars: false },
    validation: { enabled: true, strictMode: false, allowSpecialChars: true },
    handlers: { sanitize: false, validate: false, blockSubmission: false }
  }
};

// Performance settings
export const PERFORMANCE_SETTINGS = {
  // Maximum input length for processing
  MAX_INPUT_LENGTH: 10000,
  
  // Cache size for threat detection
  THREAT_CACHE_SIZE: 100,
  
  // Batch processing size
  BATCH_SIZE: 50,
  
  // Timeout for validation (ms)
  VALIDATION_TIMEOUT: 1000
};

// Logging levels
export const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

// Default logging configuration
export const LOGGING_CONFIG = {
  level: LOG_LEVELS.WARN,
  enableConsole: true,
  enableRemote: false,
  remoteEndpoint: null,
  batchSize: 10,
  flushInterval: 5000
};
