'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getDashboardStats,
  DashboardStatsData,
  FALLBACK_DASHBOARD_STATS,
} from '../lib/dashboard.service';
import {
  getActivityLogsApi,
  getTransactionLogsApi,
  TransactionItem,
  ActivityLogItem,
} from '../lib/logs.service';
import { formatNumber } from '../lib/format';

// ============================================================
// Skeleton Components — Tránh CLS bằng cách giữ nguyên layout
// dimensions khi data đang load. Cải thiện CLS → 0 và FCP.
// ============================================================

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
        </div>
        <div className="mt-3 h-8 w-20 bg-slate-200 rounded" />
        <div className="mt-2 h-3 w-40 bg-slate-100 rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="h-3 w-28 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-4 border-b border-slate-50">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-2 w-20 bg-slate-100 rounded" />
          </div>
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-5 w-14 bg-slate-100 rounded-full" />
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-2 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-3 w-40 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="mt-6 flex items-center gap-6">
        <div className="w-32 h-32 rounded-full bg-slate-100 border-8 border-slate-50" />
        <div className="flex-1 space-y-3">
          <div className="h-10 bg-slate-50 rounded-xl border border-slate-100" />
          <div className="h-10 bg-slate-50 rounded-xl border border-slate-100" />
          <div className="h-10 bg-slate-50 rounded-xl border border-slate-100" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Dashboard Component
