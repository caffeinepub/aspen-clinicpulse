/**
 * Analytics utility functions for data derivation and date handling
 */

import { calculatePendingUnits } from './treatmentProgress';

export interface MonthBucket {
  month: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface DoctorStats {
  doctor: string;
  count: number;
}

export interface RemainingWorkByType {
  type: string;
  pendingUnits: number;
}

/**
 * Parse date string (YYYY-MM-DD) and return month key (YYYY-MM)
 */
export function getMonthKey(dateString: string): string | null {
  try {
    const parts = dateString.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format month key (YYYY-MM) to readable format (MMM YYYY)
 */
export function formatMonthKey(monthKey: string): string {
  try {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return monthKey;
  }
}

/**
 * Group treatments by month from startDate
 */
export function groupTreatmentsByMonth(treatments: Array<{ startDate: string; type: string }>): MonthBucket[] {
  const monthCounts: Record<string, number> = {};

  treatments.forEach((treatment) => {
    const monthKey = getMonthKey(treatment.startDate);
    if (monthKey) {
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  });

  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calculate status distribution with percentages
 */
export function calculateStatusDistribution(treatments: Array<{ status: string }>): StatusCount[] {
  const statusCounts: Record<string, number> = {};
  const total = treatments.length;

  treatments.forEach((treatment) => {
    statusCounts[treatment.status] = (statusCounts[treatment.status] || 0) + 1;
  });

  return Object.entries(statusCounts)
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Rank doctors by treatment volume
 */
export function rankDoctorsByVolume(treatments: Array<{ doctor: string }>): DoctorStats[] {
  const doctorCounts: Record<string, number> = {};

  treatments.forEach((treatment) => {
    const doctor = treatment.doctor.trim() || 'Unknown';
    doctorCounts[doctor] = (doctorCounts[doctor] || 0) + 1;
  });

  return Object.entries(doctorCounts)
    .map(([doctor, count]) => ({ doctor, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Group remaining work by treatment type
 */
export function groupRemainingWorkByType(
  treatments: Array<{ type: string; totalUnitsNeeded: bigint | number; unitsCompleted: bigint | number }>
): RemainingWorkByType[] {
  const workByType: Record<string, number> = {};

  treatments.forEach((treatment) => {
    const pending = calculatePendingUnits(treatment.totalUnitsNeeded, treatment.unitsCompleted);
    if (pending > 0) {
      workByType[treatment.type] = (workByType[treatment.type] || 0) + pending;
    }
  });

  return Object.entries(workByType)
    .map(([type, pendingUnits]) => ({ type, pendingUnits }))
    .sort((a, b) => b.pendingUnits - a.pendingUnits);
}

/**
 * Parse date string to days since epoch for comparison
 */
export function parseDateToDays(dateString: string): number | null {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

/**
 * Get today's date in days since epoch
 */
export function getTodayInDays(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

/**
 * Format status label for display
 */
export function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return labels[status] || status;
}
