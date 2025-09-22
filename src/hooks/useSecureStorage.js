import { useState, useEffect, useCallback } from 'react';
import { sanitizeInput } from '../helpers/security/sanitize';

/**
 * Secure localStorage hook with validation and sanitization
 */
export const useSecureStorage = (key, defaultValue = null, options = {}) => {
  const {
    maxSize = 1024 * 1024, // 1MB default
    encrypt = false,
    validate = null
  } = options;

  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      // Validate size
      if (item.length > maxSize) {
        console.warn(`Storage item ${key} exceeds maximum size`);
        return defaultValue;
      }

      // Sanitize the value
      const sanitized = sanitizeInput(item, maxSize);
      
      // Custom validation
      if (validate && !validate(sanitized)) {
        console.warn(`Storage item ${key} failed validation`);
        return defaultValue;
      }

      return JSON.parse(sanitized);
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  });

  const setStorageValue = useCallback((newValue) => {
    try {
      // Sanitize the value
      const sanitizedValue = typeof newValue === 'string' 
        ? sanitizeInput(newValue, maxSize)
        : newValue;

      // Custom validation
      if (validate && !validate(sanitizedValue)) {
        throw new Error('Value failed validation');
      }

      const serializedValue = JSON.stringify(sanitizedValue);
      
      // Check size before storing
      if (serializedValue.length > maxSize) {
        throw new Error('Value exceeds maximum storage size');
      }

      localStorage.setItem(key, serializedValue);
      setValue(sanitizedValue);
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
      throw error;
    }
  }, [key, maxSize, validate]);

  const removeStorageValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage for key ${key}:`, error);
    }
  }, [key, defaultValue]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const sanitized = sanitizeInput(e.newValue, maxSize);
          if (validate && !validate(sanitized)) {
            return;
          }
          setValue(JSON.parse(sanitized));
        } catch (error) {
          console.error(`Error handling storage change for key ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, maxSize, validate]);

  return [value, setStorageValue, removeStorageValue];
};

/**
 * Secure sessionStorage hook
 */
export const useSecureSessionStorage = (key, defaultValue = null, options = {}) => {
  const {
    maxSize = 1024 * 1024,
    validate = null
  } = options;

  const [value, setValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      if (item.length > maxSize) {
        console.warn(`Session storage item ${key} exceeds maximum size`);
        return defaultValue;
      }

      const sanitized = sanitizeInput(item, maxSize);
      
      if (validate && !validate(sanitized)) {
        console.warn(`Session storage item ${key} failed validation`);
        return defaultValue;
      }

      return JSON.parse(sanitized);
    } catch (error) {
      console.error(`Error reading from sessionStorage for key ${key}:`, error);
      return defaultValue;
    }
  });

  const setStorageValue = useCallback((newValue) => {
    try {
      const sanitizedValue = typeof newValue === 'string' 
        ? sanitizeInput(newValue, maxSize)
        : newValue;

      if (validate && !validate(sanitizedValue)) {
        throw new Error('Value failed validation');
      }

      const serializedValue = JSON.stringify(sanitizedValue);
      
      if (serializedValue.length > maxSize) {
        throw new Error('Value exceeds maximum storage size');
      }

      sessionStorage.setItem(key, serializedValue);
      setValue(sanitizedValue);
    } catch (error) {
      console.error(`Error setting sessionStorage for key ${key}:`, error);
      throw error;
    }
  }, [key, maxSize, validate]);

  const removeStorageValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing sessionStorage for key ${key}:`, error);
    }
  }, [key, defaultValue]);

  return [value, setStorageValue, removeStorageValue];
};















