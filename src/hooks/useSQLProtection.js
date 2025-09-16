import { useCallback, useRef } from 'react';
import { detectSQLInjection, sanitizeSQLInput, validateSQLInput } from '../utils/security/sqlProtection';

/**
 * Custom hook for SQL injection protection
 * Can be easily integrated into existing forms without breaking functionality
 */
export const useSQLProtection = (options = {}) => {
  const {
    sanitize = true,
    validate = true,
    strictMode = false,
    maxLength = 255,
    onThreatDetected = null,
    logThreats = false
  } = options;

  const threatHistory = useRef([]);

  /**
   * Protect input value from SQL injection
   * @param {string} value - Input value to protect
   * @returns {Object} - Protection result
   */
  const protectInput = useCallback((value) => {
    if (!value || typeof value !== 'string') {
      return {
        originalValue: value,
        protectedValue: value,
        isSafe: true,
        threats: [],
        riskLevel: 'none'
      };
    }

    // Detect SQL injection threats
    const detection = detectSQLInjection(value);
    
    // Log threats if enabled
    if (logThreats && detection.threats.length > 0) {
      console.warn('SQL injection threat detected:', {
        input: value,
        threats: detection.threats,
        riskLevel: detection.riskLevel
      });
      
      // Store in threat history
      threatHistory.current.push({
        timestamp: Date.now(),
        input: value,
        threats: detection.threats,
        riskLevel: detection.riskLevel
      });
    }

    // Call threat handler if provided
    if (detection.threats.length > 0 && onThreatDetected) {
      onThreatDetected(detection);
    }

    // Validate input if enabled
    let validationResult = { isValid: true, errors: [] };
    if (validate) {
      validationResult = validateSQLInput(value, {
        allowSpecialChars: !strictMode,
        maxLength,
        strictMode
      });
    }

    // Get protected value
    const protectedValue = sanitize ? detection.sanitizedInput : value;

    return {
      originalValue: value,
      protectedValue,
      isSafe: detection.isSafe && validationResult.isValid,
      threats: detection.threats,
      riskLevel: detection.riskLevel,
      validationErrors: validationResult.errors,
      inputLength: value.length,
      sanitizedLength: protectedValue.length
    };
  }, [sanitize, validate, strictMode, maxLength, onThreatDetected, logThreats]);

  /**
   * Create a protected onChange handler for form inputs
   * @param {Function} originalHandler - Original onChange handler
   * @returns {Function} - Protected onChange handler
   */
  const createProtectedHandler = useCallback((originalHandler) => {
    return (event) => {
      const value = event.target ? event.target.value : event;
      const protection = protectInput(value);
      
      // Use protected value if threats detected
      if (!protection.isSafe && sanitize) {
        event.target.value = protection.protectedValue;
      }
      
      // Call original handler with event (modified if needed)
      originalHandler(event);
    };
  }, [protectInput, sanitize]);

  /**
   * Create a protected value setter for controlled inputs
   * @param {Function} originalSetter - Original value setter
   * @returns {Function} - Protected value setter
   */
  const createProtectedSetter = useCallback((originalSetter) => {
    return (value) => {
      const protection = protectInput(value);
      const finalValue = protection.isSafe ? protection.originalValue : protection.protectedValue;
      originalSetter(finalValue);
    };
  }, [protectInput]);

  /**
   * Validate multiple inputs at once
   * @param {Object} inputs - Object with input values
   * @returns {Object} - Validation results
   */
  const validateInputs = useCallback((inputs) => {
    const results = {};
    let hasThreats = false;

    Object.entries(inputs).forEach(([key, value]) => {
      const protection = protectInput(value);
      results[key] = protection;
      if (!protection.isSafe) {
        hasThreats = true;
      }
    });

    return {
      results,
      hasThreats,
      overallRiskLevel: hasThreats ? 'high' : 'none'
    };
  }, [protectInput]);

  /**
   * Get threat statistics
   * @returns {Object} - Threat statistics
   */
  const getThreatStats = useCallback(() => {
    const threats = threatHistory.current;
    const now = Date.now();
    const last24Hours = threats.filter(t => now - t.timestamp < 24 * 60 * 60 * 1000);

    return {
      totalThreats: threats.length,
      threatsLast24Hours: last24Hours.length,
      riskLevels: {
        high: threats.filter(t => t.riskLevel === 'high').length,
        medium: threats.filter(t => t.riskLevel === 'medium').length,
        low: threats.filter(t => t.riskLevel === 'low').length
      },
      recentThreats: last24Hours.slice(-5) // Last 5 threats
    };
  }, []);

  /**
   * Clear threat history
   */
  const clearThreatHistory = useCallback(() => {
    threatHistory.current = [];
  }, []);

  return {
    protectInput,
    createProtectedHandler,
    createProtectedSetter,
    validateInputs,
    getThreatStats,
    clearThreatHistory
  };
};

export default useSQLProtection;
