/**
 * Content Analysis Module
 * Analyzes file content for malicious patterns
 */

/**
 * Check for suspicious patterns in file
 * @param {Object} file - File object
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} - Suspicious pattern check result
 */
export const checkSuspiciousPatterns = async (file, config) => {
  const result = {
    isSuspicious: false,
    riskLevel: 'low',
    warnings: [],
    errors: []
  };

  // Check file content for suspicious patterns
  if (file.type.startsWith('text/') || file.type === 'application/javascript') {
    try {
      const content = await readFileContent(file);
      
      for (const pattern of config.contentPatterns || []) {
        if (pattern.test(content)) {
          result.isSuspicious = true;
          result.riskLevel = 'high';
          result.errors.push('File contains suspicious content patterns');
          break;
        }
      }
    } catch (error) {
      result.warnings.push('Could not read file content for analysis');
    }
  }

  // Check magic numbers
  const magicNumberCheck = await checkMagicNumbers(file, config);
  if (!magicNumberCheck.matches) {
    result.isSuspicious = true;
    result.riskLevel = 'medium';
    result.warnings.push('File magic numbers do not match declared type');
  }

  return result;
};

/**
 * Read file content
 * @param {Object} file - File object
 * @returns {Promise<string>} - File content
 */
export const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Check file magic numbers
 * @param {Object} file - File object
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} - Magic number check result
 */
export const checkMagicNumbers = async (file, config) => {
  const result = {
    matches: true,
    expectedType: file.type
  };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer.slice(0, 10));
    
    for (const [mimeType, magicNumbers] of Object.entries(config.magicNumbers || {})) {
      if (arrayStartsWith(bytes, magicNumbers)) {
        if (mimeType !== file.type) {
          result.matches = false;
          result.expectedType = mimeType;
        }
        break;
      }
    }
  } catch (error) {
    result.matches = false;
  }

  return result;
};

/**
 * Check if array starts with specific bytes
 * @param {Uint8Array} array - Byte array
 * @param {Array} prefix - Prefix bytes
 * @returns {boolean} - Starts with prefix
 */
export const arrayStartsWith = (array, prefix) => {
  if (array.length < prefix.length) return false;
  
  for (let i = 0; i < prefix.length; i++) {
    if (array[i] !== prefix[i]) return false;
  }
  
  return true;
};
