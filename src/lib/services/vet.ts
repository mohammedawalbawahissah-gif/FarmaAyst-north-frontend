import api from '../api';
import type { VetProfile, VetService, VetBooking, Paginated } from '../../types';

export interface VetBookingPayload {
  vet: string; farm?: string; service?: string;
  booking_date: string;
  visit_type: 'on_farm' | 'clinic' | 'telemedicine';
  issue_description: string;
}

export const vetService = {
  listVets: (params?: Record<string, string>) =>
    api.get<Paginated<VetProfile>>('/vet/profiles/', { params }).then(r => r.data),
  listPendingVets: () =>
    api.get<Paginated<VetProfile>>('/vet/profiles/', { params: { approval_status: 'pending' } }).then(r => r.data),
  getVet: (id: string) =>
    api.get<VetProfile>(`/vet/profiles/${id}/`).then(r => r.data),
  deleteVet: (id: string) =>
    api.delete(`/vet/profiles/${id}/`).then(r => r.data),
  listServices: (params?: Record<string, string>) =>
    api.get<Paginated<VetService>>('/vet/services/', { params }).then(r => r.data),
  listBookings: () =>
    api.get<Paginated<VetBooking>>('/vet/bookings/').then(r => r.data),
  createBooking: (data: VetBookingPayload) =>
    api.post<VetBooking>('/vet/bookings/', data).then(r => r.data),
  cancelBooking: (id: string) =>
    api.post<VetBooking>(`/vet/bookings/${id}/cancel/`).then(r => r.data),
  getMyProfile: () =>
    api.get<VetProfile>('/vet/profiles/me/').then(r => r.data),
  updateMyProfile: (data: Partial<VetProfile>) =>
    api.patch<VetProfile>('/vet/profiles/me/', data).then(r => r.data),
  listMyServices: () =>
    api.get<Paginated<VetService>>('/vet/services/my_services/').then(r => r.data),
  createService: (data: Partial<VetService>) =>
    api.post<VetService>('/vet/services/', data).then(r => r.data),
  updateService: (id: string, data: Partial<VetService>) =>
    api.patch<VetService>(`/vet/services/${id}/`, data).then(r => r.data),
  deleteService: (id: string) =>
    api.delete(`/vet/services/${id}/`),
  listMyBookings: () =>
    api.get<Paginated<VetBooking>>('/vet/bookings/my_bookings/').then(r => r.data),
  confirmBooking: (id: string) =>
    api.post<VetBooking>(`/vet/bookings/${id}/confirm/`).then(r => r.data),
  completeBooking: (id: string, vet_notes: string) =>
    api.post<VetBooking>(`/vet/bookings/${id}/complete/`, { vet_notes }).then(r => r.data),
  approveVet: (id: string) =>
    api.post<VetProfile>(`/vet/profiles/${id}/approve/`).then(r => r.data),
  suspendVet: (id: string) =>
    api.post<VetProfile>(`/vet/profiles/${id}/suspend/`).then(r => r.data),
};
