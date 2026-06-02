import api from '../api';
import type { RepaymentSchedule, Disbursement, Paginated } from '../../types';

export interface RepayPayload {
  schedule_id: string;
  method: 'momo' | 'paystack';
  phone_number?: string;
}

export const paymentsService = {
  listSchedules: (params?: Record<string, string>) =>
    api.get<Paginated<RepaymentSchedule>>('/payments/schedules/', { params }).then(r => r.data),
  getSchedule: (id: string) =>
    api.get<RepaymentSchedule>(`/payments/schedules/${id}/`).then(r => r.data),

  initiateRepayment: (data: RepayPayload) =>
    api.post('/payments/initiate-repayment/', data).then(r => r.data),

  listDisbursements: () =>
    api.get<Paginated<Disbursement>>('/payments/disbursements/').then(r => r.data),
  createDisbursement: (data: Partial<Disbursement>) =>
    api.post<Disbursement>('/payments/disbursements/', data).then(r => r.data),
};
