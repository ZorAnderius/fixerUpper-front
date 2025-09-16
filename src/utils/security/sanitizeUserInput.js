import { sanitizeInput } from './sanitizeInput.js';

/**
 * Sanitize user input for authentication forms (login, registration).
 * @param {object} userData - User data object containing email, name, etc.
 * @returns {object} - Sanitized user data object
 */
export const sanitizeUserInput = (userData) => {
  if (!userData || typeof userData !== 'object') {
    return {};
  }

  const sanitized = {
    email: sanitizeInput(userData.email, 255),
    name: sanitizeInput(userData.name, 100),
  };

  // Only add password if it exists (passwords should not be sanitized)
  if (userData.password !== undefined && typeof userData.password === 'string') {
    sanitized.password = userData.password;
  }

  // Add phone number if it exists
  if (userData.phoneNumber !== undefined && typeof userData.phoneNumber === 'string') {
    sanitized.phoneNumber = sanitizeInput(userData.phoneNumber, 20);
  }

  return sanitized;
};
