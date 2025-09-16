import { sanitizeUserInput } from '../sanitizeUserInput.js';

describe('sanitizeUserInput', () => {
  test('should sanitize user data', () => {
    const userData = {
      email: 'user<script>alert("xss")</script>@example.com',
      name: 'John <script>alert("xss")</script> Doe',
      password: 'password123'
    };
    const result = sanitizeUserInput(userData);
    expect(result.email).toBe('user@example.com');
    expect(result.name).toBe('John Doe');
    expect(result.password).toBe('password123'); // Password should not be sanitized
  });

  test('should handle missing fields', () => {
    const userData = { email: 'test@example.com' };
    const result = sanitizeUserInput(userData);
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('');
    expect(result.password).toBeUndefined();
  });

  test('should handle empty object', () => {
    const result = sanitizeUserInput({});
    expect(result.email).toBe('');
    expect(result.name).toBe('');
    expect(result.password).toBeUndefined();
  });

  test('should handle null/undefined input', () => {
    expect(sanitizeUserInput(null)).toEqual({});
    expect(sanitizeUserInput(undefined)).toEqual({});
  });

  test('should sanitize phone number if provided', () => {
    const userData = {
      email: 'test@example.com',
      name: 'John Doe',
      phoneNumber: '+1234567890<script>alert("xss")</script>'
    };
    const result = sanitizeUserInput(userData);
    expect(result.phoneNumber).toBe('+1234567890');
  });

  test('should not sanitize password field', () => {
    const userData = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 'my<script>alert("xss")</script>password'
    };
    const result = sanitizeUserInput(userData);
    expect(result.password).toBe('my<script>alert("xss")</script>password');
  });

  test('should handle dangerous content in email and name', () => {
    const userData = {
      email: 'user<script>alert("xss")</script>@example.com',
      name: 'John<script>alert("xss")</script>Doe',
      password: 'password123'
    };
    const result = sanitizeUserInput(userData);
    expect(result.email).toBe('user@example.com');
    expect(result.name).toBe('JohnDoe');
  });

  test('should handle javascript: protocol in email', () => {
    const userData = {
      email: 'javascript:alert("xss")@example.com',
      name: 'John Doe'
    };
    const result = sanitizeUserInput(userData);
    expect(result.email).toBe('');
  });

  test('should handle data: protocol in name', () => {
    const userData = {
      email: 'test@example.com',
      name: 'John data:text/html,<script>alert("xss")</script> Doe'
    };
    const result = sanitizeUserInput(userData);
    expect(result.name).toBe('John Doe');
  });

  test('should filter out invalid field types', () => {
    const userData = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 123, // Should be filtered out (not a string)
      phoneNumber: 456 // Should be filtered out (not a string)
    };
    const result = sanitizeUserInput(userData);
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('John Doe');
    expect(result.password).toBeUndefined();
    expect(result.phoneNumber).toBeUndefined();
  });

  test('should handle empty strings', () => {
    const userData = {
      email: '',
      name: '',
      password: ''
    };
    const result = sanitizeUserInput(userData);
    expect(result.email).toBe('');
    expect(result.name).toBe('');
    expect(result.password).toBe('');
  });

  test('should handle unicode characters', () => {
    const userData = {
      email: 'test@example.com',
      name: 'John 世界 Doe'
    };
    const result = sanitizeUserInput(userData);
    expect(result.name).toBe('John 世界 Doe');
  });
});
