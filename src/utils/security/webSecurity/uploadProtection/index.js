/**
 * Upload Protection Module - Main Index
 * Combines all upload protection functionality
 */

import { validateFileUpload } from './fileValidation.js';
import { checkSuspiciousPatterns } from './contentAnalysis.js';
import { checkUploadLimits, recordUpload } from './rateLimiting.js';
import { quarantineFile, getQuarantineStats } from './quarantine.js';
import { 
  DEFAULT_UPLOAD_CONFIG, 
  EXECUTABLE_EXTENSIONS, 
  SUSPICIOUS_NAME_PATTERNS,
  MAGIC_NUMBERS,
  CONTENT_PATTERNS 
} from './constants.js';

/**
 * Upload Protection Class
 */
export class UploadProtection {
  constructor(options = {}) {
    this.config = {
      ...DEFAULT_UPLOAD_CONFIG,
      ...options,
      executableExtensions: EXECUTABLE_EXTENSIONS,
      suspiciousNames: SUSPICIOUS_NAME_PATTERNS,
      magicNumbers: MAGIC_NUMBERS,
      contentPatterns: CONTENT_PATTERNS
    };

    this.uploadHistory = new Map(); // identifier -> upload history
    this.quarantinedFiles = new Map(); // fileId -> quarantine info
  }

  /**
   * Validate file upload
   * @param {Object} file - File object
   * @param {string} identifier - IP address or user ID
   * @returns {Object} - Validation result
   */
  async validateFileUpload(file, identifier) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      riskLevel: 'low',
      shouldQuarantine: false,
      sanitizedFileName: null
    };

    if (!file) {
      validation.isValid = false;
      validation.errors.push('No file provided');
      return validation;
    }

    // Basic file validation
    const basicValidation = validateFileUpload(file, this.config);
    if (!basicValidation.isValid) {
      validation.isValid = false;
      validation.errors.push(...basicValidation.errors);
      validation.riskLevel = basicValidation.riskLevel;
      validation.sanitizedFileName = basicValidation.sanitizedFileName;
    }

    // Check upload limits
    const limitValidation = checkUploadLimits(identifier, this.config, this.uploadHistory);
    if (!limitValidation.allowed) {
      validation.isValid = false;
      validation.errors.push(...limitValidation.errors);
      validation.riskLevel = 'medium';
    }

    // Check for suspicious patterns
    if (validation.isValid) {
      const suspiciousCheck = await checkSuspiciousPatterns(file, this.config);
      if (suspiciousCheck.isSuspicious) {
        validation.warnings.push(...suspiciousCheck.warnings);
        if (suspiciousCheck.riskLevel === 'high') {
          validation.isValid = false;
          validation.errors.push(...suspiciousCheck.errors);
          validation.riskLevel = 'high';
          validation.shouldQuarantine = true;
        } else if (suspiciousCheck.riskLevel === 'medium') {
          validation.riskLevel = 'medium';
          validation.shouldQuarantine = this.config.quarantineSuspicious;
        }
      }
    }

    return validation;
  }

  /**
   * Record successful upload
   * @param {string} identifier - IP address or user ID
   */
  recordUpload(identifier) {
    recordUpload(identifier, this.uploadHistory);
  }

  /**
   * Quarantine suspicious file
   * @param {string} fileId - File ID
   * @param {Object} file - File object
   * @param {string} reason - Quarantine reason
   */
  quarantineFile(fileId, file, reason) {
    quarantineFile(fileId, file, reason, this.quarantinedFiles);
  }

  /**
   * Get quarantine statistics
   * @returns {Object} - Quarantine statistics
   */
  getQuarantineStats() {
    return getQuarantineStats(this.quarantinedFiles);
  }

  /**
   * Clear quarantine (for testing or maintenance)
   */
  clearQuarantine() {
    this.quarantinedFiles.clear();
  }

  /**
   * Clear upload history (for testing or maintenance)
   */
  clearUploadHistory() {
    this.uploadHistory.clear();
  }

  /**
   * Get upload statistics
   * @param {string} identifier - IP address or user ID (optional)
   * @returns {Object} - Upload statistics
   */
  getUploadStats(identifier = null) {
    if (identifier) {
      return this.uploadHistory.get(identifier) || {
        hourly: 0,
        daily: 0,
        total: 0
      };
    }

    // Global statistics
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    let totalUploads = 0;
    let activeUsers = 0;

    this.uploadHistory.forEach((history, id) => {
      const recentUploads = history.daily.filter(timestamp => timestamp > oneDayAgo);
      totalUploads += recentUploads.length;
      if (recentUploads.length > 0) {
        activeUsers++;
      }
    });

    return {
      totalUploads,
      activeUsers,
      totalUsers: this.uploadHistory.size,
      quarantinedFiles: this.quarantinedFiles.size
    };
  }
}

// Default export
export default UploadProtection;
