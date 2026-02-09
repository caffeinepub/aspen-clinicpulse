/**
 * Shared validation utilities for forms
 */

/**
 * Validates email format. Empty strings are considered valid.
 * @param email - The email string to validate
 * @returns true if valid or empty, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return true; // Empty is valid (optional field)
  }
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that a required field is not empty
 * @param value - The value to validate
 * @returns true if not empty, false otherwise
 */
export function isRequired(value: string | number | undefined | null): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  return true;
}
