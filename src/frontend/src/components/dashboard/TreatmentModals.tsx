import { useState, useEffect } from 'react';
import { useAddTreatment, useUpdateTreatment } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { TreatmentView, NewTreatmentView, Patient, Clinic } from '../../backend';
import { getActorErrorMessage } from '../../utils/actorError';
import { parseTeethInput, formatTeethForDisplay, calculatePendingUnits, validateProgress } from '../../utils/treatmentProgress';

const TREATMENT_TYPES = [
  'Root Canal (RCT)',
  'Filling',
  'Implant',
  'Aligner/Braces',
  'Crown',
  'Veneer',
  'Extraction',
  'Cleaning/Scaling',
  'Bridge',
  'Denture',
];

interface TreatmentModalsProps {
  modalState: {
    type: 'add' | 'edit' | 'schedule' | null;
    treatment?: TreatmentView;
  };
  onClose: () => void;
  patients: Patient[];
  clinics: Clinic[];
}

export function TreatmentModals({ modalState, onClose, patients, clinics }: TreatmentModalsProps) {
  const addTreatment = useAddTreatment();
  const updateTreatment = useUpdateTreatment();

  const [formData, setFormData] = useState({
    patientId: 0,
    clinicId: 0,
    type: '',
    status: 'pending',
    doctor: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    teethInput: '',
    totalUnitsNeeded: 0,
    unitsCompleted: 0,
  });

  const [error, setError] = useState<string | null>(null);

  // Initialize form data when modal opens or switches modes
  useEffect(() => {
    setError(null);

    if (modalState.type === 'edit' && modalState.treatment) {
      setFormData({
        patientId: modalState.treatment.patientId,
        clinicId: modalState.treatment.clinicId,
        type: modalState.treatment.type,
        status: modalState.treatment.status,
        doctor: modalState.treatment.doctor,
        startDate: modalState.treatment.startDate,
        endDate: modalState.treatment.endDate || '',
        teethInput: formatTeethForDisplay(modalState.treatment.teeth),
        totalUnitsNeeded: Number(modalState.treatment.totalUnitsNeeded),
        unitsCompleted: Number(modalState.treatment.unitsCompleted),
      });
    } else if (modalState.type === 'add') {
      const firstPatient = patients[0];
      const defaultClinicId = firstPatient?.clinicId || clinics[0]?.id || 0;
      
      setFormData({
        patientId: firstPatient?.id || 0,
        clinicId: defaultClinicId,
        type: TREATMENT_TYPES[0],
        status: 'pending',
        doctor: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        teethInput: '',
        totalUnitsNeeded: 0,
        unitsCompleted: 0,
      });
    }
  }, [modalState, patients, clinics]);

  // Sync clinicId when patient changes (only in add mode)
  useEffect(() => {
    if (modalState.type === 'add' && formData.patientId) {
      const selectedPatient = patients.find((p) => p.id === formData.patientId);
      if (selectedPatient && selectedPatient.clinicId !== formData.clinicId) {
        setFormData((prev) => ({
          ...prev,
          clinicId: selectedPatient.clinicId,
        }));
      }
    }
  }, [formData.patientId, patients, modalState.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate progress
    const progressError = validateProgress(formData.totalUnitsNeeded, formData.unitsCompleted);
    if (progressError) {
      setError(progressError);
      return;
    }

    try {
      const teeth = parseTeethInput(formData.teethInput);

      if (modalState.type === 'add') {
        const newTreatment: NewTreatmentView = {
          patientId: formData.patientId,
          clinicId: formData.clinicId,
          type: formData.type,
          status: formData.status,
          doctor: formData.doctor,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          followUpDates: [],
          teeth,
          totalUnitsNeeded: BigInt(formData.totalUnitsNeeded),
          unitsCompleted: BigInt(formData.unitsCompleted),
        };
        await addTreatment.mutateAsync(newTreatment);
        onClose();
      } else if (modalState.type === 'edit' && modalState.treatment) {
        const updatedTreatment: TreatmentView = {
          id: modalState.treatment.id,
          patientId: formData.patientId,
          clinicId: formData.clinicId,
          type: formData.type,
          status: formData.status,
          doctor: formData.doctor,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          followUpDates: modalState.treatment.followUpDates || [],
          teeth,
          totalUnitsNeeded: BigInt(formData.totalUnitsNeeded),
          unitsCompleted: BigInt(formData.unitsCompleted),
        };
        await updateTreatment.mutateAsync(updatedTreatment);
        onClose();
      }
    } catch (err) {
      setError(getActorErrorMessage(err));
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setError(null);
    setFormData({ ...formData, [field]: value });
  };

  if (!modalState.type || modalState.type === 'schedule') return null;

  const isOpen = modalState.type === 'add' || modalState.type === 'edit';
  const pendingUnits = calculatePendingUnits(formData.totalUnitsNeeded, formData.unitsCompleted);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalState.type === 'add' ? 'Add New Treatment' : 'Edit Treatment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patientId.toString()}
                onValueChange={(value) => handleFieldChange('patientId', parseInt(value))}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic *</Label>
              <Select
                value={formData.clinicId.toString()}
                onValueChange={(value) => handleFieldChange('clinicId', parseInt(value))}
              >
                <SelectTrigger id="clinic">
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id.toString()}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Treatment Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleFieldChange('type', value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select treatment type" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teethInput">Tooth Numbers</Label>
            <Input
              id="teethInput"
              value={formData.teethInput}
              onChange={(e) => handleFieldChange('teethInput', e.target.value)}
              placeholder="e.g., 14, 15, 16"
            />
            <p className="text-xs text-muted-foreground">
              Enter tooth numbers separated by commas (1-32)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalUnitsNeeded">Total Needed</Label>
              <Input
                id="totalUnitsNeeded"
                type="number"
                min="0"
                value={formData.totalUnitsNeeded}
                onChange={(e) => handleFieldChange('totalUnitsNeeded', parseInt(e.target.value) || 0)}
                placeholder="e.g., 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitsCompleted">Completed</Label>
              <Input
                id="unitsCompleted"
                type="number"
                min="0"
                value={formData.unitsCompleted}
                onChange={(e) => handleFieldChange('unitsCompleted', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pendingUnits">Pending</Label>
              <Input
                id="pendingUnits"
                type="number"
                value={pendingUnits}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor *</Label>
            <Input
              id="doctor"
              value={formData.doctor}
              onChange={(e) => handleFieldChange('doctor', e.target.value)}
              placeholder="Enter doctor name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleFieldChange('endDate', e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={addTreatment.isPending || updateTreatment.isPending}
            >
              {addTreatment.isPending || updateTreatment.isPending
                ? 'Saving...'
                : modalState.type === 'add'
                  ? 'Add Treatment'
                  : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
