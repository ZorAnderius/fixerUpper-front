import { sanitizeProductData } from '../sanitizeProductData.js';

describe('sanitizeProductData', () => {
  test('should sanitize product title and description', () => {
    const productData = {
      title: 'Test <script>alert("xss")</script> Product',
      description: 'Description with <img src="x" onerror="alert(\'xss\')"> dangerous content.',
      price: 100,
      quantity: 5,
      category_id: 'cat-123',
      status_id: 'status-456',
    };
    const result = sanitizeProductData(productData);
    expect(result.title).toBe('Test Product');
    expect(result.description).toBe('Description with dangerous content.');
    expect(result.price).toBe(100);
    expect(result.quantity).toBe(5);
    expect(result.category_id).toBe('cat-123');
    expect(result.status_id).toBe('status-456');
  });

  test('should handle empty object', () => {
    const result = sanitizeProductData({});
    expect(result.title).toBe('');
    expect(result.description).toBe('');
    expect(Object.keys(result)).toEqual(['title', 'description']);
  });

  test('should handle null/undefined input', () => {
    expect(sanitizeProductData(null)).toEqual({});
    expect(sanitizeProductData(undefined)).toEqual({});
  });

  test('should preserve non-string fields', () => {
    const productData = {
      title: 'Valid Title',
      description: 'Valid Description',
      price: 99.99,
      quantity: 10,
      category_id: 'uuid-123',
      status_id: 'uuid-456',
      image_url: 'https://example.com/image.jpg',
    };
    const result = sanitizeProductData(productData);
    expect(result.title).toBe('Valid Title');
    expect(result.description).toBe('Valid Description');
    expect(result.price).toBe(99.99);
    expect(result.quantity).toBe(10);
    expect(result.category_id).toBe('uuid-123');
    expect(result.status_id).toBe('uuid-456');
    expect(result.image_url).toBe('https://example.com/image.jpg');
  });

  test('should handle missing optional fields', () => {
    const productData = {
      title: 'Only Title',
      description: 'Only Description'
    };
    const result = sanitizeProductData(productData);
    expect(result.title).toBe('Only Title');
    expect(result.description).toBe('Only Description');
    expect(result.price).toBeUndefined();
    expect(result.quantity).toBeUndefined();
  });

  test('should filter out invalid field types', () => {
    const productData = {
      title: 'Valid Title',
      description: 'Valid Description',
      price: 'invalid-price', // Should be filtered out (not a number)
      quantity: 'invalid-qty', // Should be filtered out (not a number)
      category_id: 123, // Should be filtered out (not a string)
      status_id: 456, // Should be filtered out (not a string)
      image_url: 789 // Should be filtered out (not a string)
    };
    const result = sanitizeProductData(productData);
    expect(result.title).toBe('Valid Title');
    expect(result.description).toBe('Valid Description');
    expect(result.price).toBeUndefined();
    expect(result.quantity).toBeUndefined();
    expect(result.category_id).toBeUndefined();
    expect(result.status_id).toBeUndefined();
    expect(result.image_url).toBeUndefined();
  });

  test('should handle dangerous content in strings', () => {
    const productData = {
      title: 'Product<script>alert("xss")</script>',
      description: 'Description with javascript:alert("xss") and data:text/html,<script>alert("xss")</script>',
      price: 50,
      quantity: 1
    };
    const result = sanitizeProductData(productData);
    expect(result.title).toBe('Product');
    expect(result.description).toBe('Description with and');
    expect(result.price).toBe(50);
    expect(result.quantity).toBe(1);
  });

  test('should handle zero values', () => {
    const productData = {
      title: 'Free Product',
      description: 'Free product description',
      price: 0,
      quantity: 0
    };
    const result = sanitizeProductData(productData);
    expect(result.price).toBe(0);
    expect(result.quantity).toBe(0);
  });

  test('should handle negative values', () => {
    const productData = {
      title: 'Product with negative price',
      description: 'Product description',
      price: -10,
      quantity: -5
    };
    const result = sanitizeProductData(productData);
    expect(result.price).toBe(-10);
    expect(result.quantity).toBe(-5);
  });
});
