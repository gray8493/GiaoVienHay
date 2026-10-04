'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SystemLimits {
  gemini_ai_daily_quota_per_teacher: number;
  max_quiz_questions_per_gen: number;
  max_upload_size_mb: number;
  max_students_per_class: number;
  max_classes_per_teacher: number;
  ai_model: 'gemini-1.5-flash' | 'gemini-1.5-pro';
  allow_subject_teacher_create_class: boolean;
  enable_fallback_cache: boolean;
}

const INITIAL_LIMITS: SystemLimits = {
  gemini_ai_daily_quota_per_teacher: 25,
  max_quiz_questions_per_gen: 20,
  max_upload_size_mb: 15,
  max_students_per_class: 55,
  max_classes_per_teacher: 5,
  ai_model: 'gemini-1.5-flash',
  allow_subject_teacher_create_class: true,
  enable_fallback_cache: true,
};

export default function LimitsAndAiPage() {
  const [limits, setLimits] = useState<SystemLimits>(INITIAL_LIMITS);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Đã lưu thành công cấu hình hạn mức tài nguyên & AI');
    }, 500);
  };

  const handleReset = () => {
    setLimits(INITIAL_LIMITS);
    showToast('Đã khôi phục các thông số mặc định của hệ thống');
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6 dot-matrix-bg min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs & Top Action Bar */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-purpose="page-title-and-actions">
        <div>
          {/* Breadcrumb navigation */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1.5 font-medium">
            <Link className="hover:text-slate-600 transition" href="/">
              Trang chủ
            </Link>
            <span>&gt;</span>
            <Link className="hover:text-slate-600 transition" href="/">
              Quản trị hệ thống
            </Link>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Hạn mức &amp; Quota AI</span>
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hạn mức Tài nguyên &amp; Quota Dịch vụ AI</h2>
          <p className="text-xs text-slate-500 mt-1">Cấu hình hạn ngạch Google Gemini API, tệp lưu trữ và giới hạn sĩ số lớp học toàn trường</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition cursor-pointer"
            type="button"
          >
            Khôi phục mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-60"
            type="button"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* BEGIN: KPICardsRow */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5" data-purpose="kpi-metrics-row">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lượt gọi Gemini hôm nay</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Hôm nay</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">24,680</span>
              <span className="text-xs font-medium text-slate-400">/ 35,000 lượt</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-slate-900 h-2 rounded-full" style={{ width: '70.5%' }}></div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">70.5% đã dùng</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                Bình thường
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dung lượng Storage</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Bộ nhớ</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                184 <span className="text-xl">GB</span>
              </span>
              <span className="text-xs font-medium text-slate-400">/ 500 GB</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-slate-800 h-2 rounded-full" style={{ width: '36.8%' }}></div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">36.8% hạn mức</span>
              <span className="text-slate-900 font-semibold">+2.4 GB/ngày</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lớp học đang vận hành</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Hoạt động</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">1,280</span>
              <span className="text-xs font-medium text-slate-400">/ 2,000 phòng</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-slate-700 h-2 rounded-full" style={{ width: '64%' }}></div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">64% công suất</span>
              <span className="text-slate-700 font-semibold">38 cơ sở</span>
            </div>
          </div>
        </div>
      </section>
      {/* END: KPICardsRow */}

      {/* BEGIN: DetailedSettingsGrid (2 Columns) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" data-purpose="quota-configuration-details">
        {/* LEFT COLUMN: Google Gemini AI Quota (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          {/* Card Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Hạn ngạch Google Gemini AI (Trợ giảng &amp; Sinh câu hỏi)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hạn mức request, số câu hỏi trắc nghiệm và mô hình AI kích hoạt</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Hoạt động
            </span>
          </div>

          {/* Input Controls: Requests & Questions per generation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Input 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hạn ngạch tối đa/ngày/giáo viên</label>
              <div className="flex items-center space-x-2">
                <input
                  className="w-20 px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                  type="number"
                  min="5"
                  max="100"
                  value={limits.gemini_ai_daily_quota_per_teacher}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      gemini_ai_daily_quota_per_teacher: Number(e.target.value),
                    })
                  }
                />
                <span className="text-xs text-slate-500 leading-tight">lượt/ngày (mặc định: 20-30)</span>
              </div>
            </div>

            {/* Input 2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số câu hỏi tối đa / lần sinh</label>
              <div className="flex items-center space-x-2">
                <input
                  className="w-20 px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                  type="number"
                  min="5"
                  max="50"
                  value={limits.max_quiz_questions_per_gen}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      max_quiz_questions_per_gen: Number(e.target.value),
                    })
                  }
                />
                <span className="text-xs text-slate-500 leading-tight">câu hỏi / đề trắc nghiệm</span>
              </div>
            </div>
          </div>

          {/* Section: Model Selection */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-700">Mô hình Gemini AI mặc định</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label
                className={`relative flex flex-col p-4 rounded-xl cursor-pointer shadow-xs transition ${
                  limits.ai_model === 'gemini-1.5-flash'
                    ? 'border-2 border-slate-900 bg-white'
                    : 'border border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <input
                      checked={limits.ai_model === 'gemini-1.5-flash'}
                      onChange={() => setLimits({ ...limits, ai_model: 'gemini-1.5-flash' })}
                      className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 cursor-pointer"
                      name="gemini_model"
                      type="radio"
                      value="flash"
                    />
                    <span className="text-xs font-bold text-slate-900">Gemini 1.5 Flash</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-slate-900 rounded-md">Khuyên dùng</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">Phản hồi nhanh, tối ưu chi phí cho trắc nghiệm &amp; trợ giảng.</p>
              </label>

              <label
                className={`relative flex flex-col p-4 rounded-xl cursor-pointer shadow-xs transition ${
                  limits.ai_model === 'gemini-1.5-pro'
                    ? 'border-2 border-slate-900 bg-white'
                    : 'border border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <input
                      checked={limits.ai_model === 'gemini-1.5-pro'}
                      onChange={() => setLimits({ ...limits, ai_model: 'gemini-1.5-pro' })}
                      className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 cursor-pointer"
                      name="gemini_model"
                      type="radio"
                      value="pro"
                    />
                    <span className="text-xs font-bold text-slate-900">Gemini 1.5 Pro</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-slate-700 bg-slate-100 rounded-md">Nâng cao</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">Suy luận chuyên sâu cho đề thi học sinh giỏi và giải bài phức tạp.</p>
              </label>
            </div>
          </div>

          {/* Fallback Cache Checkbox Block */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
            <div className="flex items-center h-5 mt-0.5">
              <input
                checked={limits.enable_fallback_cache}
                onChange={(e) => setLimits({ ...limits, enable_fallback_cache: e.target.checked })}
                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
                id="fallback-cache"
                type="checkbox"
              />
            </div>
            <label className="cursor-pointer select-none" htmlFor="fallback-cache">
              <span className="block text-xs font-bold text-slate-800">Chế độ dự phòng thông minh (Fallback Cache)</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Tự động dùng ngân hàng câu hỏi có sẵn khi chạm 90% quota ngày</span>
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN: Classroom & File Storage Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Classroom & Student Quota */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Hạn mức Lớp học &amp; Sĩ số</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-700">Sĩ số tối đa / lớp</span>
                <span className="block text-[11px] text-slate-400">Chuẩn Bộ GD&amp;ĐT (mặc định: 55-60)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  className="w-16 px-2.5 py-1.5 text-xs font-semibold text-center text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  type="number"
                  min="20"
                  max="100"
                  value={limits.max_students_per_class}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      max_students_per_class: Number(e.target.value),
                    })
                  }
                />
                <span className="text-xs font-medium text-slate-500">HS</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100/70 pt-3">
              <div>
                <span className="block text-xs font-semibold text-slate-700">Số lớp tối đa / GVCN</span>
                <span className="block text-[11px] text-slate-400">Tránh trùng lặp danh sách lớp</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  className="w-16 px-2.5 py-1.5 text-xs font-semibold text-center text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  type="number"
                  min="1"
                  max="20"
                  value={limits.max_classes_per_teacher}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      max_classes_per_teacher: Number(e.target.value),
                    })
                  }
                />
                <span className="text-xs font-medium text-slate-500">lớp</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100/70 pt-3">
              <div>
                <span className="block text-xs font-semibold text-slate-700">Cho phép GV Bộ môn tạo lớp</span>
                <span className="block text-[11px] text-slate-400">Áp dụng cho lớp phụ đạo, ôn thi</span>
              </div>
              <input
                checked={limits.allow_subject_teacher_create_class}
                onChange={(e) =>
                  setLimits({
                    ...limits,
                    allow_subject_teacher_create_class: e.target.checked,
                  })
                }
                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
                type="checkbox"
              />
            </div>
          </div>

          {/* Card 2: File Storage for Curriculum & Exams */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lưu trữ Giáo án &amp; Đề thi</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-700">Dung lượng tệp tải lên</span>
                <span className="block text-[11px] text-slate-400">Tối đa 20 MB/tệp (.PDF, .DOCX, .PPTX)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  className="w-16 px-2.5 py-1.5 text-xs font-semibold text-center text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  type="number"
                  min="5"
                  max="50"
                  value={limits.max_upload_size_mb}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      max_upload_size_mb: Number(e.target.value),
                    })
                  }
                />
                <span className="text-xs font-medium text-slate-500">MB</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <span className="font-medium">Hỗ trợ tệp: .PDF, .DOCX, .PPTX, .XLSX, .PNG, .JPG</span>
            </div>
          </div>
        </div>
      </section>
      {/* END: DetailedSettingsGrid */}
    </main>
  );
}
