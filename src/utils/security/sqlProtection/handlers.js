/**
 * SQL Injection Protection Handlers Module
 * Handles creation of safe input handlers and form protection
 */

import { detectSQLInjection } from './detection.js';
import { sanitizeSQLInput } from './sanitization.js';
import { validateSQLInput } from './validation.js';

/**
 * Create a safe input handler that prevents SQL injection
 * @param {Function} originalHandler - Original input handler
 * @param {Object} options - Protection options
 * @returns {Function} - Protected input handler
 */
export const createSafeInputHandler = (originalHandler, options = {}) => {
  const {
    sanitize = true,
    validate = true,
    onThreat = () => {},
    logThreats = false,
    strictMode = false
  } = options;

  return (value, ...args) => {
    if (!value || typeof value !== 'string') {
      return originalHandler(value, ...args);
    }

    // Detect threats
    const detection = detectSQLInjection(value);
    
    // Log threats if enabled
    if (logThreats && detection.threats.length > 0) {
      console.warn('SQL injection threat detected:', {
        input: value,
        threats: detection.threats,
        riskLevel: detection.riskLevel
      });
    }

    // Call threat handler
    if (detection.threats.length > 0) {
      onThreat(detection);
    }

    // Validate if enabled
    if (validate) {
      const validation = validateSQLInput(value, { strictMode });
      if (!validation.isValid) {
        console.warn('Input validation failed:', validation.errors);
        return originalHandler(validation.sanitizedInput, ...args);
      }
    }

    // Sanitize if enabled
    const processedValue = sanitize ? detection.sanitizedInput || sanitizeSQLInput(value) : value;

    return originalHandler(processedValue, ...args);
  };
};

/**
 * Create a protected form submission handler
 * @param {Function} originalHandler - Original form handler
 * @param {Object} options - Protection options
 * @returns {Function} - Protected form handler
 */
export const createProtectedFormHandler = (originalHandler, options = {}) => {
  const {
    sanitize = true,
    validate = true,
    blockSubmission = true,
    onThreatDetected = () => {}
  } = options;

  return (event) => {
    event.preventDefault();
    
    // Collect form data
    const formData = new FormData(event.target);
    const inputs = {};
    
    for (const [key, value] of formData.entries()) {
      inputs[key] = value;
    }

    // Validate all inputs
    const validation = validateMultipleInputs(inputs, { strictMode: true });
    
    if (validation.hasThreats) {
      console.warn('Form submission blocked due to SQL injection threats');
      
      // Call threat handler
      onThreatDetected(validation);
      
      if (blockSubmission) {
        return; // Block form submission
      }
    }

    // Sanitize inputs if enabled
    if (sanitize) {
      Object.keys(inputs).forEach(key => {
        inputs[key] = sanitizeSQLInput(inputs[key]);
      });
    }

    // Call original handler if safe
    if (originalHandler) {
      originalHandler(event, inputs, validation);
    }
  };
};

/**
 * Create a protected input change handler
 * @param {Function} originalHandler - Original change handler
 * @param {Object} options - Protection options
 * @returns {Function} - Protected change handler
 */
export const createProtectedChangeHandler = (originalHandler, options = {}) => {
  const {
    sanitize = true,
    validate = false,
    onThreat = () => {}
  } = options;

  return (event) => {
    const value = event.target ? event.target.value : event;
    const protection = detectSQLInjection(value);
    
    // Handle threats
    if (protection.threats.length > 0) {
      onThreat(protection);
    }

    // Sanitize value if needed
    if (sanitize && !protection.isSafe) {
      const sanitizedValue = protection.sanitizedInput || sanitizeSQLInput(value);
      
      // Update the input value
      if (event.target) {
        event.target.value = sanitizedValue;
      }
    }

    // Validate if enabled
    if (validate) {
      const validation = validateSQLInput(value);
      if (!validation.isValid) {
        console.warn('Input validation failed:', validation.errors);
      }
    }
    
    // Call original handler
    if (originalHandler) {
      originalHandler(event);
    }
  };
};

/**
 * Create a protected value setter for controlled inputs
 * @param {Function} originalSetter - Original value setter
 * @param {Object} options - Protection options
 * @returns {Function} - Protected value setter
 */
export const createProtectedSetter = (originalSetter, options = {}) => {
  const {
    sanitize = true,
    validate = false,
    onThreat = () => {}
  } = options;

  return (value) => {
    if (!value || typeof value !== 'string') {
      return originalSetter(value);
    }

    const protection = detectSQLInjection(value);
    
    // Handle threats
    if (protection.threats.length > 0) {
      onThreat(protection);
    }

    // Determine final value
    let finalValue = value;
    
    if (sanitize && !protection.isSafe) {
      finalValue = protection.sanitizedInput || sanitizeSQLInput(value);
    }

    // Validate if enabled
    if (validate) {
      const validation = validateSQLInput(finalValue);
      if (!validation.isValid) {
        console.warn('Input validation failed:', validation.errors);
        finalValue = validation.sanitizedInput;
      }
    }

    originalSetter(finalValue);
  };
};

/**
 * Create a batch input processor
 * @param {Object} options - Processing options
 * @returns {Function} - Batch processor function
 */
export const createBatchProcessor = (options = {}) => {
  const {
    sanitize = true,
    validate = true,
    strictMode = false
  } = options;

  return (inputs) => {
    const results = {};
    const threats = [];
    const errors = [];

    Object.entries(inputs).forEach(([key, value]) => {
      // Detect threats
      const detection = detectSQLInjection(value);
      
      if (detection.threats.length > 0) {
        threats.push({ key, ...detection });
      }

      // Validate if enabled
      let validation = { isValid: true, errors: [] };
      if (validate) {
        validation = validateSQLInput(value, { strictMode });
        if (!validation.isValid) {
          errors.push({ key, errors: validation.errors });
        }
      }

      // Sanitize if enabled
      let processedValue = value;
      if (sanitize && (!detection.isSafe || !validation.isValid)) {
        processedValue = detection.sanitizedInput || sanitizeSQLInput(value);
      }

      results[key] = {
        originalValue: value,
        processedValue,
        isSafe: detection.isSafe && validation.isValid,
        threats: detection.threats,
        riskLevel: detection.riskLevel,
        validationErrors: validation.errors
      };
    });

    return {
      results,
      hasThreats: threats.length > 0,
      threats,
      errors,
      overallRiskLevel: threats.length > 0 ? 'high' : 'none'
    };
  };
};

// Helper function for multiple input validation
function validateMultipleInputs(inputs, options) {
  const results = {};
  let hasThreats = false;

  Object.entries(inputs).forEach(([key, value]) => {
    const validation = validateSQLInput(value, options);
    results[key] = validation;
    
    if (!validation.isValid) {
      hasThreats = true;
    }
  });

  return {
    results,
    hasThreats
  };
}
