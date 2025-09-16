/**
 * File Validation Module
 * Handles basic file validation (size, name, extension, MIME type)
 */

/**
 * Validate file upload
 * @param {Object} file - File object
 * @param {Object} config - Configuration options
 * @returns {Object} - Validation result
 */
export const validateFileUpload = (file, config) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    riskLevel: 'low',
    sanitizedFileName: null
  };

  if (!file) {
    validation.isValid = false;
    validation.errors.push('No file provided');
    return validation;
  }

  // Check file size
  if (file.size > config.maxFileSize) {
    validation.isValid = false;
    validation.errors.push(`File size exceeds limit of ${config.maxFileSize} bytes`);
    validation.riskLevel = 'high';
  }

  // Check file name
  const fileNameValidation = validateFileName(file.name, config);
  if (!fileNameValidation.isValid) {
    validation.isValid = false;
    validation.errors.push(...fileNameValidation.errors);
    validation.riskLevel = 'high';
  } else {
    validation.sanitizedFileName = fileNameValidation.sanitized;
  }

  // Check MIME type
  const mimeValidation = validateMimeType(file.type, config);
  if (!mimeValidation.isValid) {
    validation.isValid = false;
    validation.errors.push(...mimeValidation.errors);
    validation.riskLevel = 'high';
  }

  // Check file extension
  const extensionValidation = validateFileExtension(file.name, config);
  if (!extensionValidation.isValid) {
    validation.isValid = false;
    validation.errors.push(...extensionValidation.errors);
    validation.riskLevel = 'high';
  }

  return validation;
};

/**
 * Validate file name
 * @param {string} fileName - File name
 * @param {Object} config - Configuration options
 * @returns {Object} - Validation result
 */
export const validateFileName = (fileName, config) => {
  const validation = {
    isValid: true,
    errors: [],
    sanitized: fileName
  };

  if (!fileName) {
    validation.isValid = false;
    validation.errors.push('File name is required');
    return validation;
  }

  // Check for suspicious characters
  const suspiciousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (suspiciousChars.test(fileName)) {
    validation.isValid = false;
    validation.errors.push('File name contains suspicious characters');
  }

  // Check for suspicious patterns
  for (const pattern of config.suspiciousNames || []) {
    if (pattern.test(fileName)) {
      validation.isValid = false;
      validation.errors.push('File name matches suspicious pattern');
      break;
    }
  }

  // Check for double extensions
  const parts = fileName.split('.');
  if (parts.length > 2) {
    const lastExtension = '.' + parts[parts.length - 1];
    const secondLastExtension = '.' + parts[parts.length - 2];
    
    if ((config.executableExtensions || []).includes(secondLastExtension) &&
        (config.allowedExtensions || []).includes(lastExtension)) {
      validation.isValid = false;
      validation.errors.push('File has suspicious double extension');
    }
  }

  // Sanitize file name
  validation.sanitized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  return validation;
};

/**
 * Validate MIME type
 * @param {string} mimeType - MIME type
 * @param {Object} config - Configuration options
 * @returns {Object} - Validation result
 */
export const validateMimeType = (mimeType, config) => {
  const validation = {
    isValid: true,
    errors: []
  };

  if (!mimeType) {
    validation.isValid = false;
    validation.errors.push('MIME type is required');
    return validation;
  }

  if (!(config.allowedMimeTypes || []).includes(mimeType)) {
    validation.isValid = false;
    validation.errors.push(`MIME type ${mimeType} is not allowed`);
  }

  return validation;
};

/**
 * Validate file extension
 * @param {string} fileName - File name
 * @param {Object} config - Configuration options
 * @returns {Object} - Validation result
 */
export const validateFileExtension = (fileName, config) => {
  const validation = {
    isValid: true,
    errors: []
  };

  const extension = '.' + fileName.split('.').pop().toLowerCase();
  
  if (!(config.allowedExtensions || []).includes(extension)) {
    validation.isValid = false;
    validation.errors.push(`File extension ${extension} is not allowed`);
  }

  return validation;
};
