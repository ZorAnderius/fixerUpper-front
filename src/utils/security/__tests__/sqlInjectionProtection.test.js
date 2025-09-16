import { 
  detectSQLInjection, 
  sanitizeSQLInput, 
  validateSQLInput,
  createSafeInputHandler 
} from '../sqlProtection/index.js';

describe('SQL Injection Protection', () => {
  describe('detectSQLInjection', () => {
    test('should detect safe input', () => {
      const result = detectSQLInjection('Hello World');
      expect(result.isSafe).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(result.riskLevel).toBe('none');
    });

    test('should detect SQL SELECT statement', () => {
      const result = detectSQLInjection("SELECT * FROM users");
      expect(result.isSafe).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect SQL injection with quotes', () => {
      const result = detectSQLInjection("'; DROP TABLE users; --");
      expect(result.isSafe).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect UNION injection', () => {
      const result = detectSQLInjection("1' UNION SELECT password FROM users --");
      expect(result.isSafe).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect time-based injection', () => {
      const result = detectSQLInjection("1'; WAITFOR DELAY '00:00:05' --");
      expect(result.isSafe).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect boolean-based injection', () => {
      const result = detectSQLInjection("1' AND 1=1 --");
      expect(result.isSafe).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect suspicious characters', () => {
      const result = detectSQLInjection("test';--");
      expect(result.isSafe).toBe(false);
      expect(result.threats.some(t => t.type === 'suspicious_chars')).toBe(true);
      expect(result.riskLevel).toBe('medium');
    });

    test('should detect excessive length', () => {
      const longInput = 'a'.repeat(1500);
      const result = detectSQLInjection(longInput);
      expect(result.isSafe).toBe(false);
      expect(result.threats.some(t => t.type === 'excessive_length')).toBe(true);
      expect(result.riskLevel).toBe('low');
    });

    test('should handle empty or null input', () => {
      expect(detectSQLInjection('')).toEqual({
        isSafe: true,
        threats: [],
        riskLevel: 'none'
      });
      
      expect(detectSQLInjection(null)).toEqual({
        isSafe: true,
        threats: [],
        riskLevel: 'none'
      });
    });
  });

  describe('sanitizeSQLInput', () => {
    test('should sanitize safe input', () => {
      const result = sanitizeSQLInput('Hello World');
      expect(result).toBe('Hello World');
    });

    test('should remove SQL keywords', () => {
      const result = sanitizeSQLInput('SELECT * FROM users');
      expect(result).not.toContain('SELECT');
      expect(result).not.toContain('FROM');
    });

    test('should remove quotes', () => {
      const result = sanitizeSQLInput("test'value");
      expect(result).not.toContain("'");
      expect(result).toBe('testvalue');
    });

    test('should remove semicolons', () => {
      const result = sanitizeSQLInput('test;value');
      expect(result).not.toContain(';');
      expect(result).toBe('test value');
    });

    test('should remove SQL comments', () => {
      const result = sanitizeSQLInput('test--comment');
      expect(result).not.toContain('--');
      expect(result).toBe('test');
    });

    test('should remove block comments', () => {
      const result = sanitizeSQLInput('test/*comment*/value');
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
      expect(result).toBe('test value');
    });

    test('should clean up multiple spaces', () => {
      const result = sanitizeSQLInput('test   value');
      expect(result).toBe('test value');
    });

    test('should handle empty input', () => {
      expect(sanitizeSQLInput('')).toBe('');
      expect(sanitizeSQLInput(null)).toBe('');
    });
  });

  describe('validateSQLInput', () => {
    test('should validate safe input', () => {
      const result = validateSQLInput('Hello World');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate with length limit', () => {
      const longInput = 'a'.repeat(300);
      const result = validateSQLInput(longInput, { maxLength: 255 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input exceeds maximum length of 255 characters');
    });

    test('should validate in strict mode', () => {
      const result = validateSQLInput("test'value", { strictMode: true });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate in non-strict mode', () => {
      const result = validateSQLInput("test'value", { strictMode: false });
      expect(result.isValid).toBe(true);
    });

    test('should validate with special characters allowed', () => {
      const result = validateSQLInput("test'value", { allowSpecialChars: true });
      expect(result.isValid).toBe(true);
    });

    test('should validate with special characters not allowed', () => {
      const result = validateSQLInput("test'value", { allowSpecialChars: false });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains special characters that may be unsafe');
    });
  });

  describe('createSafeInputHandler', () => {
    test('should create safe input handler', () => {
      const originalHandler = jest.fn();
      const safeHandler = createSafeInputHandler(originalHandler);
      
      expect(typeof safeHandler).toBe('function');
    });

    test('should call original handler with sanitized input', () => {
      const originalHandler = jest.fn();
      const safeHandler = createSafeInputHandler(originalHandler, { sanitize: true });
      
      safeHandler("test'value");
      
      expect(originalHandler).toHaveBeenCalledWith('testvalue');
    });

    test('should call original handler with original input when sanitize is false', () => {
      const originalHandler = jest.fn();
      const safeHandler = createSafeInputHandler(originalHandler, { sanitize: false });
      
      safeHandler("test'value");
      
      expect(originalHandler).toHaveBeenCalledWith("test'value");
    });

    test('should call threat handler when threats detected', () => {
      const originalHandler = jest.fn();
      const onThreat = jest.fn();
      const safeHandler = createSafeInputHandler(originalHandler, { onThreat });
      
      safeHandler("SELECT * FROM users");
      
      expect(onThreat).toHaveBeenCalled();
    });

    test('should log threats when enabled', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const originalHandler = jest.fn();
      const safeHandler = createSafeInputHandler(originalHandler, { logThreats: true });
      
      safeHandler("SELECT * FROM users");
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
