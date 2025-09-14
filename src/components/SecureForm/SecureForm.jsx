import { useState, useCallback } from 'react';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '../../helpers/security/sanitize';
import { validatePasswordStrength } from '../../helpers/security/validation';
import styles from './SecureForm.module.css';

const SecureForm = ({ 
  children, 
  onSubmit, 
  maxAttempts = 5,
  lockoutDuration = 300000, // 5 minutes
  className = '',
  ...props 
}) => {
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState(null);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    // Check if form is locked
    if (isLocked) {
      const now = Date.now();
      if (now < lockoutEnd) {
        const remainingTime = Math.ceil((lockoutEnd - now) / 1000);
        alert(`Form is locked. Please try again in ${remainingTime} seconds.`);
        return;
      } else {
        // Lockout expired, reset
        setIsLocked(false);
        setAttempts(0);
        setLockoutEnd(null);
      }
    }

    // Check attempt limit
    if (attempts >= maxAttempts) {
      setIsLocked(true);
      setLockoutEnd(Date.now() + lockoutDuration);
      alert('Too many failed attempts. Form is temporarily locked.');
      return;
    }

    try {
      // Sanitize form data
      const formData = new FormData(event.target);
      const sanitizedData = {};
      
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          switch (key) {
            case 'email':
              sanitizedData[key] = sanitizeEmail(value);
              break;
            case 'phoneNumber':
            case 'phone':
              sanitizedData[key] = sanitizePhone(value);
              break;
            case 'password':
              // Don't sanitize password, just validate
              sanitizedData[key] = value;
              break;
            default:
              sanitizedData[key] = sanitizeInput(value);
          }
        } else {
          sanitizedData[key] = value;
        }
      }

      // Validate password if present
      if (sanitizedData.password) {
        const passwordValidation = validatePasswordStrength(sanitizedData.password);
        if (!passwordValidation.isValid) {
          setAttempts(prev => prev + 1);
          alert(`Password validation failed: ${passwordValidation.feedback.join(', ')}`);
          return;
        }
      }

      // Call original onSubmit with sanitized data
      await onSubmit(sanitizedData, event);
      
      // Reset attempts on successful submission
      setAttempts(0);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setAttempts(prev => prev + 1);
      
      // Generic error message to prevent information leakage
      alert('An error occurred. Please try again.');
    }
  }, [attempts, isLocked, lockoutEnd, maxAttempts, lockoutDuration, onSubmit]);

  return (
    <form 
      className={`${styles.secureForm} ${className}`}
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
      
      {/* Security indicator */}
      {attempts > 0 && (
        <div className={styles.securityWarning}>
          Failed attempts: {attempts}/{maxAttempts}
          {isLocked && (
            <div className={styles.lockoutMessage}>
              Form is locked. Please wait before trying again.
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default SecureForm;









