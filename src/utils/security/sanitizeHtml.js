import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content by escaping dangerous characters and removing malicious scripts.
 * @param {string} html - The HTML string to sanitize.
 * @returns {string} The sanitized HTML string with dangerous characters escaped.
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') {
    return '';
  }
  
  // Use DOMPurify to sanitize HTML, which also escapes dangerous characters
  return DOMPurify.sanitize(html, { 
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
};
