'use client';

import React from 'react';
import Link from 'next/link';

export default function UsersHubPage() {
  return (
    <main className="w-full flex-1 p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-[13px] text-slate-400">chevron_right</span>
          <span>Quản trị hệ thống</span>
          <span className="material-symbols-outlined text-[13px] text-slate-400">chevron_right</span>
          <span className="text-slate-900 font-semibold">Quản lý Người dùng (Hub v3.0)</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
                Cổng Quản lý Người dùng &amp; Phân quyền
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal max-w-3xl">
              Trung tâm kiểm soát dữ liệu tài khoản hai chiều: Đội ngũ sư phạm nhà trường và Khối gia đình kết nối ứng dụng Sổ liên lạc.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng người dùng</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-950 tracking-tight">14,238</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Toàn bộ hồ sơ trên toàn hệ thống</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Giáo viên &amp; Cán bộ</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-950 tracking-tight">3,135</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Sư phạm &amp; Nhân sự nhà trường</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Phụ huynh &amp; Học sinh</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-950 tracking-tight">11,103</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Khối gia đình đã đồng bộ ứng dụng</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tài khoản tạm khóa</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-950 tracking-tight">12</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Trùng lặp hoặc chờ phân bổ lớp</span>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Chọn phân hệ quản trị
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs text-slate-500">
            Truy cập nhanh cơ sở dữ liệu chuyên sâu theo phân quyền
          </span>
        </div>
      </div>

      {/* 2 Main Category Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Giáo viên & Cán bộ Sư phạm */}
        <div className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs">
          <div className="p-6 sm:p-7 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Nhân sự nhà trường
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <h2 className="text-lg sm:text-[19px] font-bold text-slate-950 tracking-tight mt-2.5">
                  Đội ngũ Giáo viên &amp; Cán bộ Sư phạm
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-600 mt-3 leading-relaxed">
              Quản lý hồ sơ giáo viên, phân công nhiệm vụ chuyên môn, quyền hạn lớp học và công cụ hỗ trợ AI giáo dục trong nhà trường.
            </p>

            <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200/70 grid grid-cols-3 gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 font-medium">Quy mô nhân sự</span>
                <span className="text-lg font-bold text-slate-950 tracking-tight mt-0.5">3,135</span>
                <span className="text-[10px] text-slate-500 font-medium">Tài khoản</span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-500 font-medium">GV Chủ nhiệm</span>
                <span className="text-lg font-bold text-slate-950 tracking-tight mt-0.5">850</span>
                <span className="text-[10px] text-slate-500 font-medium">Phân công lớp</span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-500 font-medium">GV Bộ môn</span>
                <span className="text-lg font-bold text-slate-950 tracking-tight mt-0.5">2,285</span>
                <span className="text-[10px] text-emerald-600 font-medium">100% Chuẩn hóa</span>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 bg-transparent">
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <Link
                href="/users/teachers"
                className="flex-1 h-10 px-4 rounded-lg bg-slate-900 hover:bg-black text-white text-[13.5px] font-semibold flex items-center justify-center gap-1 active:scale-[0.99] transition-all shadow-xs"
              >
                <span>Quản lý Giáo viên</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <Link
                href="/users/teachers"
                className="h-10 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors shadow-2xs"
                title="Thêm hồ sơ giáo viên mới"
              >
                <span>Thêm mới</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Phụ huynh & Học sinh */}
        <div className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs">
          <div className="p-6 sm:p-7 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Khối Gia đình
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <h2 className="text-lg sm:text-[19px] font-bold text-slate-950 tracking-tight mt-2.5">
                  Phụ huynh &amp; Học sinh
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-600 mt-3 leading-relaxed">
              Quản lý toàn diện dữ liệu liên kết cha mẹ và học sinh, Sổ liên lạc điện tử, cấp mã kích hoạt di động và theo dõi tương tác nhà trường.
            </p>

            <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200/70 grid grid-cols-3 gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 font-medium">Quy mô kết nối</span>
                <span className="text-lg font-bold text-slate-950 tracking-tight mt-0.5">11,103</span>
                <span className="text-[10px] text-slate-500 font-medium">Gia đình</span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-500 font-medium">Đã kết nối App</span>
                <span className="text-lg font-bold text-emerald-600 tracking-tight mt-0.5">98.6%</span>
                <span className="text-[10px] text-amber-600 font-medium">158 Chưa kích hoạt</span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-500 font-medium">Mạng lưới</span>
                <span className="text-lg font-bold text-slate-950 tracking-tight mt-0.5">38</span>
                <span className="text-[10px] text-slate-500 font-medium">Điểm trường</span>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 bg-transparent">
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <Link
                href="/users/parents"
                className="flex-1 h-10 px-4 rounded-lg bg-slate-900 hover:bg-black text-white text-[13.5px] font-semibold flex items-center justify-center gap-1 active:scale-[0.99] transition-all shadow-xs"
              >
                <span>Quản lý Phụ huynh</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <Link
                href="/users/parents"
                className="h-10 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors shadow-2xs"
                title="Gửi mã kích hoạt hàng loạt qua SMS/Zalo"
              >
                <span>Gửi mã kích hoạt</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
