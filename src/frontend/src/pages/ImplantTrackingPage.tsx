import { useState, useMemo } from 'react';
import {
  useGetAllImplantCases,
  useGetAllPatients,
  useGetAllClinics,
  useAddImplantCase,
  useUpdateImplantCase,
  useDeleteImplantCase,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw, Search, Drill, Edit, Trash2 } from 'lucide-react';
import type { ImplantCase } from '../backend';

const STAGES = ['Consultation', 'Surgery Scheduled', 'Healing', 'Crown Placement', 'Completed'];

export function ImplantTrackingPage() {
  const { data: implantCases = [], refetch } = useGetAllImplantCases();
  const { data: patients = [] } = useGetAllPatients();
  const { data: clinics = [] } = useGetAllClinics();
  const addCase = useAddImplantCase();
  const updateCase = useUpdateImplantCase();
  const deleteCase = useDeleteImplantCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<ImplantCase | null>(null);

  const [formData, setFormData] = useState({
    patientId: 0,
    clinicId: 0,
    stage: 'Consultation',
    surgeryDate: '',
    healingStartDate: '',
    crownPlacementDate: '',
  });

  const stageCounts = useMemo(() => {
    return {
      Consultation: implantCases.filter((c) => c.stage === 'Consultation').length,
      'Surgery Scheduled': implantCases.filter((c) => c.stage === 'Surgery Scheduled').length,
      Healing: implantCases.filter((c) => c.stage === 'Healing').length,
      'Crown Placement': implantCases.filter((c) => c.stage === 'Crown Placement').length,
      Completed: implantCases.filter((c) => c.stage === 'Completed').length,
    };
  }, [implantCases]);

  const filteredCases = useMemo(() => {
    return implantCases.filter((implantCase) => {
      const patient = patients.find((p) => p.id === implantCase.patientId);
      const searchMatch =
        !searchQuery || patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient?.phoneNumber.includes(searchQuery);
      const stageMatch = stageFilter === 'All Stages' || implantCase.stage === stageFilter;
      return searchMatch && stageMatch;
    });
  }, [implantCases, patients, searchQuery, stageFilter]);

  const handleOpenModal = (implantCase?: ImplantCase) => {
    if (implantCase) {
      setEditingCase(implantCase);
      setFormData({
        patientId: implantCase.patientId,
        clinicId: implantCase.clinicId,
        stage: implantCase.stage,
        surgeryDate: implantCase.surgeryDate || '',
        healingStartDate: implantCase.healingStartDate || '',
        crownPlacementDate: implantCase.crownPlacementDate || '',
      });
    } else {
      setEditingCase(null);
      setFormData({
        patientId: patients[0]?.id || 0,
        clinicId: clinics[0]?.id || 0,
        stage: 'Consultation',
        surgeryDate: '',
        healingStartDate: '',
        crownPlacementDate: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const caseData: ImplantCase = {
      id: editingCase?.id || Date.now(),
      patientId: formData.patientId,
      clinicId: formData.clinicId,
      stage: formData.stage,
      surgeryDate: formData.surgeryDate || undefined,
      healingStartDate: formData.healingStartDate || undefined,
      crownPlacementDate: formData.crownPlacementDate || undefined,
    };

    if (editingCase) {
      await updateCase.mutateAsync(caseData);
    } else {
      await addCase.mutateAsync(caseData);
    }

    setModalOpen(false);
  };

  const getPatientName = (patientId: number) => {
    return patients.find((p) => p.id === patientId)?.name || 'Unknown';
  };

  const getClinicName = (clinicId: number) => {
    return clinics.find((c) => c.id === clinicId)?.name || 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Implant Case Tracking</h1>
          <p className="text-muted-foreground">Monitor implant treatment stages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Case
          </Button>
        </div>
      </div>

      {/* Stage Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Drill className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{implantCases.length}</div>
          </CardContent>
        </Card>

        {STAGES.map((stage) => (
          <Card key={stage}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stage}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stageCounts[stage as keyof typeof stageCounts]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Stages">All Stages</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Implant Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Surgery Date</TableHead>
                  <TableHead>Healing Start</TableHead>
                  <TableHead>Crown Placement</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No implant cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((implantCase) => (
                    <TableRow key={implantCase.id}>
                      <TableCell className="font-medium">{getPatientName(implantCase.patientId)}</TableCell>
                      <TableCell>{implantCase.stage}</TableCell>
                      <TableCell>{implantCase.surgeryDate || '-'}</TableCell>
                      <TableCell>{implantCase.healingStartDate || '-'}</TableCell>
                      <TableCell>{implantCase.crownPlacementDate || '-'}</TableCell>
                      <TableCell>{getClinicName(implantCase.clinicId)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(implantCase)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCase.mutate(implantCase.id)}
                          >
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
            <DialogTitle>{editingCase ? 'Edit Implant Case' : 'Add New Implant Case'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  value={formData.patientId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, patientId: parseInt(value) })}
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
                <Label htmlFor="stage">Stage *</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic *</Label>
              <Select
                value={formData.clinicId.toString()}
                onValueChange={(value) => setFormData({ ...formData, clinicId: parseInt(value) })}
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

            <div className="space-y-2">
              <Label htmlFor="surgeryDate">Surgery Date</Label>
              <Input
                id="surgeryDate"
                type="date"
                value={formData.surgeryDate}
                onChange={(e) => setFormData({ ...formData, surgeryDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="healingStartDate">Healing Start Date</Label>
              <Input
                id="healingStartDate"
                type="date"
                value={formData.healingStartDate}
                onChange={(e) => setFormData({ ...formData, healingStartDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crownPlacementDate">Crown Placement Date</Label>
              <Input
                id="crownPlacementDate"
                type="date"
                value={formData.crownPlacementDate}
                onChange={(e) => setFormData({ ...formData, crownPlacementDate: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={addCase.isPending || updateCase.isPending}
              >
                {addCase.isPending || updateCase.isPending
                  ? 'Saving...'
                  : editingCase
                    ? 'Save Changes'
                    : 'Add Case'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
