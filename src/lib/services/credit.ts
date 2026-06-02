import api from '../api';
import type { CreditApplication, CreditAgreement, Paginated } from '../../types';

export interface AppPayload {
  credit_type: string; purpose: string; farm?: string;
  amount_requested?: number; repayment_period_months?: number; input_details?: string;
}

export const creditService = {
  // Applications
  listApps: (params?: Record<string, string>) =>
    api.get<Paginated<CreditApplication>>('/credit/applications/', { params }).then(r => r.data),
  getApp: (id: string) =>
    api.get<CreditApplication>(`/credit/applications/${id}/`).then(r => r.data),
  createApp: (data: AppPayload) =>
    api.post<CreditApplication>('/credit/applications/', data).then(r => r.data),
  updateApp: (id: string, data: Partial<AppPayload>) =>
    api.patch<CreditApplication>(`/credit/applications/${id}/`, data).then(r => r.data),
  submitApp: (id: string) =>
    api.post<CreditApplication>(`/credit/applications/${id}/submit/`).then(r => r.data),
  approveApp: (id: string, notes?: string) =>
    api.post<CreditApplication>(`/credit/applications/${id}/approve/`, { notes }).then(r => r.data),
  rejectApp: (id: string, reason: string, notes?: string) =>
    api.post<CreditApplication>(`/credit/applications/${id}/reject/`, { reason, notes }).then(r => r.data),

  // Document upload
  uploadDoc: (appId: string, file: File, doc_type: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('doc_type', doc_type);
    return api.post(`/credit/applications/${appId}/documents/`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Agreements
  listAgreements: () =>
    api.get<Paginated<CreditAgreement>>('/credit/agreements/').then(r => r.data),
  getAgreement: (id: string) =>
    api.get<CreditAgreement>(`/credit/agreements/${id}/`).then(r => r.data),
  signAgreement: (id: string) =>
    api.post<CreditAgreement>(`/credit/agreements/${id}/sign/`).then(r => r.data),
};
