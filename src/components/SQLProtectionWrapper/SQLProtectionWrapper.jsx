import React, { createContext, useContext, useCallback } from 'react';
import { useSQLProtection } from '../../hooks/useSQLProtection';
import { validateMultipleInputs } from '../../utils/security/sqlProtection';

/**
 * Context for SQL protection
 */
const SQLProtectionContext = createContext(null);

/**
 * Hook to use SQL protection context
 */
export const useSQLProtectionContext = () => {
  const context = useContext(SQLProtectionContext);
  if (!context) {
    throw new Error('useSQLProtectionContext must be used within SQLProtectionProvider');
  }
  return context;
};

/**
 * SQL Protection Provider Component
 * Wraps components with SQL injection protection
 */
export const SQLProtectionProvider = ({ children, options = {} }) => {
  const sqlProtection = useSQLProtection(options);

  const contextValue = {
    ...sqlProtection,
    // Additional context methods can be added here
  };

  return (
    <SQLProtectionContext.Provider value={contextValue}>
      {children}
    </SQLProtectionContext.Provider>
  );
};

/**
 * Protected Input Component
 * Wrapper for input elements with automatic SQL protection
 */
export const ProtectedInput = ({ 
  children, 
  onInputChange, 
  protectionOptions = {},
  ...props 
}) => {
  const { createProtectedHandler } = useSQLProtection(protectionOptions);

  const handleChange = useCallback((event) => {
    if (onInputChange) {
      const protectedHandler = createProtectedHandler(onInputChange);
      protectedHandler(event);
    }
  }, [onInputChange, createProtectedHandler]);

  // Clone children and add protection
  const protectedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.props.onChange) {
      return React.cloneElement(child, {
        ...child.props,
        onChange: handleChange,
        ...props
      });
    }
    return child;
  });

  return <>{protectedChildren}</>;
};

/**
 * Protected Form Component
 * Wrapper for forms with SQL protection
 */
export const ProtectedForm = ({ 
  children, 
  onSubmit, 
  protectionOptions = {},
  ...props 
}) => {
  const { validateInputs, getThreatStats } = useSQLProtection(protectionOptions);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    
    // Collect form data
    const formData = new FormData(event.target);
    const inputs = {};
    
    for (const [key, value] of formData.entries()) {
      inputs[key] = value;
    }

    // Validate all inputs
    const validation = validateInputs(inputs);
    
    if (validation.hasThreats) {
      console.warn('Form submission blocked due to SQL injection threats');
      
      // You can add custom handling here
      if (protectionOptions.onThreatDetected) {
        protectionOptions.onThreatDetected(validation);
      }
      
      return; // Block form submission
    }

    // Call original submit handler if safe
    if (onSubmit) {
      onSubmit(event, validation);
    }
  }, [onSubmit, validateInputs, protectionOptions]);

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

/**
 * Security Status Component
 * Displays current security status and threat statistics
 */
export const SecurityStatus = ({ className = '', showThreats = false }) => {
  const { getThreatStats } = useSQLProtection();

  const stats = getThreatStats();

  return (
    <div className={`security-status ${className}`}>
      <div className="security-indicator">
        <span className={`status-dot ${stats.totalThreats === 0 ? 'safe' : 'warning'}`}></span>
        <span className="status-text">
          {stats.totalThreats === 0 ? 'Secure' : `${stats.totalThreats} threats detected`}
        </span>
      </div>
      
      {showThreats && stats.totalThreats > 0 && (
        <div className="threat-details">
          <div className="threat-stats">
            <span>High: {stats.riskLevels.high}</span>
            <span>Medium: {stats.riskLevels.medium}</span>
            <span>Low: {stats.riskLevels.low}</span>
          </div>
          
          {stats.recentThreats.length > 0 && (
            <div className="recent-threats">
              <h4>Recent Threats:</h4>
              <ul>
                {stats.recentThreats.map((threat, index) => (
                  <li key={index}>
                    {threat.riskLevel}: {threat.threats.length} patterns detected
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  SQLProtectionProvider,
  ProtectedInput,
  ProtectedForm,
  SecurityStatus,
  useSQLProtectionContext
};
