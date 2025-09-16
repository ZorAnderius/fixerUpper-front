import { sanitizeHtml } from '../sanitizeHtml.js';

describe('sanitizeHtml', () => {
  test('should remove dangerous script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>Hello</p>');
    expect(result).toContain('<p>World</p>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert("xss")');
  });

  test('should remove forbidden tags', () => {
    const input = '<p>Hello</p><iframe src="evil.com"></iframe><object data="bad.exe"></object>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>Hello</p>');
    expect(result).not.toContain('<iframe>');
    expect(result).not.toContain('<object>');
  });

  test('should remove dangerous event handlers', () => {
    const input = '<img src="image.jpg" onerror="alert(\'xss\')" onclick="malicious()">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('alert');
  });

  test('should preserve safe HTML', () => {
    const input = '<p>Hello <strong>World</strong> with <em>emphasis</em></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
    expect(result).toContain('Hello <strong>World</strong> with <em>emphasis</em>');
  });

  test('should handle empty string', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  test('should handle non-string input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml(123)).toBe('');
  });

  test('should handle complex XSS attempts', () => {
    const input = '<img src="x" onerror="alert(1)"><svg onload="alert(2)"><iframe src="javascript:alert(3)"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('onload');
    expect(result).not.toContain('<iframe>');
    expect(result).not.toContain('javascript:');
  });

  test('should preserve safe attributes', () => {
    const input = '<a href="https://example.com" title="Safe link">Click me</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('title="Safe link"');
  });

  test('should handle unicode content', () => {
    const input = '<p>Hello 世界 🌍</p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('Hello 世界 🌍');
  });

  test('should handle nested dangerous content', () => {
    const input = '<div><p>Safe</p><script>alert("xss")</script><span>Also safe</span></div>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<div>');
    expect(result).toContain('<p>Safe</p>');
    expect(result).toContain('<span>Also safe</span>');
    expect(result).not.toContain('<script>');
  });
});
