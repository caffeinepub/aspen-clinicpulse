import { useMemo } from 'react';
import { useGetAllClinics, useGetAllPatients, useGetAllTreatments } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';
import {
  groupTreatmentsByMonth,
  calculateStatusDistribution,
  rankDoctorsByVolume,
  formatMonthKey,
  formatStatusLabel,
} from '../utils/analytics';

export function ZonalAnalyticsPage() {
  const { data: clinics = [] } = useGetAllClinics();
  const { data: patients = [] } = useGetAllPatients();
  const { data: treatments = [] } = useGetAllTreatments();

  const clinicStats = useMemo(() => {
    return clinics.map((clinic) => {
      const clinicPatients = patients.filter((p) => p.clinicId === clinic.id);
      const clinicTreatments = treatments.filter((t) => t.clinicId === clinic.id);
      return {
        name: clinic.name,
        patients: clinicPatients.length,
        treatments: clinicTreatments.length,
      };
    });
  }, [clinics, patients, treatments]);

  const treatmentTypeStats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    treatments.forEach((treatment) => {
      typeCounts[treatment.type] = (typeCounts[treatment.type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
  }, [treatments]);

  const statusDistribution = useMemo(() => calculateStatusDistribution(treatments), [treatments]);

  const monthlyTrends = useMemo(() => groupTreatmentsByMonth(treatments), [treatments]);

  const topDoctors = useMemo(() => rankDoctorsByVolume(treatments).slice(0, 10), [treatments]);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Illustration */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800">
        <div className="relative z-10 p-8">
          <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-100">Zonal Analytics</h1>
          <p className="text-teal-700 dark:text-teal-300 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <img
            src="/assets/generated/analytics-header-illustration.dim_1600x400.png"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
            <BarChart3 className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clinics.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Treatments</CardTitle>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{treatments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Clinic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Health Snapshot</CardTitle>
          <p className="text-sm text-muted-foreground">Patient and treatment volume by clinic</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Treatments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No clinics found
                    </TableCell>
                  </TableRow>
                ) : (
                  clinicStats.map((stat) => (
                    <TableRow key={stat.name}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell>{stat.patients}</TableCell>
                      <TableCell>{stat.treatments}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            Treatment Status Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Breakdown of treatments by current status with percentages
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Visual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusDistribution.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No treatment data available
                    </TableCell>
                  </TableRow>
                ) : (
                  statusDistribution.map((stat) => (
                    <TableRow key={stat.status}>
                      <TableCell className="font-medium">{formatStatusLabel(stat.status)}</TableCell>
                      <TableCell>{stat.count}</TableCell>
                      <TableCell>{stat.percentage}%</TableCell>
                      <TableCell>
                        <div className="w-full max-w-[200px] bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-teal-600 h-full transition-all"
                            style={{ width: `${stat.percentage}%` }}
                          />
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

      {/* Monthly Treatment Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Treatment Trends Over Time
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly treatment volume showing growth patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Treatments Started</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTrends.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No treatment data available
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlyTrends.map((trend, index) => {
                    const maxCount = Math.max(...monthlyTrends.map((t) => t.count));
                    const percentage = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
                    return (
                      <TableRow key={trend.month}>
                        <TableCell className="font-medium">{formatMonthKey(trend.month)}</TableCell>
                        <TableCell>{trend.count}</TableCell>
                        <TableCell>
                          <div className="w-full max-w-[200px] bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
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

      {/* Top Doctors by Volume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-600" />
            Top Doctors by Treatment Volume
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked list of doctors by number of treatments managed
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Treatments</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No doctor data available
                    </TableCell>
                  </TableRow>
                ) : (
                  topDoctors.map((doctor, index) => {
                    const maxCount = topDoctors[0]?.count || 1;
                    const percentage = (doctor.count / maxCount) * 100;
                    return (
                      <TableRow key={doctor.doctor}>
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell>{doctor.doctor}</TableCell>
                        <TableCell>{doctor.count}</TableCell>
                        <TableCell>
                          <div className="w-full max-w-[200px] bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-cyan-600 h-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
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

      {/* Treatment Types */}
      <Card>
        <CardHeader>
          <CardTitle>Treatments by Type</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of treatment categories</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treatment Type</TableHead>
                  <TableHead>Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatmentTypeStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      No treatments found
                    </TableCell>
                  </TableRow>
                ) : (
                  treatmentTypeStats.map((stat) => (
                    <TableRow key={stat.type}>
                      <TableCell className="font-medium">{stat.type}</TableCell>
                      <TableCell>{stat.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
