import { apiRequest } from './api-client';

export interface ActivityLogItem {
  id: string;
  time: string;
  timestampISO: string;
  category: 'CLASS_STUDENT' | 'AI_QUIZ' | 'ATTENDANCE' | 'FEES_BHYT' | 'SYSTEM_ADMIN';
  categoryLabel: string;
  action: string;
  target: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
  statusLabel: string;
  metadata?: Record<string, any>;
}

export interface TransactionItem {
  id: string;
  orderCode: string;
  time: string;
  timestampISO: string;
  type: 'AI_PACKAGE' | 'SCHOOL_LICENSE' | 'BHYT_FEE' | 'TUITION_FEE';
  typeLabel: string;
  description: string;
  targetEntity: string;
  amount: number;
  paymentMethod: string;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  statusLabel: string;
  details?: Record<string, any>;
}

export async function getActivityLogsApi(params?: {
  category?: string;
  status?: string;
  limit?: number;
}): Promise<{ items: ActivityLogItem[]; isLive: boolean }> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await apiRequest<ActivityLogItem[]>(`/admin/logs/activities?${query.toString()}`);
    if (Array.isArray(res)) {
      return { items: res, isLive: true };
    }
  } catch (err) {
    console.warn('Lỗi gọi API activity logs:', err);
  }

  return { items: [], isLive: false };
}

export async function getTransactionLogsApi(params?: {
  type?: string;
  status?: string;
  limit?: number;
}): Promise<{ items: TransactionItem[]; isLive: boolean }> {
  try {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await apiRequest<TransactionItem[]>(`/admin/logs/transactions?${query.toString()}`);
    if (Array.isArray(res)) {
      return { items: res, isLive: true };
    }
  } catch (err) {
    console.warn('Lỗi gọi API transaction logs:', err);
  }

  return { items: [], isLive: false };
}
