import { sanitizeInput } from '../sanitizeInput.js';

describe('sanitizeInput', () => {
  test('should remove script tags and dangerous content', () => {
    const input = 'Hello <script>alert("xss")</script> World';
    const expected = 'Hello World';
    expect(sanitizeInput(input)).toBe(expected);
  });

  test('should remove javascript: protocol', () => {
    const input = 'Click javascript:alert("xss") here';
    const expected = 'Click here';
    expect(sanitizeInput(input)).toBe(expected);
  });

  test('should remove event handlers', () => {
    const input = 'Button onclick=alert("xss") text';
    const expected = 'Button text';
    expect(sanitizeInput(input)).toBe(expected);
  });

  test('should remove data: protocol', () => {
    const input = 'Image data:text/html,<script>alert("xss")</script>';
    const expected = 'Image';
    expect(sanitizeInput(input)).toBe(expected);
  });

  test('should remove vbscript: protocol', () => {
    const input = 'Link vbscript:msgbox("xss") here';
    const expected = 'Link here';
    expect(sanitizeInput(input)).toBe(expected);
  });

  test('should trim whitespace and limit length', () => {
    const input = '  Hello World   ';
    expect(sanitizeInput(input, 10)).toBe('Hello Worl');
    expect(sanitizeInput(input, 20)).toBe('Hello World');
  });

  test('should handle custom max length', () => {
    const input = 'This is a long string that should be truncated.';
    expect(sanitizeInput(input, 10)).toBe('This is a');
    expect(sanitizeInput(input, 50)).toBe('This is a long string that should be truncated.');
  });

  test('should handle empty and non-string input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });

  test('should handle various XSS payloads', () => {
    const payloads = [
      '<img src=x onerror=alert(1)>',
      '<body onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      '<svg/onload=alert(1)>',
      '"><script>alert(1)</script>',
      '\'"><img src=x onerror=alert(1)>',
      'Hello <a href="javascript:alert(1)">Click me</a>',
    ];
    
    payloads.forEach(payload => {
      const result = sanitizeInput(payload);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('onload');
      expect(result).not.toContain('data:');
      expect(result).not.toContain('vbscript:');
    });
  });

  test('should handle unicode and special characters', () => {
    const input = 'Hello 世界 🌍 <script>alert("xss")</script>';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello 世界 🌍');
    expect(result).not.toContain('<script>');
  });

  test('should handle very long inputs', () => {
    const longInput = 'a'.repeat(2000) + '<script>alert("xss")</script>';
    const result = sanitizeInput(longInput, 500);
    expect(result.length).toBe(500);
    expect(result).not.toContain('<script>');
  });

  test('should normalize whitespace', () => {
    const input = 'Multiple    spaces   and\ttabs';
    const result = sanitizeInput(input);
    expect(result).toBe('Multiple spaces and tabs');
  });
});
