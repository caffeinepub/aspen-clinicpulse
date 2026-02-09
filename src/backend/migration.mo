import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Nat8 "mo:core/Nat8";

module {
  // Type aliases
  type ClinicId = Nat32;
  type PatientId = Nat32;
  type TreatmentId = Nat32;
  type AlignerCaseId = Nat32;
  type ImplantCaseId = Nat32;
  type FeedbackId = Nat32;
  type ToothNumber = Nat8;

  // Data structures
  type Patient = {
    id : PatientId;
    name : Text;
    phoneNumber : Text;
    email : Text;
    address : Text;
    dob : Text;
    gender : Text;
    clinicId : ClinicId;
  };

  type Clinic = {
    id : ClinicId;
    name : Text;
    address : Text;
    phoneNumber : Text;
  };

  type ClinicCreation = {
    name : Text;
    address : Text;
    phoneNumber : Text;
  };

  type Treatment = {
    id : TreatmentId;
    patientId : PatientId;
    clinicId : ClinicId;
    type_ : Text;
    status : Text;
    doctor : Text;
    startDate : Text;
    endDate : ?Text;
    followUpDates : List.List<Text>;
    teeth : List.List<Nat8>;
    totalUnitsNeeded : Nat;
    unitsCompleted : Nat;
  };

  type NewTreatmentView = {
    patientId : PatientId;
    clinicId : ClinicId;
    type_ : Text;
    status : Text;
    doctor : Text;
    startDate : Text;
    endDate : ?Text;
    followUpDates : [Text];
    teeth : [Nat8];
    totalUnitsNeeded : Nat;
    unitsCompleted : Nat;
  };

  type TreatmentView = {
    id : TreatmentId;
    patientId : PatientId;
    clinicId : ClinicId;
    type_ : Text;
    status : Text;
    doctor : Text;
    startDate : Text;
    endDate : ?Text;
    followUpDates : [Text];
    teeth : [ToothNumber];
    totalUnitsNeeded : Nat;
    unitsCompleted : Nat;
  };

  type AlignerCase = {
    id : AlignerCaseId;
    patientId : PatientId;
    clinicId : ClinicId;
    stage : Text;
    alignersCompleted : Nat;
    totalAligners : Nat;
    currentPhase : Text;
    hasRefinements : Bool;
    startDate : Text;
    endDate : ?Text;
  };

  type NewAlignerCaseView = {
    patientId : PatientId;
    clinicId : ClinicId;
    stage : Text;
    alignersCompleted : Nat;
    totalAligners : Nat;
    currentPhase : Text;
    hasRefinements : Bool;
    startDate : Text;
    endDate : ?Text;
  };

  type ImplantCase = {
    id : ImplantCaseId;
    patientId : PatientId;
    clinicId : ClinicId;
    stage : Text;
    surgeryDate : ?Text;
    healingStartDate : ?Text;
    crownPlacementDate : ?Text;
  };

  type NewImplantCaseView = {
    patientId : PatientId;
    clinicId : ClinicId;
    stage : Text;
    surgeryDate : ?Text;
    healingStartDate : ?Text;
    crownPlacementDate : ?Text;
  };

  type PatientFeedback = {
    id : FeedbackId;
    patientId : PatientId;
    clinicId : ClinicId;
    feedback : Text;
    rating : Nat8;
    googleReviewCompleted : Bool;
    date : Text;
  };

  type NewPatientFeedbackView = {
    patientId : PatientId;
    clinicId : ClinicId;
    feedback : Text;
    rating : Nat8;
    googleReviewCompleted : Bool;
    date : Text;
  };

  type UserProfile = {
    name : Text;
    clinicId : ?ClinicId;
  };

  type AnalyticsResponse = {
    followUpsDueToday : [(TreatmentId, Text)];
    overdueFollowUps : [(TreatmentId, Text)];
  };

  // Old actor definition including validatedUsers
  type OldActor = {
    clinics : Map.Map<ClinicId, Clinic>;
    patients : Map.Map<PatientId, Patient>;
    treatments : Map.Map<TreatmentId, Treatment>;
    alignerCases : Map.Map<AlignerCaseId, AlignerCase>;
    implantCases : Map.Map<ImplantCaseId, ImplantCase>;
    patientFeedback : Map.Map<FeedbackId, PatientFeedback>;
    followUpQueue : List.List<(TreatmentId, Text)>;
    userProfiles : Map.Map<Principal, UserProfile>;
    dashboardAccessCode : Text;
    validatedUsers : Map.Map<Principal, Bool>; // dropped variable
  };

  // New actor definition without validatedUsers
  type NewActor = {
    clinics : Map.Map<ClinicId, Clinic>;
    patients : Map.Map<PatientId, Patient>;
    treatments : Map.Map<TreatmentId, Treatment>;
    alignerCases : Map.Map<AlignerCaseId, AlignerCase>;
    implantCases : Map.Map<ImplantCaseId, ImplantCase>;
    patientFeedback : Map.Map<FeedbackId, PatientFeedback>;
    followUpQueue : List.List<(TreatmentId, Text)>;
    userProfiles : Map.Map<Principal, UserProfile>;
    dashboardAccessCode : Text;
  };

  public func run(old : OldActor) : NewActor {
    // Explicitly drop validatedUsers
    {
      clinics = old.clinics;
      patients = old.patients;
      treatments = old.treatments;
      alignerCases = old.alignerCases;
      implantCases = old.implantCases;
      patientFeedback = old.patientFeedback;
      followUpQueue = old.followUpQueue;
      userProfiles = old.userProfiles;
      dashboardAccessCode = old.dashboardAccessCode;
    };
  };
};
