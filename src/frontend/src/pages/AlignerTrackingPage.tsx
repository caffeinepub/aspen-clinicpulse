import { useState, useMemo } from 'react';
import {
  useGetAllAlignerCases,
  useGetAllPatients,
  useGetAllClinics,
  useAddAlignerCase,
  useUpdateAlignerCase,
  useDeleteAlignerCase,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw, Search, Smile, TrendingUp, CheckCircle, Edit, Trash2 } from 'lucide-react';
import type { AlignerCase } from '../backend';

const STAGES = ['Planning', 'Active', 'Refinement', 'Completed'];

export function AlignerTrackingPage() {
  const { data: alignerCases = [], refetch } = useGetAllAlignerCases();
  const { data: patients = [] } = useGetAllPatients();
  const { data: clinics = [] } = useGetAllClinics();
  const addCase = useAddAlignerCase();
  const updateCase = useUpdateAlignerCase();
  const deleteCase = useDeleteAlignerCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<AlignerCase | null>(null);

  const [formData, setFormData] = useState({
    patientId: 0,
    clinicId: 0,
    stage: 'Planning',
    totalAligners: 0,
    alignersCompleted: 0,
    currentPhase: 'Initial',
    hasRefinements: false,
    startDate: new Date().toISOString().split('T')[0],
  });

  const stageCounts = useMemo(() => {
    return {
      Planning: alignerCases.filter((c) => c.stage === 'Planning').length,
      Active: alignerCases.filter((c) => c.stage === 'Active').length,
      Refinement: alignerCases.filter((c) => c.stage === 'Refinement').length,
      Completed: alignerCases.filter((c) => c.stage === 'Completed').length,
    };
  }, [alignerCases]);

  const filteredCases = useMemo(() => {
    return alignerCases.filter((alignerCase) => {
      const patient = patients.find((p) => p.id === alignerCase.patientId);
      const searchMatch =
        !searchQuery || patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient?.phoneNumber.includes(searchQuery);
      const stageMatch = stageFilter === 'All Stages' || alignerCase.stage === stageFilter;
      return searchMatch && stageMatch;
    });
  }, [alignerCases, patients, searchQuery, stageFilter]);

  const handleOpenModal = (alignerCase?: AlignerCase) => {
    if (alignerCase) {
      setEditingCase(alignerCase);
      setFormData({
        patientId: alignerCase.patientId,
        clinicId: alignerCase.clinicId,
        stage: alignerCase.stage,
        totalAligners: Number(alignerCase.totalAligners),
        alignersCompleted: Number(alignerCase.alignersCompleted),
        currentPhase: alignerCase.currentPhase,
        hasRefinements: alignerCase.hasRefinements,
        startDate: alignerCase.startDate,
      });
    } else {
      setEditingCase(null);
      setFormData({
        patientId: patients[0]?.id || 0,
        clinicId: clinics[0]?.id || 0,
        stage: 'Planning',
        totalAligners: 0,
        alignersCompleted: 0,
        currentPhase: 'Initial',
        hasRefinements: false,
        startDate: new Date().toISOString().split('T')[0],
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const caseData: AlignerCase = {
      id: editingCase?.id || Date.now(),
      patientId: formData.patientId,
      clinicId: formData.clinicId,
      stage: formData.stage,
      totalAligners: BigInt(formData.totalAligners),
      alignersCompleted: BigInt(formData.alignersCompleted),
      currentPhase: formData.currentPhase,
      hasRefinements: formData.hasRefinements,
      startDate: formData.startDate,
      endDate: editingCase?.endDate,
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
          <h1 className="text-3xl font-bold">Aligner Case Tracking</h1>
          <p className="text-muted-foreground">Monitor aligner treatment progress</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Smile className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alignerCases.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stageCounts.Planning}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stageCounts.Active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Refinement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stageCounts.Refinement}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stageCounts.Completed}</div>
          </CardContent>
        </Card>
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
          <CardTitle>Aligner Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Trays</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No aligner cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((alignerCase) => {
                    const progress = alignerCase.totalAligners > 0
                      ? (Number(alignerCase.alignersCompleted) / Number(alignerCase.totalAligners)) * 100
                      : 0;
                    return (
                      <TableRow key={alignerCase.id}>
                        <TableCell className="font-medium">{getPatientName(alignerCase.patientId)}</TableCell>
                        <TableCell>{alignerCase.stage}</TableCell>
                        <TableCell>
                          {alignerCase.alignersCompleted.toString()}/{alignerCase.totalAligners.toString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
                          </div>
                        </TableCell>
                        <TableCell>{getClinicName(alignerCase.clinicId)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(alignerCase)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCase.mutate(alignerCase.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
            <DialogTitle>{editingCase ? 'Edit Aligner Case' : 'Add New Aligner Case'}</DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAligners">Total Trays Planned *</Label>
                <Input
                  id="totalAligners"
                  type="number"
                  min="0"
                  value={formData.totalAligners}
                  onChange={(e) => setFormData({ ...formData, totalAligners: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alignersCompleted">Current Tray Number *</Label>
                <Input
                  id="alignersCompleted"
                  type="number"
                  min="0"
                  max={formData.totalAligners}
                  value={formData.alignersCompleted}
                  onChange={(e) => setFormData({ ...formData, alignersCompleted: parseInt(e.target.value) || 0 })}
                  required
                />
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
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
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
