import { useState, useMemo } from 'react';
import { useGetAllPatients, useGetAllTreatments, useGetAllClinics } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Activity, Clock, CheckCircle, AlertTriangle, RefreshCw, Plus, Search, Edit, ListChecks } from 'lucide-react';
import { TreatmentModals } from '../components/dashboard/TreatmentModals';
import { TreatmentQuickActions } from '../components/dashboard/TreatmentQuickActions';
import { RightSidebar } from '../components/dashboard/RightSidebar';
import { calculatePendingUnits, formatTeethForDisplay } from '../utils/treatmentProgress';
import { groupRemainingWorkByType } from '../utils/analytics';
import type { TreatmentView } from '../backend';

const TREATMENT_TYPES = [
  'All',
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

const ITEMS_PER_PAGE = 15;

export function DashboardPage() {
  const { data: patients = [], refetch: refetchPatients } = useGetAllPatients();
  const { data: treatments = [], refetch: refetchTreatments } = useGetAllTreatments();
  const { data: clinics = [] } = useGetAllClinics();

  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'schedule' | null;
    treatment?: TreatmentView;
  }>({ type: null });

  const handleRefresh = () => {
    refetchPatients();
    refetchTreatments();
  };

  // KPI calculations
  const totalPatients = patients.length;
  const inTreatment = treatments.filter((t) => t.status === 'in_progress').length;
  const pending = treatments.filter((t) => t.status === 'pending').length;
  const completed = treatments.filter((t) => t.status === 'completed').length;
  const overdue = 0;

  // Treatment type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TREATMENT_TYPES.forEach((type) => {
      if (type === 'All') {
        counts[type] = treatments.length;
      } else {
        counts[type] = treatments.filter((t) => t.type === type).length;
      }
    });
    return counts;
  }, [treatments]);

  // Remaining work by type
  const remainingWork = useMemo(() => groupRemainingWorkByType(treatments), [treatments]);

  // Filtered treatments
  const filteredTreatments = useMemo(() => {
    return treatments.filter((treatment) => {
      const typeMatch = selectedType === 'All' || treatment.type === selectedType;
      const statusMatch = selectedStatus === 'All' || treatment.status === selectedStatus;

      const patient = patients.find((p) => p.id === treatment.patientId);
      const searchMatch =
        !searchQuery ||
        patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient?.phoneNumber.includes(searchQuery);

      return typeMatch && statusMatch && searchMatch;
    });
  }, [treatments, patients, selectedType, selectedStatus, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTreatments.length / ITEMS_PER_PAGE);
  const paginatedTreatments = filteredTreatments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPatientName = (patientId: number) => {
    return patients.find((p) => p.id === patientId)?.name || 'Unknown';
  };

  const getClinicName = (clinicId: number) => {
    return clinics.find((c) => c.id === clinicId)?.name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
      pending: { variant: 'secondary', label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
      approved: { variant: 'outline', label: 'Approved' },
      in_progress: { variant: 'default', label: 'In Progress', className: 'bg-teal-600 hover:bg-teal-700' },
      completed: { variant: 'outline', label: 'Completed', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Operations Dashboard</h1>
            <p className="text-muted-foreground">Monitor treatments, follow-ups, and patient care</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setModalState({ type: 'add' })} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Treatment
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPatients}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Treatment</CardTitle>
              <Activity className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inTreatment}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pending}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-600 to-slate-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Remaining Work Summary */}
        {remainingWork.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-teal-600" />
                Remaining Work by Treatment Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {remainingWork.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium text-sm">{item.type}</span>
                    <Badge variant="secondary" className="ml-2">
                      {item.pendingUnits} pending
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Treatment Type Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              Filter by Treatment Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TREATMENT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedType(type);
                    setCurrentPage(1);
                  }}
                  className={selectedType === type ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  {type}
                  <Badge variant="secondary" className="ml-2">
                    {typeCounts[type] || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Treatments Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>
                All Treatments
                <Badge variant="secondary" className="ml-2">
                  {filteredTreatments.length}
                </Badge>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name or phone..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Teeth</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Clinic</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTreatments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No treatments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTreatments.map((treatment) => {
                      const pending = calculatePendingUnits(treatment.totalUnitsNeeded, treatment.unitsCompleted);
                      const teethDisplay = formatTeethForDisplay(treatment.teeth);
                      
                      return (
                        <TableRow key={treatment.id}>
                          <TableCell className="font-medium">{getPatientName(treatment.patientId)}</TableCell>
                          <TableCell>{treatment.type}</TableCell>
                          <TableCell>
                            {teethDisplay ? (
                              <span className="text-xs text-muted-foreground">{teethDisplay}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">
                                {Number(treatment.unitsCompleted)} / {Number(treatment.totalUnitsNeeded)}
                              </span>
                              {pending > 0 && (
                                <Badge variant="outline" className="w-fit text-xs">
                                  {pending} pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{treatment.doctor}</TableCell>
                          <TableCell>{getStatusBadge(treatment.status)}</TableCell>
                          <TableCell>{treatment.startDate}</TableCell>
                          <TableCell>{getClinicName(treatment.clinicId)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalState({ type: 'edit', treatment })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <TreatmentQuickActions treatment={treatment} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RightSidebar />

      <TreatmentModals
        modalState={modalState}
        onClose={() => setModalState({ type: null })}
        patients={patients}
        clinics={clinics}
      />
    </div>
  );
}
