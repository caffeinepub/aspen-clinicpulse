import { useMemo } from 'react';
import { useGetAllPatients, useGetAllClinics, useGetAllTreatments } from './useQueries';
import type { Patient } from '../backend';

export interface HygieneDuePatient {
  patient: Patient;
  clinicName: string;
  lastHygieneDate: string | null;
  daysSinceLastHygiene: number | null;
}

export function useHygieneDuePatients() {
  const { data: patients = [], isLoading: patientsLoading } = useGetAllPatients();
  const { data: clinics = [], isLoading: clinicsLoading } = useGetAllClinics();
  const { data: treatments = [], isLoading: treatmentsLoading } = useGetAllTreatments();

  const hygieneDuePatients = useMemo(() => {
    const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000; // Approximate 6 months in milliseconds
    const today = new Date();

    return patients
      .map((patient) => {
        // Find all Cleaning/Scaling treatments for this patient
        const hygieneVisits = treatments
          .filter((t) => t.patientId === patient.id && t.type === 'Cleaning/Scaling')
          .sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return dateB - dateA; // Most recent first
          });

        const lastVisit = hygieneVisits[0];
        const lastHygieneDate = lastVisit ? lastVisit.startDate : null;
        const lastVisitTime = lastHygieneDate ? new Date(lastHygieneDate).getTime() : null;
        const daysSinceLastHygiene = lastVisitTime
          ? Math.floor((today.getTime() - lastVisitTime) / (24 * 60 * 60 * 1000))
          : null;

        const isDue = !lastVisitTime || today.getTime() - lastVisitTime > SIX_MONTHS_MS;

        const clinic = clinics.find((c) => c.id === patient.clinicId);

        return {
          patient,
          clinicName: clinic?.name || 'Unknown',
          lastHygieneDate,
          daysSinceLastHygiene,
          isDue,
        };
      })
      .filter((item) => item.isDue);
  }, [patients, treatments, clinics]);

  return {
    hygieneDuePatients,
    isLoading: patientsLoading || clinicsLoading || treatmentsLoading,
  };
}
