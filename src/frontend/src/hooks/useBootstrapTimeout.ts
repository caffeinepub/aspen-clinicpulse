import { useEffect, useState } from 'react';

/**
 * Hook that converts prolonged loading into a deterministic timeout error state
 * Prevents infinite loading spinners during bootstrap
 * @param isLoading - Whether the app is currently loading
 * @param timeoutMs - Timeout duration in milliseconds (default: 15000)
 * @param resetKey - Optional key that resets the timeout when changed (e.g., retry attempt counter)
 */
export function useBootstrapTimeout(isLoading: boolean, timeoutMs: number = 15000, resetKey: number = 0) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // Reset timeout state when loading stops or resetKey changes
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    // Start timeout timer
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasTimedOut(true);
      }
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutMs, resetKey]);

  return hasTimedOut;
}
