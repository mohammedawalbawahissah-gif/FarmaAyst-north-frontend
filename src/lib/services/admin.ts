import api from '../api';
import type { User, FarmerProfile, InvestorProfile, Paginated } from '../../types';

export const adminService = {
  // Users
  listUsers: (params?: Record<string, string>) =>
    api.get<Paginated<User>>('/users/', { params }).then(r => r.data),
  getUser: (id: string) => api.get<User>(`/users/${id}/`).then(r => r.data),
  verifyUser: (id: string) => api.post(`/users/${id}/verify/`).then(r => r.data),
  suspendUser: (id: string) => api.post(`/users/${id}/suspend/`).then(r => r.data),

  // Farmer profiles (admin can browse all)
  listFarmerProfiles: (params?: Record<string, string>) =>
    api.get<Paginated<FarmerProfile>>('/profiles/farmers/', { params }).then(r => r.data),

  // Investor profiles
  listInvestorProfiles: () =>
    api.get<Paginated<InvestorProfile>>('/profiles/investors/').then(r => r.data),
};
