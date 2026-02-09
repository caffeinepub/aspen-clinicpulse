import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MoreVertical, CheckCircle, Clock, XCircle, Calendar, Loader2, Plus, AlertCircle } from 'lucide-react';
import { useUpdateTreatmentStatus, useScheduleFollowUp, useUpdateTreatmentProgress } from '../../hooks/useQueries';
import { getActorErrorMessage } from '../../utils/actorError';
import { calculatePendingUnits } from '../../utils/treatmentProgress';
import type { TreatmentView } from '../../backend';

interface TreatmentQuickActionsProps {
  treatment: TreatmentView;
}

export function TreatmentQuickActions({ treatment }: TreatmentQuickActionsProps) {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [incrementValue, setIncrementValue] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  const updateStatusMutation = useUpdateTreatmentStatus();
  const scheduleFollowUpMutation = useScheduleFollowUp();
  const updateProgressMutation = useUpdateTreatmentProgress();

  const handleStatusChange = async (newStatus: string) => {
    setStatusError(null);
    try {
      await updateStatusMutation.mutateAsync({ id: treatment.id, status: newStatus });
    } catch (error: any) {
      const errorMessage = getActorErrorMessage(error);
      setStatusError(errorMessage);
      setTimeout(() => setStatusError(null), 5000);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpDate) {
      setScheduleError('Please select a date');
      return;
    }

    setScheduleError(null);
    try {
      await scheduleFollowUpMutation.mutateAsync({ treatmentId: treatment.id, date: followUpDate });
      setScheduleDialogOpen(false);
      setFollowUpDate('');
    } catch (error: any) {
      const errorMessage = getActorErrorMessage(error);
      setScheduleError(errorMessage);
    }
  };

  const handleUpdateProgress = async () => {
    const increment = parseInt(incrementValue, 10);
    
    if (isNaN(increment) || increment <= 0) {
      setProgressError('Please enter a positive number');
      return;
    }

    const currentCompleted = Number(treatment.unitsCompleted);
    const totalNeeded = Number(treatment.totalUnitsNeeded);
    const newCompleted = currentCompleted + increment;

    if (newCompleted > totalNeeded) {
      setProgressError(`Cannot add ${increment} units. Only ${totalNeeded - currentCompleted} units remaining.`);
      return;
    }

    setProgressError(null);
    try {
      await updateProgressMutation.mutateAsync({ id: treatment.id, completedUnits: newCompleted });
      setProgressDialogOpen(false);
      setIncrementValue('');
    } catch (error: any) {
      const errorMessage = getActorErrorMessage(error);
      setProgressError(errorMessage);
    }
  };

  const pendingUnits = calculatePendingUnits(treatment.totalUnitsNeeded, treatment.unitsCompleted);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleStatusChange('pending')}
            disabled={updateStatusMutation.isPending}
          >
            <Clock className="h-4 w-4 mr-2 text-amber-600" />
            Mark as Pending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange('in_progress')}
            disabled={updateStatusMutation.isPending}
          >
            <Loader2 className="h-4 w-4 mr-2 text-teal-600" />
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange('completed')}
            disabled={updateStatusMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProgressDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2 text-teal-600" />
            Add Completed Units
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setScheduleDialogOpen(true)}>
            <Calendar className="h-4 w-4 mr-2 text-teal-600" />
            Schedule Follow-up
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {statusError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg z-50 max-w-md">
          <p className="text-sm">{statusError}</p>
        </div>
      )}

      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Completed Units</DialogTitle>
            <DialogDescription>
              Update progress for this treatment ({pendingUnits} units remaining)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="incrementValue">Units to Add</Label>
              <Input
                id="incrementValue"
                type="number"
                min="1"
                max={pendingUnits}
                value={incrementValue}
                onChange={(e) => setIncrementValue(e.target.value)}
                placeholder={`Max: ${pendingUnits}`}
              />
              <p className="text-xs text-muted-foreground">
                Current: {Number(treatment.unitsCompleted)} / {Number(treatment.totalUnitsNeeded)}
              </p>
            </div>
            {progressError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{progressError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProgress}
              disabled={updateProgressMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {updateProgressMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Progress'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>Add a follow-up date for this treatment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {scheduleError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scheduleError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleFollowUp}
              disabled={scheduleFollowUpMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {scheduleFollowUpMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
