'use client';

import React, { useState, useEffect } from 'react';
import Toast from '../../components/Toast';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';

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
      const limitsRes = await apiFetch<any>('/admin/system-limits');

      if (limitsRes.data) {
        setDefaultDailyQuota(limitsRes.data.gemini_ai_daily_quota_per_teacher || 25);
        const modelStr = limitsRes.data.ai_model || 'AUTO';
        setDefaultModelTier(
          modelStr.includes('pro') ? 'PRO' : modelStr.includes('flash') ? 'FLASH' : 'AUTO'
        );
        setEnableFallbackCache(limitsRes.data.enable_fallback_cache ?? true);
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