// ============================================================

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStatsData>(FALLBACK_DASHBOARD_STATS);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      setIsLoading(true);
      try {
        // Promise.all → parallel fetch, không có API waterfall
        const [res, txRes, actRes] = await Promise.all([
          getDashboardStats(),
          getTransactionLogsApi({ limit: 5 }),
          getActivityLogsApi({ limit: 5 }),
        ]);
        if (isMounted) {
          setStats(res.data);
          if (txRes.items) setRecentTransactions(txRes.items);
          if (actRes.items) setRecentActivities(actRes.items);
        }
      } catch (e) {
        console.warn('Lỗi tải Dashboard stats:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalUsersCount = stats.kpi.total_users.value;
  const teachersCount = stats.kpi.total_users.teachers_count;
  const parentsCount = stats.kpi.total_users.parents_count;
  const teacherPercent = totalUsersCount > 0 ? Math.round((teachersCount / totalUsersCount) * 100) : 0;
  const parentPercent = totalUsersCount > 0 ? Math.round((parentsCount / totalUsersCount) * 100) : 0;
  const schoolsCount = stats.kpi.active_classes.schools_count || 1;

  return (
    <div
      className="relative min-h-full flex flex-col font-sans selection:bg-blue-600 selection:text-white dot-matrix-bg"
    >
      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 w-full px-6 lg:px-8 py-6 space-y-6 flex-1 pb-16">
        {/* STATUS BAR: Tiêu đề & Trạng thái Backend Live */}
        <div className="flex items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trung tâm Điều hành Hệ thống
            </h1>
          </div>
        </div>

        {/* 4 THẺ KPI — Skeleton khi loading, data khi sẵn sàng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              {/* THẺ 1: Tổng Người Dùng */}
              <Link
                href="/users"
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Tổng người dùng</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      Hoạt động
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">
                      {formatNumber(totalUsersCount)}
                    </span>
                    <span className="text-xs text-slate-500">tài khoản</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Đồng bộ từ hệ cơ sở dữ liệu</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                  <span>Quản lý danh sách</span>
                </div>
              </Link>

              {/* THẺ 2: Giáo Viên & Cán Bộ */}
              <Link
                href="/users"
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Giáo viên &amp; Cán bộ</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                      Sư phạm
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">
                      {formatNumber(teachersCount)}
                    </span>
                    <span className="text-xs text-slate-500">nhân sự</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Chủ nhiệm &amp; Bộ môn</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                  <span>Xem phân công</span>
                </div>
              </Link>

              {/* THẺ 3: Phụ Huynh Học Sinh */}
              <Link
                href="/users"
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Phụ huynh học sinh</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      Kết nối App
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">
                      {formatNumber(parentsCount)}
                    </span>
                    <span className="text-xs text-slate-500">gia đình</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Sổ liên lạc điện tử</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                  <span>Xem danh sách phụ huynh</span>
                </div>
              </Link>

              {/* THẺ 4: Hạn Mức AI */}
              <Link
                href="/limits"
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Trợ giảng AI</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-semibold">
                      {stats.kpi.gemini_ai_calls.model || 'openai/gpt-oss-20b'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">
                      {formatNumber(stats.kpi.gemini_ai_calls.value)}
                    </span>
                    <span className="text-xs text-slate-500">/ {formatNumber(stats.kpi.gemini_ai_calls.daily_quota)} lượt</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Tổng hạn mức AI của giáo viên trong ngày</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                  <span>Cấu hình hạn mức</span>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* SECTION PHÂN BỐ & CHỈ SỐ VẬN HÀNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Card A: Cơ cấu Người dùng (7 cột) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Cơ cấu Người dùng</h2>
                    <p className="text-xs text-slate-500">Tỷ lệ phân bổ giữa các nhóm tài khoản</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    Toàn hệ thống
                  </span>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
                  {/* SVG Donut */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" fill="transparent" r="46" stroke="#f1f5f9" strokeWidth="12" />
                      {totalUsersCount > 0 && teacherPercent > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          fill="transparent"
                          r="46"
                          stroke="#2563eb"
                          strokeDasharray={`${(teacherPercent / 100) * 289} 289`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          strokeWidth="12"
                        />
                      )}
                      {totalUsersCount > 0 && parentPercent > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          fill="transparent"
                          r="46"
                          stroke="#059669"
                          strokeDasharray={`${(parentPercent / 100) * 289} 289`}
                          strokeDashoffset={`-${(teacherPercent / 100) * 289}`}
                          strokeLinecap="round"
                          strokeWidth="12"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-bold text-slate-900">{formatNumber(totalUsersCount)}</span>
                      <span className="text-[10px] text-slate-400 uppercase">Tài khoản</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="flex flex-col gap-3 flex-1 w-full">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-700 font-medium">Giáo viên &amp; Quản trị</span>
                      <span className="text-xs font-bold text-blue-700">{formatNumber(teachersCount)} ({teacherPercent}%)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-700 font-medium">Phụ huynh học sinh</span>
                      <span className="text-xs font-bold text-emerald-700">{formatNumber(parentsCount)} ({parentPercent}%)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-700 font-medium">Trường học liên kết</span>
                      <span className="text-xs font-bold text-slate-900">{formatNumber(schoolsCount)} cơ sở</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card B: Trạng thái & Tài nguyên Máy chủ (5 cột) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-48 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-14 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-3 mt-4">
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                  <div className="h-20 bg-slate-50 rounded-xl border border-slate-100" />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Vận hành Hệ thống</h2>
                      <p className="text-xs text-slate-500">Giám sát tải và hạn mức tài nguyên</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      Ổn định
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {/* AI Quota */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-600 font-medium">Hạn mức AI</span>
                        <span className="font-bold text-slate-900">
                          {stats.kpi.gemini_ai_calls.used_percent}% ({formatNumber(stats.kpi.gemini_ai_calls.value)}/{formatNumber(stats.kpi.gemini_ai_calls.daily_quota)})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stats.kpi.gemini_ai_calls.used_percent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Database Connectivity */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cơ sở dữ liệu:</span>
                        <span className="font-semibold text-slate-900">PostgreSQL (Cloud SQL)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bộ nhớ Heap:</span>
                        <span className="font-semibold text-slate-900">{stats.system_health.memory_heap_mb || 48} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời gian hoạt động:</span>
                        <span className="font-semibold text-slate-900">{stats.system_health.uptime_seconds || 120} giây</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                  <Link href="/settings" className="hover:underline">
                    Xem cấu hình hệ thống
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION NHẬT KÝ VÀ LỊCH SỬ GIAO DỊCH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* CỘT TRÁI: Giao Dịch & Đăng Ký (8 cột) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Lịch sử Đăng ký &amp; Giao dịch</h2>
                <p className="text-xs text-slate-500">Lượt đăng ký bản quyền và hạn mức AI</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Gần đây</span>
            </div>

            {isLoading ? (
              <TableSkeleton rows={4} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-100 font-semibold">
                      <th className="py-3 px-4">Đơn vị &amp; Người đại diện</th>
                      <th className="py-3 px-4 text-center">Mã GD</th>
                      <th className="py-3 px-4">Nội dung</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          Chưa có giao dịch phát sinh
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{tx.targetEntity}</div>
                            <div className="text-[11px] text-slate-400">{tx.time}</div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-500">{tx.orderCode}</td>
                          <td className="py-3 px-4 font-medium">{tx.description}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {tx.statusLabel || 'Hoàn tất'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {formatNumber(tx.amount)}đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Hoạt Động Quản Trị (4 cột) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Nhật ký Quản trị</h2>
              <p className="text-xs text-slate-500">Các thao tác trên hệ thống</p>
            </div>

            {isLoading ? (
              <ActivitySkeleton rows={4} />
            ) : (
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Chưa có hoạt động quản trị ghi nhận
                  </div>
                ) : (
                  recentActivities.slice(0, 5).map((act) => (
                    <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{act.categoryLabel}</span>
                        <span className="text-[11px] text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-slate-600 font-medium">{act.action}</p>
                      <p className="text-[11px] text-slate-400 truncate">{act.details}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
