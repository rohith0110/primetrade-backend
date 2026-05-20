import { api } from './api';
import type { Paginated, Trade } from './trades';
import type { User } from './auth-context';

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count: { trades: number };
};

export type AdminTrade = Trade & {
  user: { id: string; email: string; name: string | null };
};

export const adminApi = {
  listUsers: (page = 1) => api<Paginated<AdminUser>>(`/admin/users?page=${page}&pageSize=50`),
  updateUser: (id: string, input: { role?: 'USER' | 'ADMIN'; name?: string | null }) =>
    api<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteUser: (id: string) => api<void>(`/admin/users/${id}`, { method: 'DELETE' }),
  listTrades: (page = 1) => api<Paginated<AdminTrade>>(`/admin/trades?page=${page}&pageSize=50`),
  stats: () => api<{ users: number; trades: number; openTrades: number }>('/admin/stats'),
};
