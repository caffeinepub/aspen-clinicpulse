import { useState, useMemo } from 'react';
import {
  useGetAllPatientFeedback,
  useGetAllPatients,
  useGetAllClinics,
  useAddPatientFeedback,
  useUpdatePatientFeedback,
  useDeletePatientFeedback,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, RefreshCw, Search, ThumbsUp, Minus, ThumbsDown, Star, Trash2, Pencil } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getActorErrorMessage } from '../utils/actorError';
import type { PatientFeedback, NewPatientFeedbackView } from '../backend';

type ModalMode = 'add' | 'edit';

export function PatientFeedbackPage() {
  const { data: feedbacks = [], refetch } = useGetAllPatientFeedback();
  const { data: patients = [] } = useGetAllPatients();
  const { data: clinics = [] } = useGetAllClinics();
  const addFeedback = useAddPatientFeedback();
  const updateFeedback = useUpdatePatientFeedback();
  const deleteFeedback = useDeletePatientFeedback();

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingFeedback, setEditingFeedback] = useState<PatientFeedback | null>(null);
  const [error, setError] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    patientId: 0,
    clinicId: 0,
    rating: 5,
    feedback: '',
    googleReviewCompleted: false,
  });

  const stats = useMemo(() => {
    return {
      good: feedbacks.filter((f) => f.rating >= 4).length,
      average: feedbacks.filter((f) => f.rating === 3).length,
      bad: feedbacks.filter((f) => f.rating <= 2).length,
      reviewsCompleted: feedbacks.filter((f) => f.googleReviewCompleted).length,
    };
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const patient = patients.find((p) => p.id === feedback.patientId);
      const searchMatch =
        !searchQuery || patient?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let ratingMatch = true;
      if (ratingFilter === 'Good') ratingMatch = feedback.rating >= 4;
      else if (ratingFilter === 'Average') ratingMatch = feedback.rating === 3;
      else if (ratingFilter === 'Bad') ratingMatch = feedback.rating <= 2;

      return searchMatch && ratingMatch;
    });
  }, [feedbacks, patients, searchQuery, ratingFilter]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingFeedback(null);
    setFormData({
      patientId: patients[0]?.id || 0,
      clinicId: clinics[0]?.id || 0,
      rating: 5,
      feedback: '',
      googleReviewCompleted: false,
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (feedback: PatientFeedback) => {
    setModalMode('edit');
    setEditingFeedback(feedback);
    setFormData({
      patientId: feedback.patientId,
      clinicId: feedback.clinicId,
      rating: feedback.rating,
      feedback: feedback.feedback,
      googleReviewCompleted: feedback.googleReviewCompleted,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (modalMode === 'add') {
        // Create new feedback - backend generates ID
        const newFeedbackView: NewPatientFeedbackView = {
          patientId: formData.patientId,
          clinicId: formData.clinicId,
          rating: formData.rating,
          feedback: formData.feedback,
          googleReviewCompleted: formData.googleReviewCompleted,
          date: new Date().toISOString().split('T')[0],
        };

        await addFeedback.mutateAsync(newFeedbackView);
        setModalOpen(false);
      } else {
        // Update existing feedback
        if (!editingFeedback) return;

        const updatedFeedback: PatientFeedback = {
          id: editingFeedback.id,
          patientId: formData.patientId,
          clinicId: formData.clinicId,
          rating: formData.rating,
          feedback: formData.feedback,
          googleReviewCompleted: formData.googleReviewCompleted,
          date: editingFeedback.date, // Preserve original date
        };

        await updateFeedback.mutateAsync(updatedFeedback);
        setModalOpen(false);
      }
    } catch (err) {
      setError(getActorErrorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteFeedback.mutateAsync(id);
    } catch (err) {
      setError(getActorErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const getPatientName = (patientId: number) => {
    return patients.find((p) => p.id === patientId)?.name || 'Unknown';
  };

  const getExperienceLabel = (rating: number) => {
    if (rating >= 4) return { label: 'Good', color: 'text-green-600' };
    if (rating === 3) return { label: 'Average', color: 'text-amber-600' };
    return { label: 'Bad', color: 'text-red-600' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Feedback & Reviews</h1>
          <p className="text-muted-foreground">Track patient experiences and Google review conversions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleOpenAddModal} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Feedback
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Star className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{feedbacks.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Good</CardTitle>
            <ThumbsUp className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.good}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <Minus className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.average}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bad</CardTitle>
            <ThumbsDown className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.bad}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews Done</CardTitle>
            <Star className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.reviewsCompleted}</div>
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
                placeholder="Search by patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Ratings">All Ratings</SelectItem>
                <SelectItem value="Good">Good (4-5)</SelectItem>
                <SelectItem value="Average">Average (3)</SelectItem>
                <SelectItem value="Bad">Bad (1-2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Feedback Notes</TableHead>
                  <TableHead>Review Completed</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No feedback recorded yet. Add your first patient feedback!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedbacks.map((feedback) => {
                    const experience = getExperienceLabel(feedback.rating);
                    const isDeleting = deletingId === feedback.id;
                    return (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-medium">{getPatientName(feedback.patientId)}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${experience.color}`}>{experience.label}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{feedback.rating}/5</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{feedback.feedback}</TableCell>
                        <TableCell>
                          {feedback.googleReviewCompleted ? (
                            <span className="text-green-600">✓ Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>{feedback.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModal(feedback)}
                              disabled={isDeleting}
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(feedback.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : 'text-destructive'}`} />
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

      {/* Add/Edit Feedback Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{modalMode === 'add' ? 'Add Patient Feedback' : 'Edit Patient Feedback'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
              <Label htmlFor="rating">Rating (1-5) *</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger id="rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback Notes</Label>
              <Textarea
                id="feedback"
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                placeholder="Enter patient feedback..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="googleReview"
                checked={formData.googleReviewCompleted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, googleReviewCompleted: checked as boolean })
                }
              />
              <Label htmlFor="googleReview" className="cursor-pointer">
                Google Review Completed
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={addFeedback.isPending || updateFeedback.isPending}
              >
                {addFeedback.isPending || updateFeedback.isPending
                  ? 'Saving...'
                  : modalMode === 'add'
                    ? 'Add Feedback'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
