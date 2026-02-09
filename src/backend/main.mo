import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat32 "mo:core/Nat32";
import Nat8 "mo:core/Nat8";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ClinicId = Nat32;
  public type PatientId = Nat32;
  public type TreatmentId = Nat32;
  public type AlignerCaseId = Nat32;
  public type ImplantCaseId = Nat32;
  public type FeedbackId = Nat32;
  public type ToothNumber = Nat8;

  public type Patient = {
    id : PatientId;
    name : Text;
    phoneNumber : Text;
    email : Text;
    address : Text;
    dob : Text;
    gender : Text;
    clinicId : ClinicId;
  };

  public type Clinic = {
    id : ClinicId;
    name : Text;
    address : Text;
    phoneNumber : Text;
  };

  public type ClinicCreation = {
    name : Text;
    address : Text;
    phoneNumber : Text;
  };

  public type Treatment = {
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

  public type NewTreatmentView = {
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

  public type TreatmentView = {
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

  public type AlignerCase = {
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

  public type NewAlignerCaseView = {
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

  public type ImplantCase = {
    id : ImplantCaseId;
    patientId : PatientId;
    clinicId : ClinicId;
    stage : Text;
    surgeryDate : ?Text;
    healingStartDate : ?Text;
    crownPlacementDate : ?Text;
  };

  public type NewImplantCaseView = {
    patientId : PatientId;
    clinicId : ClinicId;
    stage : Text;
    surgeryDate : ?Text;
    healingStartDate : ?Text;
    crownPlacementDate : ?Text;
  };

  public type PatientFeedback = {
    id : FeedbackId;
    patientId : PatientId;
    clinicId : ClinicId;
    feedback : Text;
    rating : Nat8;
    googleReviewCompleted : Bool;
    date : Text;
  };

  public type NewPatientFeedbackView = {
    patientId : PatientId;
    clinicId : ClinicId;
    feedback : Text;
    rating : Nat8;
    googleReviewCompleted : Bool;
    date : Text;
  };

  public type UserProfile = {
    name : Text;
    clinicId : ?ClinicId;
  };

  public type AnalyticsResponse = {
    followUpsDueToday : [(TreatmentId, Text)];
    overdueFollowUps : [(TreatmentId, Text)];
  };

  var nextClinicId : ClinicId = 1;
  var nextPatientId : PatientId = 1;
  var nextTreatmentId : TreatmentId = 1;
  var nextAlignerCaseId : AlignerCaseId = 1;
  var nextImplantCaseId : ImplantCaseId = 1;
  var nextFeedbackId : FeedbackId = 1;

  let clinics = Map.empty<ClinicId, Clinic>();
  let patients = Map.empty<PatientId, Patient>();
  let treatments = Map.empty<TreatmentId, Treatment>();
  let alignerCases = Map.empty<AlignerCaseId, AlignerCase>();
  let implantCases = Map.empty<ImplantCaseId, ImplantCase>();
  let patientFeedback = Map.empty<FeedbackId, PatientFeedback>();

  let followUpQueue = List.empty<(TreatmentId, Text)>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var dashboardAccessCode : Text = "defaultCode";

  // Clinic Management
  public shared ({ caller }) func createClinic(clinicCreate : ClinicCreation) : async Clinic {
    let newClinic : Clinic = {
      clinicCreate with id = nextClinicId;
    };

    clinics.add(newClinic.id, newClinic);
    nextClinicId += 1;
    newClinic;
  };

  public shared ({ caller }) func updateClinic(clinic : Clinic) : async () {
    switch (clinics.get(clinic.id)) {
      case (null) { Runtime.trap("Clinic does not exist") };
      case (?_) {
        clinics.add(clinic.id, clinic);
      };
    };
  };

  public shared ({ caller }) func deleteClinic(id : ClinicId) : async () {
    clinics.remove(id);
  };

  public query ({ caller }) func getClinic(id : ClinicId) : async ?Clinic {
    clinics.get(id);
  };

  public query ({ caller }) func getAllClinics() : async [Clinic] {
    clinics.values().toArray();
  };

  // Patient Management
  public shared ({ caller }) func addPatient(patient : Patient) : async PatientId {
    let newId = nextPatientId;
    nextPatientId += 1;
    let newPatient = { patient with id = newId };
    patients.add(newId, newPatient);
    newId;
  };

  public shared ({ caller }) func updatePatient(patient : Patient) : async () {
    switch (patients.get(patient.id)) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?_) {
        patients.add(patient.id, patient);
      };
    };
  };

  public shared ({ caller }) func deletePatient(id : PatientId) : async () {
    switch (patients.get(id)) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?_) {
        patients.remove(id);
      };
    };
  };

  public query ({ caller }) func getPatient(id : PatientId) : async ?Patient {
    patients.get(id);
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    patients.values().toArray();
  };

  // Treatment Management
  public shared ({ caller }) func addTreatment(treatmentView : NewTreatmentView) : async TreatmentId {
    if (treatmentView.unitsCompleted > treatmentView.totalUnitsNeeded) {
      Runtime.trap("Progress cannot exceed total units needed");
    };

    let newId = nextTreatmentId;
    let treatment = {
      treatmentView with
      id = newId;
      followUpDates = List.fromArray(treatmentView.followUpDates);
      teeth = List.fromArray(treatmentView.teeth);
    };
    treatments.add(newId, treatment);
    nextTreatmentId += 1;
    newId;
  };

  public shared ({ caller }) func updateTreatment(treatmentView : TreatmentView) : async () {
    if (treatmentView.unitsCompleted > treatmentView.totalUnitsNeeded) {
      Runtime.trap("Progress cannot exceed total units needed");
    };

    switch (treatments.get(treatmentView.id)) {
      case (null) { Runtime.trap("Treatment does not exist") };
      case (?_) {
        let treatment = {
          treatmentView with
          followUpDates = List.fromArray(treatmentView.followUpDates);
          teeth = List.fromArray(treatmentView.teeth);
        };
        treatments.add(treatment.id, treatment);
      };
    };
  };

  public shared ({ caller }) func deleteTreatment(id : TreatmentId) : async () {
    switch (treatments.get(id)) {
      case (null) { Runtime.trap("Treatment does not exist") };
      case (?_) {
        treatments.remove(id);
      };
    };
  };

  public query ({ caller }) func getTreatment(id : TreatmentId) : async ?TreatmentView {
    switch (treatments.get(id)) {
      case (?treatment) {
        ?{
          treatment with
          followUpDates = treatment.followUpDates.toArray();
          teeth = treatment.teeth.toArray();
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllTreatments() : async [TreatmentView] {
    let allTreatments = treatments.values().toArray();
    allTreatments.map(
      func(t) {
        {
          t with
          followUpDates = t.followUpDates.toArray();
          teeth = t.teeth.toArray();
        };
      }
    );
  };

  public shared ({ caller }) func updateTreatmentStatus(id : TreatmentId, status : Text) : async () {
    switch (treatments.get(id)) {
      case (null) { Runtime.trap("Treatment does not exist") };
      case (?treatment) {
        let updatedTreatment = {
          treatment with
          status;
        };
        treatments.add(id, updatedTreatment);
      };
    };
  };

  public shared ({ caller }) func updateTreatmentProgress(id : TreatmentId, completedUnits : Nat) : async () {
    switch (treatments.get(id)) {
      case (null) { Runtime.trap("Treatment does not exist") };
      case (?treatment) {
        if (completedUnits > treatment.totalUnitsNeeded) {
          Runtime.trap("Completed units cannot exceed total units needed");
        };

        let updatedTreatment = {
          treatment with
          unitsCompleted = completedUnits;
        };

        treatments.add(id, updatedTreatment);
      };
    };
  };

  // Aligner Case Management
  public shared ({ caller }) func addAlignerCase(alignerCaseView : NewAlignerCaseView) : async AlignerCaseId {
    let newId = nextAlignerCaseId;
    let alignerCase = {
      alignerCaseView with id = newId;
    };
    alignerCases.add(newId, alignerCase);
    nextAlignerCaseId += 1;
    newId;
  };

  public shared ({ caller }) func updateAlignerCase(alignerCase : AlignerCase) : async () {
    switch (alignerCases.get(alignerCase.id)) {
      case (null) { Runtime.trap("Aligner case does not exist") };
      case (?_) {
        alignerCases.add(alignerCase.id, alignerCase);
      };
    };
  };

  public shared ({ caller }) func deleteAlignerCase(id : AlignerCaseId) : async () {
    switch (alignerCases.get(id)) {
      case (null) { Runtime.trap("Aligner case does not exist") };
      case (?_) {
        alignerCases.remove(id);
      };
    };
  };

  public query ({ caller }) func getAlignerCase(id : AlignerCaseId) : async ?AlignerCase {
    alignerCases.get(id);
  };

  public query ({ caller }) func getAllAlignerCases() : async [AlignerCase] {
    alignerCases.values().toArray();
  };

  public shared ({ caller }) func updateAlignerCaseStage(id : AlignerCaseId, stage : Text) : async () {
    switch (alignerCases.get(id)) {
      case (null) { Runtime.trap("Aligner case does not exist") };
      case (?alignerCase) {
        let updatedCase = {
          alignerCase with
          stage;
        };
        alignerCases.add(id, updatedCase);
      };
    };
  };

  // Implant Case Management
  public shared ({ caller }) func addImplantCase(implantCaseView : NewImplantCaseView) : async ImplantCaseId {
    let newId = nextImplantCaseId;
    let implantCase = {
      implantCaseView with id = newId;
    };
    implantCases.add(newId, implantCase);
    nextImplantCaseId += 1;
    newId;
  };

  public shared ({ caller }) func updateImplantCase(implantCase : ImplantCase) : async () {
    switch (implantCases.get(implantCase.id)) {
      case (null) { Runtime.trap("Implant case does not exist") };
      case (?_) {
        implantCases.add(implantCase.id, implantCase);
      };
    };
  };

  public shared ({ caller }) func deleteImplantCase(id : ImplantCaseId) : async () {
    switch (implantCases.get(id)) {
      case (null) { Runtime.trap("Implant case does not exist") };
      case (?_) {
        implantCases.remove(id);
      };
    };
  };

  public query ({ caller }) func getImplantCase(id : ImplantCaseId) : async ?ImplantCase {
    implantCases.get(id);
  };

  public query ({ caller }) func getAllImplantCases() : async [ImplantCase] {
    implantCases.values().toArray();
  };

  public shared ({ caller }) func updateImplantCaseStage(id : ImplantCaseId, stage : Text) : async () {
    switch (implantCases.get(id)) {
      case (null) { Runtime.trap("Implant case does not exist") };
      case (?implantCase) {
        let updatedCase = {
          implantCase with
          stage;
        };
        implantCases.add(id, updatedCase);
      };
    };
  };

  // Patient Feedback Management
  public shared ({ caller }) func addPatientFeedback(feedbackView : NewPatientFeedbackView) : async FeedbackId {
    let newId = nextFeedbackId;
    let feedback = {
      feedbackView with id = newId;
    };
    patientFeedback.add(newId, feedback);
    nextFeedbackId += 1;
    newId;
  };

  public shared ({ caller }) func updatePatientFeedback(feedback : PatientFeedback) : async () {
    switch (patientFeedback.get(feedback.id)) {
      case (null) { Runtime.trap("Feedback does not exist") };
      case (?_) {
        patientFeedback.add(feedback.id, feedback);
      };
    };
  };

  public shared ({ caller }) func deletePatientFeedback(id : FeedbackId) : async () {
    switch (patientFeedback.get(id)) {
      case (null) { Runtime.trap("Feedback does not exist") };
      case (?_) {
        patientFeedback.remove(id);
      };
    };
  };

  public query ({ caller }) func getPatientFeedback(id : FeedbackId) : async ?PatientFeedback {
    patientFeedback.get(id);
  };

  public query ({ caller }) func getAllPatientFeedback() : async [PatientFeedback] {
    patientFeedback.values().toArray();
  };

  public shared ({ caller }) func scheduleFollowUp(treatmentId : TreatmentId, date : Text) : async () {
    switch (treatments.get(treatmentId)) {
      case (null) { Runtime.trap("Treatment does not exist") };
      case (?_) {
        followUpQueue.add((treatmentId, date));
      };
    };
  };

  public query ({ caller }) func getUpcomingFollowUps() : async [(TreatmentId, Text)] {
    followUpQueue.toArray();
  };

  // Analytics (Right Sidebar Counts)
  public query ({ caller }) func getFollowUpAnalytics() : async AnalyticsResponse {
    let today = Time.now() / 86400000000000;
    let followUps = List.empty<(TreatmentId, Text)>();

    // Collect follow-ups from accessible treatments only.
    for (treatment in treatments.values()) {
      treatment.followUpDates.forEach(
        func(date) {
          let parsedResult = parseDate(date);
          switch (parsedResult) {
            case (?parsedDay) {
              if (parsedDay > 0) {
                followUps.add((treatment.id, date));
              };
            };
            case (null) {};
          };
        }
      );
    };

    let dueToday = followUps.toArray().filter(
      func((_, date)) {
        switch (parseDate(date)) {
          case (?parsedDay) { parsedDay == today };
          case (null) { false };
        };
      }
    );

    let overdue = followUps.toArray().filter(
      func((_, date)) {
        switch (parseDate(date)) {
          case (?parsedDay) { parsedDay < today };
          case (null) { false };
        };
      }
    );

    {
      followUpsDueToday = dueToday;
      overdueFollowUps = overdue;
    };
  };

  func parseDate(_date : Text) : ?Int {
    // Placeholder for actual date parsing logic.
    // Would convert date to days since 1970.
    ?0;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
