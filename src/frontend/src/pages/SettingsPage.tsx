import { useState } from 'react';
import { useGetAllClinics, useCreateClinic, useUpdateClinic, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Settings as SettingsIcon, MessageSquare, Star, AlertCircle } from 'lucide-react';
import type { Clinic } from '../backend';
import { getActorErrorMessage } from '../utils/actorError';

export function SettingsPage() {
  const { data: clinics = [] } = useGetAllClinics();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const createClinic = useCreateClinic();
  const updateClinic = useUpdateClinic();

  const [clinicModalOpen, setClinicModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [clinicFormData, setClinicFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
  });
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'Hello {patient_name}, this is a reminder from {clinic_name}. Please contact us at {phone}.'
  );
  const [reviewLink, setReviewLink] = useState('https://g.page/r/YOUR_GOOGLE_REVIEW_LINK');

  const handleOpenClinicModal = (clinic?: Clinic) => {
    setMutationError(null);
    if (clinic) {
      setEditingClinic(clinic);
      setClinicFormData({
        name: clinic.name,
        address: clinic.address,
        phoneNumber: clinic.phoneNumber,
      });
    } else {
      setEditingClinic(null);
      setClinicFormData({
        name: '',
        address: '',
        phoneNumber: '',
      });
    }
    setClinicModalOpen(true);
  };

  const handleSubmitClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setMutationError(null);

    try {
      if (editingClinic) {
        const clinicData: Clinic = {
          id: editingClinic.id,
          name: clinicFormData.name,
          address: clinicFormData.address,
          phoneNumber: clinicFormData.phoneNumber,
        };
        await updateClinic.mutateAsync(clinicData);
      } else {
        await createClinic.mutateAsync({
          name: clinicFormData.name,
          address: clinicFormData.address,
          phoneNumber: clinicFormData.phoneNumber,
        });
      }
      setClinicModalOpen(false);
    } catch (error) {
      const errorMessage = getActorErrorMessage(error);
      setMutationError(errorMessage);
    }
  };

  const isSubmitting = createClinic.isPending || updateClinic.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage clinics, templates, and configurations</p>
      </div>

      <Tabs defaultValue="clinics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clinics">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Clinics
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp Templates
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            Google Reviews
          </TabsTrigger>
        </TabsList>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clinic Management</CardTitle>
              <Button
                onClick={() => handleOpenClinicModal()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Clinic
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clinic Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No clinics found. Add your first clinic to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      clinics.map((clinic) => (
                        <TableRow key={clinic.id}>
                          <TableCell className="font-medium">{clinic.name}</TableCell>
                          <TableCell>{clinic.address}</TableCell>
                          <TableCell>{clinic.phoneNumber}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenClinicModal(clinic)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Templates Tab */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Message Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-template">Default Template</Label>
                <Textarea
                  id="whatsapp-template"
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  rows={4}
                  placeholder="Enter your WhatsApp message template..."
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: {'{patient_name}'}, {'{clinic_name}'}, {'{phone}'}
                </p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">Save Template</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Review Link Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review-link">Google Review Link</Label>
                <Input
                  id="review-link"
                  value={reviewLink}
                  onChange={(e) => setReviewLink(e.target.value)}
                  placeholder="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK"
                />
                <p className="text-sm text-muted-foreground">
                  This link will be used when requesting Google reviews from patients.
                </p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">Save Link</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Clinic Modal */}
      <Dialog open={clinicModalOpen} onOpenChange={setClinicModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClinic ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitClinic} className="space-y-4">
            {mutationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{mutationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="clinic-name">Clinic Name *</Label>
              <Input
                id="clinic-name"
                value={clinicFormData.name}
                onChange={(e) => setClinicFormData({ ...clinicFormData, name: e.target.value })}
                placeholder="Aspen Dental Care"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-address">Address *</Label>
              <Input
                id="clinic-address"
                value={clinicFormData.address}
                onChange={(e) => setClinicFormData({ ...clinicFormData, address: e.target.value })}
                placeholder="123 Main Street, City"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-phone">Phone Number *</Label>
              <Input
                id="clinic-phone"
                value={clinicFormData.phoneNumber}
                onChange={(e) => setClinicFormData({ ...clinicFormData, phoneNumber: e.target.value })}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setClinicModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingClinic ? 'Save Changes' : 'Add Clinic'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
