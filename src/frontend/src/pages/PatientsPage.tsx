import { useState, useMemo, useEffect } from 'react';
import {
  useGetAllPatients,
  useGetAllClinics,
  useAddPatient,
  useUpdatePatient,
  useDeletePatient,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw, Search, MessageCircle, Trash2, Edit, Users, Sparkles } from 'lucide-react';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { useHygieneDuePatients } from '../hooks/useHygieneDuePatients';
import { isValidEmail, isRequired } from '../utils/validation';
import { getActorErrorMessage } from '../utils/actorError';
import type { Patient } from '../backend';

type ViewMode = 'all' | 'hygiene-due';

export function PatientsPage() {
  const { data: patients = [], refetch } = useGetAllPatients();
  const { data: clinics = [], isLoading: clinicsLoading } = useGetAllClinics();
  const { hygieneDuePatients } = useHygieneDuePatients();
  const addPatient = useAddPatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Patient | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    dob: '',
    gender: 'Male',
    clinicId: undefined as number | undefined,
    address: '',
  });

  // Auto-select first clinic when clinics load and modal is open for new patient
  useEffect(() => {
    if (modalOpen && !editingPatient && !formData.clinicId && clinics.length > 0) {
      setFormData((prev) => ({ ...prev, clinicId: clinics[0].id }));
    }
  }, [modalOpen, editingPatient, formData.clinicId, clinics]);

  const hygieneDuePatientIds = useMemo(() => {
    return new Set(hygieneDuePatients.map((item) => item.patient.id));
  }, [hygieneDuePatients]);

  const displayedPatients = useMemo(() => {
    const baseList = viewMode === 'hygiene-due' 
      ? patients.filter((p) => hygieneDuePatientIds.has(p.id))
      : patients;

    return baseList.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phoneNumber.includes(searchQuery) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, viewMode, hygieneDuePatientIds, searchQuery]);

  const handleOpenModal = (patient?: Patient) => {
    setValidationError('');
    setEmailError('');
    setIsSubmitting(false);
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        phoneNumber: patient.phoneNumber,
        email: patient.email,
        dob: patient.dob,
        gender: patient.gender,
        clinicId: patient.clinicId,
        address: patient.address,
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        dob: '',
        gender: 'Male',
        clinicId: clinics.length > 0 ? clinics[0].id : undefined,
        address: '',
      });
    }
    setModalOpen(true);
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    // Clear email error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setValidationError('');
    setEmailError('');

    // Validate required fields
    if (!isRequired(formData.name)) {
      setValidationError('Full Name is required');
      return;
    }

    if (!isRequired(formData.phoneNumber)) {
      setValidationError('Phone number is required');
      return;
    }

    if (!formData.clinicId) {
      setValidationError('Please select a clinic before saving');
      return;
    }

    // Validate email format if provided
    if (!isValidEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingPatient) {
        // Update existing patient - use existing ID
        const patientData: Patient = {
          id: editingPatient.id,
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim(),
          dob: formData.dob,
          gender: formData.gender,
          clinicId: formData.clinicId,
          address: formData.address.trim(),
        };
        await updatePatient.mutateAsync(patientData);
      } else {
        // Create new patient - use placeholder ID (backend will assign real ID)
        const patientData: Patient = {
          id: 0, // Placeholder - backend generates the real ID
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim(),
          dob: formData.dob,
          gender: formData.gender,
          clinicId: formData.clinicId,
          address: formData.address.trim(),
        };
        await addPatient.mutateAsync(patientData);
        // Refetch to get the backend-generated ID
        await refetch();
      }

      // Only close modal on success
      setModalOpen(false);
    } catch (error) {
      // Keep modal open and show error
      const errorMessage = getActorErrorMessage(error);
      setValidationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deletePatient.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const getClinicName = (clinicId: number) => {
    return clinics.find((c) => c.id === clinicId)?.name || 'Unknown';
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">{patients.length} total patients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                onClick={() => setViewMode('all')}
                className={viewMode === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              >
                <Users className="h-4 w-4 mr-2" />
                All Patients
              </Button>
              <Button
                variant={viewMode === 'hygiene-due' ? 'default' : 'outline'}
                onClick={() => setViewMode('hygiene-due')}
                className={viewMode === 'hygiene-due' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Hygiene 6mo+ Due
              </Button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'all' ? 'All Patients' : 'Hygiene 6mo+ Due Patients'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {viewMode === 'hygiene-due' ? 'No hygiene-due patients found' : 'No patients found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{patient.phoneNumber}</div>
                          <div className="text-muted-foreground">{patient.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {calculateAge(patient.dob)} / {patient.gender}
                      </TableCell>
                      <TableCell>{getClinicName(patient.clinicId)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(generateWhatsAppLink(patient.phoneNumber), '_blank')}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(patient)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(patient)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
            <DialogDescription>
              {editingPatient ? 'Update patient information' : 'Enter patient details to add to the system'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <Alert variant="destructive">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="john@example.com"
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic *</Label>
              {clinics.length === 0 && !clinicsLoading ? (
                <Alert>
                  <AlertDescription>
                    No clinics found. Add a clinic in Settings to assign patients.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={formData.clinicId?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, clinicId: parseInt(value) })}
                  disabled={clinics.length === 0}
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
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street, City"
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting || clinics.length === 0}
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingPatient
                    ? 'Save Changes'
                    : 'Add Patient'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteConfirm?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
