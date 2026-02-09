/**
 * Shared utilities for treatment progress tracking and tooth number handling
 */

/**
 * Parse comma-separated tooth numbers into Uint8Array for backend
 * Example: "14, 15, 16" -> Uint8Array([14, 15, 16])
 */
export function parseTeethInput(input: string): Uint8Array {
  if (!input.trim()) {
    return new Uint8Array([]);
  }

  const teeth = input
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t !== '')
    .map((t) => parseInt(t, 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 32);

  return new Uint8Array(teeth);
}

/**
 * Format Uint8Array of tooth numbers for display
 * Example: Uint8Array([14, 15, 16]) -> "14, 15, 16"
 */
export function formatTeethForDisplay(teeth: Uint8Array): string {
  if (!teeth || teeth.length === 0) {
    return '';
  }
  return Array.from(teeth).join(', ');
}

/**
 * Calculate pending units (total - completed)
 * Handles bigint conversion safely
 */
export function calculatePendingUnits(totalNeeded: bigint | number, completed: bigint | number): number {
  const total = typeof totalNeeded === 'bigint' ? Number(totalNeeded) : totalNeeded;
  const done = typeof completed === 'bigint' ? Number(completed) : completed;
  return Math.max(0, total - done);
}

/**
 * Validate progress values
 */
export function validateProgress(totalNeeded: number, completed: number): string | null {
  if (totalNeeded < 0) {
    return 'Total units needed cannot be negative';
  }
  if (completed < 0) {
    return 'Completed units cannot be negative';
  }
  if (completed > totalNeeded) {
    return 'Completed units cannot exceed total units needed';
  }
  return null;
}
