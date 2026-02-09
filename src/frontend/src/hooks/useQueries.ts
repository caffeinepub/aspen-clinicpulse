import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Patient,
  Clinic,
  ClinicCreation,
  TreatmentView,
  NewTreatmentView,
  AlignerCase,
  NewAlignerCaseView,
  ImplantCase,
  NewImplantCaseView,
  PatientFeedback,
  NewPatientFeedbackView,
  UserProfile,
  UserRole,
  AnalyticsResponse,
} from '../backend';
import { Principal } from '@dfinity/principal';

// Clinic Queries
export function useGetAllClinics() {
  const { actor, isFetching } = useActor();

  return useQuery<Clinic[]>({
    queryKey: ['clinics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllClinics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClinic(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Clinic | null>({
    queryKey: ['clinic', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getClinic(id);
    },
    enabled: !!actor && !isFetching && id > 0,
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (clinicCreate: ClinicCreation) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createClinic(clinicCreate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (clinic: Clinic) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClinic(clinic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
}

export function useDeleteClinic() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteClinic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
}

// Patient Queries
export function useGetAllPatients() {
  const { actor, isFetching } = useActor();

  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPatient(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Patient | null>({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPatient(id);
    },
    enabled: !!actor && !isFetching && id > 0,
  });
}

export function useAddPatient() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (patient: Patient) => {
      if (!actor) throw new Error('Actor not available');
      const newId = await actor.addPatient(patient);
      return newId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (patient: Patient) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePatient(patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePatient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Treatment Queries
export function useGetAllTreatments() {
  const { actor, isFetching } = useActor();

  return useQuery<TreatmentView[]>({
    queryKey: ['treatments'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTreatments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTreatment(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<TreatmentView | null>({
    queryKey: ['treatment', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTreatment(id);
    },
    enabled: !!actor && !isFetching && id > 0,
  });
}

export function useAddTreatment() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (treatment: NewTreatmentView) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTreatment(treatment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['followUpAnalytics'] });
    },
  });
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (treatment: TreatmentView) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTreatment(treatment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['followUpAnalytics'] });
    },
  });
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTreatment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['followUpAnalytics'] });
    },
  });
}

export function useUpdateTreatmentStatus() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTreatmentStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
  });
}

export function useUpdateTreatmentProgress() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ id, completedUnits }: { id: number; completedUnits: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTreatmentProgress(id, BigInt(completedUnits));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['followUpAnalytics'] });
    },
  });
}

export function useScheduleFollowUp() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ treatmentId, date }: { treatmentId: number; date: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.scheduleFollowUp(treatmentId, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['followUpAnalytics'] });
    },
  });
}

export function useGetFollowUpAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsResponse>({
    queryKey: ['followUpAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getFollowUpAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

// Aligner Case Queries
export function useGetAllAlignerCases() {
  const { actor, isFetching } = useActor();

  return useQuery<AlignerCase[]>({
    queryKey: ['alignerCases'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAlignerCases();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAlignerCase(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<AlignerCase | null>({
    queryKey: ['alignerCase', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAlignerCase(id);
    },
    enabled: !!actor && !isFetching && id > 0,
  });
}

export function useAddAlignerCase() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (alignerCase: NewAlignerCaseView) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAlignerCase(alignerCase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alignerCases'] });
    },
  });
}

export function useUpdateAlignerCase() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (alignerCase: AlignerCase) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAlignerCase(alignerCase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alignerCases'] });
    },
  });
}

export function useDeleteAlignerCase() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAlignerCase(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alignerCases'] });
    },
  });
}

// Implant Case Queries
export function useGetAllImplantCases() {
  const { actor, isFetching } = useActor();

  return useQuery<ImplantCase[]>({
    queryKey: ['implantCases'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllImplantCases();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetImplantCase(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<ImplantCase | null>({
    queryKey: ['implantCase', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getImplantCase(id);
    },
    enabled: !!actor && !isFetching && id > 0,
  });
}

export function useAddImplantCase() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (implantCase: NewImplantCaseView) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addImplantCase(implantCase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implantCases'] });
    },
  });
}

export function useUpdateImplantCase() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (implantCase: ImplantCase) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateImplantCase(implantCase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implantCases'] });
    },
  });
}

export function useDeleteImplantCase() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteImplantCase(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implantCases'] });
    },
  });
}

// Patient Feedback Queries
export function useGetAllPatientFeedback() {
  const { actor, isFetching } = useActor();

  return useQuery<PatientFeedback[]>({
    queryKey: ['patientFeedback'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPatientFeedback();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPatientFeedback(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<PatientFeedback | null>({
    queryKey: ['patientFeedback', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPatientFeedback(id);
    },
    enabled: !!actor && !isFetching && id > 0,
  });
}

export function useAddPatientFeedback() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (feedback: NewPatientFeedbackView) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPatientFeedback(feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientFeedback'] });
    },
  });
}

export function useUpdatePatientFeedback() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (feedback: PatientFeedback) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePatientFeedback(feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientFeedback'] });
    },
  });
}

export function useDeletePatientFeedback() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePatientFeedback(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientFeedback'] });
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
