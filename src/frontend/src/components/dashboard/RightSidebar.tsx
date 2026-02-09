import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertCircle, Sparkles, MessageCircle } from 'lucide-react';
import { useHygieneDuePatients } from '../../hooks/useHygieneDuePatients';
import { useGetFollowUpAnalytics, useGetAllTreatments, useGetAllPatients, useGetAllClinics } from '../../hooks/useQueries';
import { generateWhatsAppLink } from '../../utils/whatsapp';

export function RightSidebar() {
  const { hygieneDuePatients, isLoading: hygieneLoading } = useHygieneDuePatients();
  const { data: followUpAnalytics, isLoading: analyticsLoading } = useGetFollowUpAnalytics();
  const { data: treatments = [] } = useGetAllTreatments();
  const { data: patients = [] } = useGetAllPatients();
  const { data: clinics = [] } = useGetAllClinics();

  const formatLastHygieneDate = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFollowUpDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const todayFollowUps = useMemo(() => {
    if (!followUpAnalytics) return [];
    return followUpAnalytics.followUpsDueToday.map(([treatmentId, date]) => {
      const treatment = treatments.find((t) => t.id === treatmentId);
      const patient = treatment ? patients.find((p) => p.id === treatment.patientId) : null;
      const clinic = treatment ? clinics.find((c) => c.id === treatment.clinicId) : null;
      return {
        treatmentId,
        date,
        patientName: patient?.name || 'Unknown',
        clinicName: clinic?.name || 'Unknown',
        treatmentType: treatment?.type || 'Unknown',
      };
    });
  }, [followUpAnalytics, treatments, patients, clinics]);

  const overdueFollowUps = useMemo(() => {
    if (!followUpAnalytics) return [];
    return followUpAnalytics.overdueFollowUps.map(([treatmentId, date]) => {
      const treatment = treatments.find((t) => t.id === treatmentId);
      const patient = treatment ? patients.find((p) => p.id === treatment.patientId) : null;
      const clinic = treatment ? clinics.find((c) => c.id === treatment.clinicId) : null;
      return {
        treatmentId,
        date,
        patientName: patient?.name || 'Unknown',
        clinicName: clinic?.name || 'Unknown',
        treatmentType: treatment?.type || 'Unknown',
      };
    });
  }, [followUpAnalytics, treatments, patients, clinics]);

  return (
    <aside className="hidden xl:block w-80 border-l bg-muted/30 overflow-y-auto p-6 space-y-6">
      {/* Today's Follow-ups */}
      <Card className="border-teal-200 bg-teal-50/50 dark:border-teal-900 dark:bg-teal-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-teal-700 dark:text-teal-400">
            <Bell className="h-4 w-4" />
            Today's Follow-ups
            <Badge variant="outline" className="border-teal-600">
              {analyticsLoading ? '...' : todayFollowUps.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : todayFollowUps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No follow-ups due today</p>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3">
                {todayFollowUps.map((item) => (
                  <div
                    key={`${item.treatmentId}-${item.date}`}
                    className="p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{item.patientName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.clinicName}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.treatmentType}</p>
                    <div className="text-xs text-teal-700 dark:text-teal-400 mt-1">
                      Due: {formatFollowUpDate(item.date)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Overdue Follow-ups */}
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            Overdue Follow-ups
            <Badge variant="destructive">
              {analyticsLoading ? '...' : overdueFollowUps.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : overdueFollowUps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All caught up!</p>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3">
                {overdueFollowUps.map((item) => (
                  <div
                    key={`${item.treatmentId}-${item.date}`}
                    className="p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{item.patientName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.clinicName}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.treatmentType}</p>
                    <div className="text-xs text-red-700 dark:text-red-400 mt-1">
                      Due: {formatFollowUpDate(item.date)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Hygiene Reminders */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            Hygiene Reminders (6mo+)
            <Badge variant="outline" className="border-amber-600">
              {hygieneLoading ? '...' : hygieneDuePatients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hygieneLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : hygieneDuePatients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All up to date!</p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {hygieneDuePatients.map((item) => (
                  <div
                    key={item.patient.id}
                    className="p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.patient.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.clinicName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => window.open(generateWhatsAppLink(item.patient.phoneNumber), '_blank')}
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last visit: {formatLastHygieneDate(item.lastHygieneDate)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
