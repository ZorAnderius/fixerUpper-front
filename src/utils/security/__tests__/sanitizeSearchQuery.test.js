import { sanitizeSearchQuery } from '../sanitizeSearchQuery.js';

describe('sanitizeSearchQuery', () => {
  test('should remove special characters', () => {
    const input = 'search query with @#$%^&*() special chars';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search query with special chars');
  });

  test('should normalize whitespace', () => {
    const input = 'search    query   with    spaces';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search query with spaces');
  });

  test('should remove dangerous protocols', () => {
    const input = 'search javascript:alert("xss") term';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search term');
  });

  test('should remove script tags', () => {
    const input = 'search <script>alert("xss")</script> term';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search term');
  });

  test('should preserve alphanumeric characters, hyphens, apostrophes, and dots', () => {
    const input = 'search-term with apostrophe\'s and dots.';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search-term with apostrophe\'s and dots.');
  });

  test('should handle empty string', () => {
    expect(sanitizeSearchQuery('')).toBe('');
  });

  test('should handle non-string input', () => {
    expect(sanitizeSearchQuery(null)).toBe('');
    expect(sanitizeSearchQuery(undefined)).toBe('');
    expect(sanitizeSearchQuery(123)).toBe('');
  });

  test('should respect max length', () => {
    const input = 'a'.repeat(150);
    const result = sanitizeSearchQuery(input);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  test('should remove javascript protocol', () => {
    const input = 'search javascript:alert("xss") term';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search term');
  });

  test('should handle unicode characters', () => {
    const input = 'test 世界 query';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('test query');
  });

  test('should handle mixed case', () => {
    const input = 'Test Query With Mixed Case';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('Test Query With Mixed Case');
  });

  test('should remove event handlers', () => {
    const input = 'search onclick=alert("xss") term';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search term');
  });

  test('should remove data: protocol', () => {
    const input = 'search data:text/html,<script>alert("xss")</script> term';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search term');
  });

  test('should handle very long inputs', () => {
    const longInput = 'a'.repeat(2000) + '<script>alert("xss")</script>';
    const result = sanitizeSearchQuery(longInput);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result).not.toContain('<script>');
  });

  test('should trim whitespace', () => {
    const input = '  search query  ';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search query');
  });

  test('should handle multiple dangerous patterns', () => {
    const input = 'search <script>alert("xss")</script> javascript:alert("xss") data:text/html,<script>alert("xss")</script> term';
    const result = sanitizeSearchQuery(input);
    expect(result).toBe('search');
  });
});
