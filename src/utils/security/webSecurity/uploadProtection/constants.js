/**
 * Upload Protection Constants
 * Configuration and patterns for upload protection
 */

// Default configuration
export const DEFAULT_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ],
  allowedExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.txt'
  ],
  scanForMalware: true,
  quarantineSuspicious: true,
  enableVirusScanning: false,
  maxFilesPerHour: 50,
  maxFilesPerDay: 200
};

// Executable file extensions
export const EXECUTABLE_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
  '.js', '.vbs', '.jar', '.php', '.asp', '.jsp',
  '.sh', '.ps1', '.py', '.pl', '.rb', '.go'
];

// Suspicious file name patterns
export const SUSPICIOUS_NAME_PATTERNS = [
  /\.exe$/i,
  /\.bat$/i,
  /\.cmd$/i,
  /\.scr$/i,
  /\.pif$/i,
  /\.js$/i,
  /\.vbs$/i,
  /\.jar$/i,
  /\.php$/i,
  /\.asp$/i,
  /\.jsp$/i,
  /\.sh$/i,
  /\.ps1$/i,
  /\.py$/i,
  /\.pl$/i,
  /\.rb$/i,
  /\.go$/i
];

// Magic numbers for file types
export const MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'zip': [0x50, 0x4B, 0x03, 0x04],
  'rar': [0x52, 0x61, 0x72, 0x21]
};

// Suspicious content patterns
export const CONTENT_PATTERNS = [
  /<script[^>]*>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /<iframe[^>]*>/gi,
  /<object[^>]*>/gi,
  /<embed[^>]*>/gi,
  /eval\s*\(/gi,
  /document\.cookie/gi,
  /window\.location/gi,
  /XMLHttpRequest/gi,
  /fetch\s*\(/gi
];

// Risk levels
export const RISK_LEVELS = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error messages
export const ERROR_MESSAGES = {
  NO_FILE: 'No file provided',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_NAME: 'File name is invalid',
  SUSPICIOUS_NAME: 'File name matches suspicious pattern',
  DOUBLE_EXTENSION: 'File has suspicious double extension',
  INVALID_MIME: 'MIME type is not allowed',
  INVALID_EXTENSION: 'File extension is not allowed',
  RATE_LIMIT_EXCEEDED: 'Upload rate limit exceeded',
  SUSPICIOUS_CONTENT: 'File contains suspicious content',
  MAGIC_NUMBER_MISMATCH: 'File magic numbers do not match declared type'
};

// Quarantine reasons
export const QUARANTINE_REASONS = {
  SUSPICIOUS_CONTENT: 'Suspicious content detected',
  MAGIC_NUMBER_MISMATCH: 'Magic number mismatch',
  EXECUTABLE_FILE: 'Executable file detected',
  DOUBLE_EXTENSION: 'Double extension detected',
  SUSPICIOUS_NAME: 'Suspicious filename',
  MANUAL_QUARANTINE: 'Manually quarantined'
};
