import api from '../api';
import type { Notification, Paginated } from '../../types';

export const notificationsService = {
  list: () => api.get<Paginated<Notification>>('/notifications/').then(r => r.data),
  unreadCount: () => api.get<{ unread: number }>('/notifications/unread_count/').then(r => r.data),
  markRead: (id: string) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
};
