import api from '../api';
import type { InputDealerProfile, FarmInput, Paginated } from '../../types';

export const inputDealerService = {
  listInputs: (params?: Record<string, string>) =>
    api.get<Paginated<FarmInput>>('/inputs/listings/', { params }).then(r => r.data),
  getInput: (id: string) =>
    api.get<FarmInput>(`/inputs/listings/${id}/`).then(r => r.data),
  listDealers: (params?: Record<string, string>) =>
    api.get<Paginated<InputDealerProfile>>('/inputs/dealers/', { params }).then(r => r.data),
  listPendingDealers: () =>
    api.get<Paginated<InputDealerProfile>>('/inputs/dealers/', { params: { approval_status: 'pending' } }).then(r => r.data),
  getMyProfile: () =>
    api.get<InputDealerProfile>('/inputs/dealers/me/').then(r => r.data),
  updateMyProfile: (data: Partial<InputDealerProfile>) =>
    api.patch<InputDealerProfile>('/inputs/dealers/me/', data).then(r => r.data),
  listMyListings: () =>
    api.get<Paginated<FarmInput>>('/inputs/listings/my_listings/').then(r => r.data),
  createListing: (data: FormData) =>
    api.post<FarmInput>('/inputs/listings/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  updateListing: (id: string, data: FormData | Partial<FarmInput>) =>
    api.patch<FarmInput>(`/inputs/listings/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then(r => r.data),
  deleteListing: (id: string) =>
    api.delete(`/inputs/listings/${id}/`),
  approveDealer: (id: string) =>
    api.post<InputDealerProfile>(`/inputs/dealers/${id}/approve/`).then(r => r.data),
  suspendDealer: (id: string) =>
    api.post<InputDealerProfile>(`/inputs/dealers/${id}/suspend/`).then(r => r.data),
  deleteDealer: (id: string) =>
    api.delete(`/inputs/dealers/${id}/`).then(r => r.data),
};
