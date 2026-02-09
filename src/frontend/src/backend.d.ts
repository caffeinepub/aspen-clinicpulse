import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewTreatmentView {
    status: string;
    teeth: Uint8Array;
    endDate?: string;
    doctor: string;
    patientId: PatientId;
    clinicId: ClinicId;
    type: string;
    totalUnitsNeeded: bigint;
    unitsCompleted: bigint;
    followUpDates: Array<string>;
    startDate: string;
}
export interface Clinic {
    id: ClinicId;
    name: string;
    address: string;
    phoneNumber: string;
}
export type ImplantCaseId = number;
export interface TreatmentView {
    id: TreatmentId;
    status: string;
    teeth: Uint8Array;
    endDate?: string;
    doctor: string;
    patientId: PatientId;
    clinicId: ClinicId;
    type: string;
    totalUnitsNeeded: bigint;
    unitsCompleted: bigint;
    followUpDates: Array<string>;
    startDate: string;
}
export interface PatientFeedback {
    id: FeedbackId;
    patientId: PatientId;
    clinicId: ClinicId;
    date: string;
    feedback: string;
    googleReviewCompleted: boolean;
    rating: number;
}
export interface NewImplantCaseView {
    healingStartDate?: string;
    patientId: PatientId;
    clinicId: ClinicId;
    crownPlacementDate?: string;
    stage: string;
    surgeryDate?: string;
}
export type ClinicId = number;
export type PatientId = number;
export type TreatmentId = number;
export interface NewAlignerCaseView {
    currentPhase: string;
    endDate?: string;
    patientId: PatientId;
    clinicId: ClinicId;
    stage: string;
    alignersCompleted: bigint;
    hasRefinements: boolean;
    startDate: string;
    totalAligners: bigint;
}
export interface Patient {
    id: PatientId;
    dob: string;
    clinicId: ClinicId;
    name: string;
    email: string;
    address: string;
    gender: string;
    phoneNumber: string;
}
export interface AlignerCase {
    id: AlignerCaseId;
    currentPhase: string;
    endDate?: string;
    patientId: PatientId;
    clinicId: ClinicId;
    stage: string;
    alignersCompleted: bigint;
    hasRefinements: boolean;
    startDate: string;
    totalAligners: bigint;
}
export type AlignerCaseId = number;
export interface ClinicCreation {
    name: string;
    address: string;
    phoneNumber: string;
}
export type ToothNumber = number;
export interface AnalyticsResponse {
    followUpsDueToday: Array<[TreatmentId, string]>;
    overdueFollowUps: Array<[TreatmentId, string]>;
}
export interface NewPatientFeedbackView {
    patientId: PatientId;
    clinicId: ClinicId;
    date: string;
    feedback: string;
    googleReviewCompleted: boolean;
    rating: number;
}
export type FeedbackId = number;
export interface ImplantCase {
    id: ImplantCaseId;
    healingStartDate?: string;
    patientId: PatientId;
    clinicId: ClinicId;
    crownPlacementDate?: string;
    stage: string;
    surgeryDate?: string;
}
export interface UserProfile {
    clinicId?: ClinicId;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAlignerCase(alignerCaseView: NewAlignerCaseView): Promise<AlignerCaseId>;
    addImplantCase(implantCaseView: NewImplantCaseView): Promise<ImplantCaseId>;
    addPatient(patient: Patient): Promise<PatientId>;
    addPatientFeedback(feedbackView: NewPatientFeedbackView): Promise<FeedbackId>;
    addTreatment(treatmentView: NewTreatmentView): Promise<TreatmentId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClinic(clinicCreate: ClinicCreation): Promise<Clinic>;
    deleteAlignerCase(id: AlignerCaseId): Promise<void>;
    deleteClinic(id: ClinicId): Promise<void>;
    deleteImplantCase(id: ImplantCaseId): Promise<void>;
    deletePatient(id: PatientId): Promise<void>;
    deletePatientFeedback(id: FeedbackId): Promise<void>;
    deleteTreatment(id: TreatmentId): Promise<void>;
    getAlignerCase(id: AlignerCaseId): Promise<AlignerCase | null>;
    getAllAlignerCases(): Promise<Array<AlignerCase>>;
    getAllClinics(): Promise<Array<Clinic>>;
    getAllImplantCases(): Promise<Array<ImplantCase>>;
    getAllPatientFeedback(): Promise<Array<PatientFeedback>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAllTreatments(): Promise<Array<TreatmentView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClinic(id: ClinicId): Promise<Clinic | null>;
    getFollowUpAnalytics(): Promise<AnalyticsResponse>;
    getImplantCase(id: ImplantCaseId): Promise<ImplantCase | null>;
    getPatient(id: PatientId): Promise<Patient | null>;
    getPatientFeedback(id: FeedbackId): Promise<PatientFeedback | null>;
    getTreatment(id: TreatmentId): Promise<TreatmentView | null>;
    getUpcomingFollowUps(): Promise<Array<[TreatmentId, string]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scheduleFollowUp(treatmentId: TreatmentId, date: string): Promise<void>;
    updateAlignerCase(alignerCase: AlignerCase): Promise<void>;
    updateAlignerCaseStage(id: AlignerCaseId, stage: string): Promise<void>;
    updateClinic(clinic: Clinic): Promise<void>;
    updateImplantCase(implantCase: ImplantCase): Promise<void>;
    updateImplantCaseStage(id: ImplantCaseId, stage: string): Promise<void>;
    updatePatient(patient: Patient): Promise<void>;
    updatePatientFeedback(feedback: PatientFeedback): Promise<void>;
    updateTreatment(treatmentView: TreatmentView): Promise<void>;
    updateTreatmentProgress(id: TreatmentId, completedUnits: bigint): Promise<void>;
    updateTreatmentStatus(id: TreatmentId, status: string): Promise<void>;
}
