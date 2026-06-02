import api from '../api';
import type { TrainingModule, TrainingEnrolment, Paginated } from '../../types';

export const trainingService = {
  listModules: (params?: Record<string, string>) =>
    api.get<Paginated<TrainingModule>>('/training/modules/', { params }).then(r => r.data),
  getModule: (id: string) =>
    api.get<TrainingModule>(`/training/modules/${id}/`).then(r => r.data),
  createModule: (data: FormData) =>
    api.post<TrainingModule>('/training/modules/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  listEnrolments: () =>
    api.get<Paginated<TrainingEnrolment>>('/training/enrolments/').then(r => r.data),
  enrol: (module: string) =>
    api.post<TrainingEnrolment>('/training/enrolments/', { module }).then(r => r.data),
  updateProgress: (id: string, progress_pct: number) =>
    api.post<TrainingEnrolment>(`/training/enrolments/${id}/update_progress/`, { progress_pct }).then(r => r.data),
};
