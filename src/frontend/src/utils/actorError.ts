import { analyzeBootstrapError } from './bootstrapSanityCheck';

/**
 * Converts backend/actor errors into user-friendly English messages,
 * including specific handling for bootstrap/replica-rejection errors.
 */
export function getActorErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  const errorString = String(error);

  // First check if this is a bootstrap/canister mismatch error
  const sanityCheck = analyzeBootstrapError(error);
  if (!sanityCheck.success && sanityCheck.userMessage) {
    return sanityCheck.userMessage;
  }

  // Check for access code validation errors
  if (errorString.includes('Dashboard access code must be validated')) {
    return 'Your session has expired. Please sign in again and verify your access code';
  }

  // Check for common authorization errors
  if (errorString.includes('Unauthorized')) {
    // Check for clinic-specific authorization errors first (most specific)
    if (
      errorString.includes('your own clinic') ||
      errorString.includes('add patients to your own clinic') ||
      errorString.includes('only add patients')
    ) {
      return 'You can only add patients to your assigned clinic. Please select the correct clinic or contact your administrator';
    }
    
    if (errorString.includes('Only admins')) {
      return 'Only administrators can perform this action';
    }
    
    if (errorString.includes('Only users') || errorString.includes('Only authenticated users')) {
      return 'You must be logged in to perform this action';
    }
    
    return 'You do not have permission to perform this action';
  }

  // Check for Nat32 overflow and candid/agent numeric conversion errors
  if (
    errorString.includes('Nat32') ||
    errorString.includes('type mismatch') ||
    errorString.includes('candid') ||
    errorString.includes('decode') ||
    errorString.includes('Invalid data') ||
    errorString.includes('out of range') ||
    errorString.includes('overflow')
  ) {
    return 'A value sent to the server was invalid. Please try again or contact support';
  }

  // Check for actor availability
  if (errorString.includes('Actor not available')) {
    return 'Unable to connect to the backend. Please try again';
  }

  // Check for network/connection errors
  if (errorString.includes('network') || errorString.includes('fetch')) {
    return 'Network error. Please check your connection and try again';
  }

  // Check for validation errors
  if (errorString.includes('does not exist')) {
    return 'The requested resource does not exist';
  }

  // Check for feedback-specific errors
  if (errorString.includes('Feedback does not exist')) {
    return 'This feedback entry no longer exists';
  }

  // Generic fallback
  return 'An error occurred. Please try again';
}

/**
 * Extracts technical details from an error for display in expandable sections.
 * Returns a formatted string suitable for technical debugging.
 */
export function getErrorTechnicalDetails(error: unknown): string {
  if (!error) {
    return 'No error details available';
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n\nStack:\n${error.stack || 'No stack trace available'}`;
  }

  return String(error);
}
