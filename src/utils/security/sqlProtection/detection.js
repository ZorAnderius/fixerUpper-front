/**
 * SQL Injection Detection Module
 * Handles detection of potential SQL injection threats
 */

// Common SQL injection patterns to detect
export const SQL_INJECTION_PATTERNS = [
  // Basic SQL keywords
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi,
  
  // SQL operators and functions
  /\b(OR|AND|WHERE|FROM|INTO|VALUES|SET|TABLE|DATABASE|SCHEMA)\b/gi,
  
  // SQL functions
  /\b(CONCAT|SUBSTRING|LENGTH|CHAR|ASCII|HEX|UNHEX|MD5|SHA1)\b/gi,
  
  // SQL comments and string termination
  /(--|\/\*|\*\/|;|'|"|`)/g,
  
  // SQL wildcards
  /(%|\*|\?)/g,
  
  // SQL comparison operators
  /(=|!=|<>|<|>|<=|>=|LIKE|IN|BETWEEN|IS|NULL)/gi,
  
  // SQL injection attempts
  /(UNION.*SELECT|SELECT.*FROM|INSERT.*INTO|UPDATE.*SET|DELETE.*FROM)/gi,
  
  // Time-based injection patterns
  /(SLEEP|WAITFOR|DELAY|BENCHMARK)/gi,
  
  // Boolean-based injection patterns
  /(AND\s+\d+\s*=\s*\d+|OR\s+\d+\s*=\s*\d+)/gi,
  
  // Stacked queries
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)/gi,
  
  // Comment-based injection
  /\/\*.*\*\//g,
  
  // Hex encoding attempts
  /0x[0-9a-fA-F]+/g,
  
  // URL encoding attempts
  /%27|%22|%3B|%2D%2D/gi
];

// Characters that should be escaped in SQL contexts
export const SQL_SPECIAL_CHARS = [
  "'", '"', '`', ';', '--', '/*', '*/', '\\', '\0', '\n', '\r', '\t'
];

/**
 * Detect potential SQL injection attempts in input
 * @param {string} input - The input string to check
 * @returns {Object} - Detection result with details
 */
export const detectSQLInjection = (input) => {
  if (!input || typeof input !== 'string') {
    return {
      isSafe: true,
      threats: [],
      riskLevel: 'none'
    };
  }

  const threats = [];
  const inputUpper = input.toUpperCase();

  // Check against known SQL injection patterns
  SQL_INJECTION_PATTERNS.forEach((pattern, index) => {
    const matches = input.match(pattern);
    if (matches) {
      matches.forEach(match => {
        threats.push({
          type: 'sql_pattern',
          pattern: match,
          severity: getSeverityLevel(match, index),
          description: getThreatDescription(match, index)
        });
      });
    }
  });

  // Check for suspicious character sequences
  const suspiciousChars = input.split('').filter(char => 
    SQL_SPECIAL_CHARS.includes(char)
  );
  
  if (suspiciousChars.length > 2) {
    threats.push({
      type: 'suspicious_chars',
      pattern: suspiciousChars.join(''),
      severity: 'medium',
      description: 'Multiple SQL special characters detected'
    });
  }

  // Check for excessive length (potential buffer overflow)
  if (input.length > 1000) {
    threats.push({
      type: 'excessive_length',
      pattern: `Length: ${input.length}`,
      severity: 'low',
      description: 'Input length exceeds normal limits'
    });
  }

  // Determine overall risk level
  const riskLevel = calculateRiskLevel(threats);

  return {
    isSafe: threats.length === 0 || riskLevel === 'low',
    threats,
    riskLevel,
    inputLength: input.length
  };
};

// Helper functions
function getSeverityLevel(match, patternIndex) {
  const highSeverityPatterns = [0, 1, 6, 7, 8]; // Basic SQL keywords, injection attempts
  const mediumSeverityPatterns = [2, 3, 4, 5]; // Functions, comments, wildcards
  const lowSeverityPatterns = [9, 10, 11, 12]; // Less critical patterns

  if (highSeverityPatterns.includes(patternIndex)) return 'high';
  if (mediumSeverityPatterns.includes(patternIndex)) return 'medium';
  if (lowSeverityPatterns.includes(patternIndex)) return 'low';
  return 'medium';
}

function getThreatDescription(match, patternIndex) {
  const descriptions = {
    0: 'SQL keyword detected',
    1: 'SQL keyword detected',
    2: 'SQL function detected',
    3: 'SQL comment or string termination',
    4: 'SQL wildcard detected',
    5: 'SQL comparison operator detected',
    6: 'Potential SQL injection attempt',
    7: 'Time-based injection pattern',
    8: 'Boolean-based injection pattern',
    9: 'Stacked query detected',
    10: 'Comment-based injection',
    11: 'Hex encoding attempt',
    12: 'URL encoding attempt'
  };
  
  return descriptions[patternIndex] || 'Unknown SQL pattern detected';
}

function calculateRiskLevel(threats) {
  if (threats.length === 0) return 'none';
  
  const hasHighSeverity = threats.some(t => t.severity === 'high');
  const hasMediumSeverity = threats.some(t => t.severity === 'medium');
  
  if (hasHighSeverity) return 'high';
  if (hasMediumSeverity) return 'medium';
  return 'low';
}
