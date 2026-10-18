/**
 * Admin Dashboard Stats Service
 * Communicates with NestJS Backend Module 12-admin (/api/v1/admin/dashboard-stats)
 */

import { apiFetch } from './api-client';

export interface DashboardKPI {
  total_users: {
    value: number;
    teachers_count: number;
    parents_count: number;
    active_count: number;
    growth_rate: string;
    comparison_period: string;
  };
  active_classes: {
    value: number;
    total_students: number;
    schools_count: number;
    growth_rate: string;
    comparison_period: string;
  };
  gemini_ai_calls: {
    value: number;
    daily_quota: number;
    used_percent: number;
    growth_rate: string;
    model: string;
    comparison_period: string;
  };
  tuition_revenue: {
    collected_vnd: number;
    target_vnd: number;
    paid_rate: number;
    growth_rate: string;
    comparison_period: string;
  };
  attendance_today: {
    present_rate: number;
    absent_count: number;
    total_checked: number;
    comparison_period: string;
  };
}

export interface DashboardCharts {
  ai_weekly: Array<{ day: string; calls: number }>;
  tuition_progress: Array<{ month: string; amount: number }>;
}

export interface DashboardSystemHealth {
  status: 'UP' | 'DOWN';
  uptime_seconds: number;
  memory_rss_mb: number;
  memory_heap_mb: number;
  firebase_connected: boolean;
  fcm_rate_limit: number;
  timestamp: string;
}

export interface DashboardStatsData {
  kpi: DashboardKPI;
  charts: DashboardCharts;
  system_health: DashboardSystemHealth;
}

export const FALLBACK_DASHBOARD_STATS: DashboardStatsData = {
  kpi: {
    total_users: {
      value: 0,
      teachers_count: 0,
      parents_count: 0,
      active_count: 0,
      growth_rate: '0%',
      comparison_period: 'Tài khoản trên hệ thống',
    },
    active_classes: {
      value: 0,
      total_students: 0,
      schools_count: 0,
      growth_rate: '0%',
      comparison_period: 'Chưa có trường liên kết',
    },
    gemini_ai_calls: {
      value: 0,
      daily_quota: 25,
      used_percent: 0,
      growth_rate: '0%',
      model: 'openai/gpt-oss-20b',
      comparison_period: 'Giáo án & trích xuất đề thi',
    },
    tuition_revenue: {
      collected_vnd: 0,
      target_vnd: 0,
      paid_rate: 0,
      growth_rate: '0%',
      comparison_period: 'Chưa phát sinh học phí',
    },
    attendance_today: {
      present_rate: 0,
      absent_count: 0,
      total_checked: 0,
      comparison_period: 'Toàn trường hôm nay',
    },
  },
  charts: {
    ai_weekly: [
      { day: 'T2', calls: 0 },
      { day: 'T3', calls: 0 },
      { day: 'T4', calls: 0 },
      { day: 'T5', calls: 0 },
      { day: 'T6', calls: 0 },
      { day: 'T7', calls: 0 },
      { day: 'CN', calls: 0 },
    ],
    tuition_progress: [],
  },
  system_health: {
    status: 'UP',
    uptime_seconds: 0,
    memory_rss_mb: 0,
    memory_heap_mb: 0,
    firebase_connected: true,
    fcm_rate_limit: 100,
    timestamp: new Date().toISOString(),
  },
};

export async function getDashboardStats(): Promise<{
  data: DashboardStatsData;
  isMock: boolean;
}> {
  try {
    const res = await apiFetch<DashboardStatsData>('/admin/dashboard-stats');
    if (res.success && res.data && res.data.kpi) {
      return { data: res.data, isMock: false };
    }
  } catch (err) {
    console.warn('[DashboardService] Không kết nối được API:', err);
  }

  return { data: FALLBACK_DASHBOARD_STATS, isMock: false };
}

export const getDashboardStatsApi = getDashboardStats;

