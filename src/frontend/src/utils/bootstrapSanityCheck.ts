/**
 * Bootstrap sanity check utility that detects likely mis-targeted/unreachable
 * backend canister scenarios and returns concise English messages.
 */

export interface SanityCheckResult {
  success: boolean;
  userMessage?: string;
  technicalDetails?: string;
}

/**
 * Analyzes an error to determine if it's a backend connection/canister mismatch issue
 * and returns a user-friendly message with technical details.
 */
export function analyzeBootstrapError(error: unknown): SanityCheckResult {
  if (!error) {
    return { success: true };
  }

  const errorString = String(error);

  // Check for CallContextManager-style replica rejections
  if (errorString.includes('CallContextManager') || 
      errorString.includes('does not have a CallContextManager')) {
    return {
      success: false,
      userMessage: 'Unable to connect to the backend service. The application may be misconfigured or the backend is unreachable.',
      technicalDetails: errorString,
    };
  }

  // Check for canister not found / not installed
  if (errorString.includes('Canister') && 
      (errorString.includes('not found') || 
       errorString.includes('not installed') ||
       errorString.includes('does not exist'))) {
    return {
      success: false,
      userMessage: 'Backend service not found. The canister may not be deployed or the configuration is incorrect.',
      technicalDetails: errorString,
    };
  }

  // Check for replica rejection errors
  if (errorString.includes('Reject code:') || 
      errorString.includes('replica returned a rejection error')) {
    return {
      success: false,
      userMessage: 'The backend service rejected the request. This may be a configuration or deployment issue.',
      technicalDetails: errorString,
    };
  }

  // Check for network/connection errors
  if (errorString.includes('network') || 
      errorString.includes('fetch') ||
      errorString.includes('Failed to fetch')) {
    return {
      success: false,
      userMessage: 'Network error. Please check your internet connection and try again.',
      technicalDetails: errorString,
    };
  }

  // Check for timeout errors
  if (errorString.includes('timeout') || errorString.includes('timed out')) {
    return {
      success: false,
      userMessage: 'Connection timed out. The backend service may be slow or unreachable.',
      technicalDetails: errorString,
    };
  }

  // Generic error - not a known bootstrap issue
  return {
    success: false,
    userMessage: 'An unexpected error occurred while connecting to the application.',
    technicalDetails: errorString,
  };
}
