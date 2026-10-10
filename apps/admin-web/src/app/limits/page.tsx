'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Toast from '../../components/Toast';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { getActivityLogsApi, type ActivityLogItem } from '../../lib/logs.service';
import type { DashboardStatsData } from '../../lib/dashboard.service';

function SettingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-2">
          <div className="h-4 w-56 bg-slate-200 rounded" />
          <div className="h-3 w-80 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-40 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="h-3 w-48 bg-slate-100 rounded" />
          <div className="h-10 w-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-36 bg-slate-100 rounded" />
          <div className="h-10 w-full bg-slate-200 rounded-xl" />
        </div>
        <div className="h-10 w-48 bg-slate-100 rounded-xl mt-5" />
      </div>
    </div>
  );
}

export default function LimitsAndAiPage() {
  const [defaultDailyQuota, setDefaultDailyQuota] = useState<number>(25);
  const [defaultModelTier, setDefaultModelTier] = useState<'FLASH' | 'PRO' | 'AUTO'>('AUTO');
  const [enableFallbackCache, setEnableFallbackCache] = useState<boolean>(true);
  const [aiActivity, setAiActivity] = useState<ActivityLogItem[]>([]);
  const [isActivityAvailable, setIsActivityAvailable] = useState(false);
  const [activeTeacherCount, setActiveTeacherCount] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDefault, setIsSavingDefault] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tải cấu hình AI mặc định toàn hệ thống
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [limitsResult, activityResult, dashboardResult] = await Promise.allSettled([
        apiFetch<any>('/admin/system-limits'),
        getActivityLogsApi({ category: 'AI_QUIZ', limit: 100 }),
        apiFetch<DashboardStatsData>('/admin/dashboard-stats'),
      ]);

      if (limitsResult.status === 'fulfilled' && limitsResult.value.data) {
        setDefaultDailyQuota(limitsResult.value.data.gemini_ai_daily_quota_per_teacher || 25);
        const modelStr = limitsResult.value.data.ai_model || 'AUTO';
        setDefaultModelTier(
          modelStr.includes('pro') ? 'PRO' : modelStr.includes('flash') ? 'FLASH' : 'AUTO'
        );
        setEnableFallbackCache(limitsResult.value.data.enable_fallback_cache ?? true);
      }
      if (activityResult.status === 'fulfilled') {
        setAiActivity(activityResult.value.items);
        setIsActivityAvailable(activityResult.value.isLive);
      } else {
        setAiActivity([]);
        setIsActivityAvailable(false);
      }
      if (dashboardResult.status === 'fulfilled' && dashboardResult.value.success) {
        setActiveTeacherCount(dashboardResult.value.data?.kpi?.total_users?.teachers_count ?? null);
      }
    } catch (e) {
      console.warn('Lỗi tải dữ liệu Quota AI:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const aiUsageStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        label: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date),
        date,
        calls: 0,
      };
    });

    const knownDays = new Map(days.map((day) => [day.key, day]));
    const validActivities = aiActivity.filter((activity) => activity.category === 'AI_QUIZ');
    validActivities.forEach((activity) => {
      const timestamp = new Date(activity.timestampISO);
      if (Number.isNaN(timestamp.getTime())) return;
      const key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`;
      const day = knownDays.get(key);
      if (day) day.calls += 1;
    });

    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const dailyCapacity = activeTeacherCount === null ? null : activeTeacherCount * defaultDailyQuota;
    const todayCalls = knownDays.get(todayKey)?.calls ?? 0;
    return {
      days,
      todayCalls,
      weekCalls: days.reduce((sum, day) => sum + day.calls, 0),
      dailyCapacity,
      percentUsed: dailyCapacity && dailyCapacity > 0 ? Math.min(100, Math.round((todayCalls / dailyCapacity) * 100)) : 0,
      maxDailyCalls: Math.max(1, ...days.map((day) => day.calls)),
      recent: [...validActivities]
        .filter((activity) => !Number.isNaN(new Date(activity.timestampISO).getTime()))
        .sort((left, right) => new Date(right.timestampISO).getTime() - new Date(left.timestampISO).getTime())
        .slice(0, 8),
    };
  }, [aiActivity, activeTeacherCount, defaultDailyQuota]);

  // 2. Lưu cấu hình mặc định toàn trường
  const handleSaveDefaults = async () => {
    setIsSavingDefault(true);
    try {
      const res = await apiFetch('/admin/system-limits', {
        method: 'PUT',
        body: JSON.stringify({
          gemini_ai_daily_quota_per_teacher: defaultDailyQuota,
          ai_model: defaultModelTier === 'PRO' ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
          enable_fallback_cache: enableFallbackCache,
        }),
      });

      if (res.success) {
        showToast('Đã lưu cấu hình hạn ngạch AI mặc định toàn trường');
      } else {
        showToast(res.error || 'Lỗi lưu cấu hình');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ');
    } finally {
      setIsSavingDefault(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-8 min-h-screen">
      {/* Toast Notification (Text Only) */}
      {toastMessage && (
        <Toast message={toastMessage} />
      )}

      {/* Breadcrumbs & Header Section */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
            <Link className="hover:text-slate-900 transition-colors" href="/">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Hạn ngạch Gemini AI</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản trị Hạn ngạch Gemini AI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cấu hình hạn mức và mô hình AI mặc định cho toàn trường.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer"
            type="button"
          >
            {isLoading ? 'Đang tải...' : 'Làm mới dữ liệu'}
          </button>
        </div>
      </section>

      {/* Thống kê mức sử dụng Gemini AI */}
      <section className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Thống kê sử dụng AI</h2>
            <p className="mt-1 text-xs text-slate-500">
              {isActivityAvailable ? 'Tổng hợp từ tối đa 100 nhật ký AI gần nhất.' : 'Chưa kết nối được nhật ký sử dụng AI.'}
            </p>
          </div>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActivityAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActivityAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {isActivityAvailable ? 'Nhật ký đang hoạt động' : 'Chưa có dữ liệu trực tiếp'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Lượt gọi hôm nay', value: aiUsageStats.todayCalls, note: 'Theo nhật ký hiện có', icon: 'today' },
            { label: 'Lượt gọi 7 ngày', value: aiUsageStats.weekCalls, note: 'Trong 7 ngày gần nhất', icon: 'date_range' },
            { label: 'Hạn mức mỗi giáo viên', value: `${defaultDailyQuota}`, note: 'Lượt gọi mỗi ngày', icon: 'person' },
            { label: 'Tổng quota mỗi ngày', value: aiUsageStats.dailyCapacity === null ? '—' : aiUsageStats.dailyCapacity.toLocaleString('vi-VN'), note: activeTeacherCount === null ? 'Chưa tải được số tài khoản' : `${activeTeacherCount.toLocaleString('vi-VN')} tài khoản được tính quota`, icon: 'bolt' },
          ].map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{isLoading ? '—' : metric.value}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{metric.note}</p>
                </div>
                <span className="material-symbols-outlined rounded-xl bg-blue-50 p-2 text-xl text-blue-600">{metric.icon}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lượt gọi theo ngày</h3>
                <p className="mt-1 text-xs text-slate-500">7 ngày gần nhất, tính từ nhật ký AI đã ghi nhận.</p>
              </div>
              <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">{aiUsageStats.weekCalls} lượt</span>
            </div>
            <div className="mt-7 grid h-48 grid-cols-7 gap-3 border-b border-slate-100 px-1 sm:gap-5">
              {aiUsageStats.days.map((day) => {
                const barHeight = day.calls === 0 ? 3 : Math.max(10, Math.round((day.calls / aiUsageStats.maxDailyCalls) * 100));
                return (
                  <div key={day.key} className="flex min-w-0 flex-col items-center justify-end gap-2">
                    <span className="text-[10px] font-semibold text-slate-500">{day.calls || ''}</span>
                    <div className="flex h-32 w-full items-end justify-center rounded-t-md bg-slate-50">
                      <div
                        className={`w-full max-w-8 rounded-t-md transition-all ${day.calls ? 'bg-blue-500' : 'bg-slate-200'}`}
                        style={{ height: `${barHeight}%` }}
                        title={`${day.date.toLocaleDateString('vi-VN')}: ${day.calls} lượt`}
                      />
                    </div>
                    <span className="mb-2 truncate text-[10px] font-medium text-slate-400">{day.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <span>Hạn mức ngày theo cấu hình</span>
              <span className="font-semibold text-slate-700">
                {aiUsageStats.dailyCapacity === null ? '—' : `${aiUsageStats.dailyCapacity.toLocaleString('vi-VN')} lượt`}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${aiUsageStats.percentUsed}%` }} />
            </div>
            <p className="mt-1.5 text-right text-[10px] text-slate-400">{aiUsageStats.percentUsed}% quota tổng đã dùng hôm nay (theo nhật ký)</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hoạt động AI gần đây</h3>
              <p className="mt-1 text-xs text-slate-500">Các lượt tạo nội dung được ghi nhận gần nhất.</p>
            </div>
            {aiUsageStats.recent.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100">
                {aiUsageStats.recent.map((activity) => (
                  <div key={activity.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-1 text-xs font-semibold text-slate-700">{activity.action || 'Tạo nội dung bằng AI'}</p>
                      <span className={`shrink-0 text-[10px] font-semibold ${activity.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {activity.statusLabel || activity.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{activity.target || activity.details || '—'}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{new Date(activity.timestampISO).toLocaleString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
                <span className="material-symbols-outlined text-2xl text-slate-300">query_stats</span>
                <p className="mt-2 text-xs font-semibold text-slate-600">Chưa có nhật ký sử dụng AI</p>
                <p className="mt-1 text-[11px] text-slate-400">Biểu đồ sẽ cập nhật khi hệ thống ghi nhận hoạt động.</p>
              </div>
            )}
          </article>
        </div>
      </section>

      {/* KHỐI 1: CẤU HÌNH QUOTA MẶC ĐỊNH TOÀN TRƯỜNG */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {isLoading ? (
          <SettingSkeleton />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Cấu hình Hạn ngạch Mặc định Toàn trường
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Áp dụng cho các tài khoản giáo viên mới hoặc các giáo viên chưa được thiết lập hạn ngạch riêng.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveDefaults}
                disabled={isSavingDefault}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto disabled:opacity-60"
              >
                {isSavingDefault ? 'Đang lưu...' : 'Lưu cấu hình mặc định'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hạn ngạch mặc định / ngày / giáo viên
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    className="w-24 px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-center"
                    type="number"
                    min="5"
                    max="200"
                    value={defaultDailyQuota}
                    onChange={(e) => setDefaultDailyQuota(Number(e.target.value))}
                  />
                  <span className="text-xs text-slate-500">lượt / ngày</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cấp độ Mô hình AI mặc định
                </label>
                <select
                  value={defaultModelTier}
                  onChange={(e) => setDefaultModelTier(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 cursor-pointer"
                >
                  <option value="AUTO">Tự động (Khuyên dùng - Cân bằng tốc độ &amp; chất lượng)</option>
                  <option value="FLASH">Gemini 1.5 Flash (Tốc độ cao, tiết kiệm quota)</option>
                  <option value="PRO">Gemini 1.5 Pro (Suy luận sâu, đề thi khó)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableFallbackCache}
                    onChange={(e) => setEnableFallbackCache(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 text-slate-900 border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 select-none">
                    Bật dự phòng thông minh khi chạm ngưỡng ngày
                  </span>
                </label>
              </div>
            </div>
          </>
        )}
      </section>

    </main>
  );
}
