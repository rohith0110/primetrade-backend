import { api } from './api';

export type Trade = {
  id: string;
  userId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  entryPrice: string;
  exitPrice: string | null;
  quantity: string;
  pnl: string | null;
  notes: string | null;
  tags: string[];
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type TradeInput = {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: string;
  quantity: string;
  exitPrice?: string | null;
  notes?: string;
  tags?: string[];
};

export const tradesApi = {
  list: (params: { status?: 'OPEN' | 'CLOSED'; symbol?: string; page?: number; pageSize?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.symbol) q.set('symbol', params.symbol);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return api<Paginated<Trade>>(`/trades${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => api<Trade>(`/trades/${id}`),
  create: (input: TradeInput) =>
    api<Trade>('/trades', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<TradeInput> & { exitPrice?: string | null }) =>
    api<Trade>(`/trades/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => api<void>(`/trades/${id}`, { method: 'DELETE' }),
};
