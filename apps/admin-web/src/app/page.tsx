'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [activeChartTab, setActiveChartTab] = useState<'ai' | 'classes' | 'tuition'>('ai');

  return (
    <div
      className="relative min-h-full flex flex-col font-sans selection:bg-blue-600 selection:text-white"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(rgb(203, 213, 225) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 w-full px-6 lg:px-8 py-6 space-y-6 flex-1 pb-16">
        {/* TOP KPI METRIC CARDS (4 COLUMNS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* CARD 1: Tổng người dùng */}
          <Link
            href="/users"
            className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group min-w-0"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Tổng người dùng</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span>+12.5%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">14,250</span>
                <span className="text-xs text-slate-500">tài khoản</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">So với tháng 8/2026</p>
            </div>
            {/* Sparkline Coral/Orange */}
            <div className="mt-3 pt-1">
              <svg className="w-full h-11 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="coralGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 32 Q 25 30 45 22 T 90 24 T 125 10 T 160 6 L 160 40 L 0 40 Z" fill="url(#coralGrad)" />
                <path d="M 0 32 Q 25 30 45 22 T 90 24 T 125 10 T 160 6" fill="none" stroke="#ea580c" strokeLinecap="round" strokeWidth="2.5" />
                <circle className="animate-pulse" cx="160" cy="6" fill="#ea580c" r="3" />
              </svg>
            </div>
          </Link>

          {/* CARD 2: Lớp học hoạt động */}
          <Link
            href="/classes"
            className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group min-w-0"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#006c49]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Lớp học hoạt động</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span>+8.2%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">1,280</span>
                <span className="text-xs text-slate-500">lớp học</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Thuộc 38 trường liên kết</p>
            </div>
            {/* Sparkline Emerald/Teal */}
            <div className="mt-3 pt-1">
              <svg className="w-full h-11 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="tealGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#006c49" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#006c49" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 28 Q 30 32 55 18 T 100 20 T 130 8 T 160 4 L 160 40 L 0 40 Z" fill="url(#tealGrad)" />
                <path d="M 0 28 Q 30 32 55 18 T 100 20 T 130 8 T 160 4" fill="none" stroke="#006c49" strokeLinecap="round" strokeWidth="2.5" />
                <circle className="animate-pulse" cx="160" cy="4" fill="#006c49" r="3" />
              </svg>
            </div>
          </Link>

          {/* CARD 3: Lượt gọi Gemini AI */}
          <Link
            href="/limits"
            className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group min-w-0"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#004ac6]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Lượt gọi Gemini AI</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[13px]">trending_down</span>-3.1%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">24,680</span>
                <span className="text-xs text-slate-500">hôm nay</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Giáo án &amp; trích xuất đề thi</p>
            </div>
            {/* Sparkline Navy/Primary */}
            <div className="mt-3 pt-1">
              <svg className="w-full h-11 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="navyGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 12 Q 35 8 65 24 T 115 14 T 140 22 T 160 18 L 160 40 L 0 40 Z" fill="url(#navyGrad)" />
                <path d="M 0 12 Q 35 8 65 24 T 115 14 T 140 22 T 160 18" fill="none" stroke="#004ac6" strokeLinecap="round" strokeWidth="2.5" />
                <circle cx="160" cy="18" fill="#004ac6" r="3" />
              </svg>
            </div>
          </Link>

          {/* CARD 4: Tỷ lệ thu Học phí & BHYT */}
          <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group min-w-0">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Học phí &amp; BHYT</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span>+24.7%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-[28px] text-slate-900 font-bold tracking-tight">92.4%</span>
                <span className="text-xs text-emerald-600 font-semibold">hoàn tất</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tiến độ đợt 1 Học kỳ I</p>
            </div>
            {/* Sparkline Amber */}
            <div className="mt-3 pt-1">
              <svg className="w-full h-11 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="amberGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#b45309" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 35 Q 30 30 60 16 T 110 18 T 135 10 T 160 4 L 160 40 L 0 40 Z" fill="url(#amberGrad)" />
                <path d="M 0 35 Q 30 30 60 16 T 110 18 T 135 10 T 160 4" fill="none" stroke="#b45309" strokeLinecap="round" strokeWidth="2.5" />
                <circle className="animate-pulse" cx="160" cy="4" fill="#b45309" r="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* UPPER MIDDLE SECTION (Chart & Donut) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT (8 COLS = ~67%) : Biểu đồ Hiệu Suất Hệ Thống */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md flex flex-col gap-4 relative overflow-hidden">
            {/* Card Header + Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tổng quan hiệu suất hệ thống</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Hiệu suất vận hành theo từng tháng trong năm học 2025 - 2026</p>
              </div>
              {/* Select switcher dropdown */}
              <div className="relative self-start sm:self-center">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                  <select
                    value={activeChartTab}
                    onChange={(e) => setActiveChartTab(e.target.value as 'ai' | 'classes' | 'tuition')}
                    className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-1 outline-none"
                  >
                    <option value="ai">Lượt gọi AI</option>
                    <option value="classes">Lớp học</option>
                    <option value="tuition">Học phí</option>
                  </select>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 pointer-events-none -ml-1">expand_more</span>
                </div>
              </div>
            </div>

            {/* Smooth Area Chart SVG */}
            <div className="w-full relative pt-1">
              <svg className="w-full h-64 md:h-72" fill="none" preserveAspectRatio="none" viewBox="0 0 740 220">
                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                  </linearGradient>
                  <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
                    <feDropShadow dx="0" dy="4" floodColor="#2563eb" floodOpacity="0.3" stdDeviation="6" />
                  </filter>
                </defs>
                {/* Grid Lines */}
                <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="730" y1="20" y2="20" />
                <text fill="#737686" fontSize="10" textAnchor="end" x="35" y="24">60k</text>
                <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="730" y1="65" y2="65" />
                <text fill="#737686" fontSize="10" textAnchor="end" x="35" y="69">45k</text>
                <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="730" y1="110" y2="110" />
                <text fill="#737686" fontSize="10" textAnchor="end" x="35" y="114">30k</text>
                <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="730" y1="155" y2="155" />
                <text fill="#737686" fontSize="10" textAnchor="end" x="35" y="159">15k</text>
                <line stroke="#cbd5e1" strokeWidth="1" x1="45" x2="730" y1="195" y2="195" />
                <text fill="#737686" fontSize="10" textAnchor="end" x="35" y="199">0k</text>
                {/* Gradient Area */}
                <path d="M 50 160 C 110 145, 140 130, 180 115 C 220 100, 260 120, 310 90 C 360 60, 410 75, 460 45 C 510 20, 560 50, 610 30 C 660 15, 690 35, 730 22 L 730 195 L 50 195 Z" fill="url(#areaGradient)" />
                {/* Main Curve */}
                <path d="M 50 160 C 110 145, 140 130, 180 115 C 220 100, 260 120, 310 90 C 360 60, 410 75, 460 45 C 510 20, 560 50, 610 30 C 660 15, 690 35, 730 22" fill="none" filter="url(#glow)" stroke="#2563eb" strokeWidth="3.5" />
                {/* Dots */}
                <circle cx="180" cy="115" fill="#ffffff" r="4" stroke="#2563eb" strokeWidth="2.5" />
                <circle cx="310" cy="90" fill="#ffffff" r="4" stroke="#2563eb" strokeWidth="2.5" />
                <circle cx="460" cy="45" fill="#ffffff" r="4" stroke="#2563eb" strokeWidth="2.5" />
                <circle className="animate-pulse" cx="610" cy="30" fill="#2563eb" r="6" stroke="#ffffff" strokeWidth="3" />
                <circle cx="730" cy="22" fill="#ffffff" r="4" stroke="#2563eb" strokeWidth="2.5" />
              </svg>
              {/* X-axis Labels */}
              <div className="flex justify-between pl-11 pr-2 mt-1 text-[11px] text-slate-400">
                <span>Th1</span><span>Th2</span><span>Th3</span><span>Th4</span><span>Th5</span><span>Th6</span><span>Th7</span><span>Th8</span><span className="text-blue-600 font-bold">Th9</span><span>Th10</span><span>Th11</span><span>Th12</span>
              </div>
            </div>
          </div>

          {/* RIGHT (4 COLS = ~33%) : Donut Chart + Tháng 9 Goals */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Card A: Nguồn người dùng truy cập */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex flex-col">
                  <h3 className="text-base text-slate-900 font-bold">Nguồn người dùng</h3>
                  <span className="text-xs text-slate-500">Phân bổ truy cập kỳ này</span>
                </div>
                <span className="material-symbols-outlined text-[20px] text-slate-400">pie_chart</span>
              </div>
              <div className="flex items-center justify-center gap-5 my-1">
                {/* 3D Layered Donut SVG */}
                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" fill="transparent" r="46" stroke="#f1f5f9" strokeWidth="12" />
                    <circle cx="60" cy="60" fill="transparent" r="46" stroke="#ea580c" strokeDasharray="101 188" strokeDashoffset="0" strokeLinecap="round" strokeWidth="12" />
                    <circle cx="60" cy="60" fill="transparent" r="46" stroke="#006c49" strokeDasharray="81 208" strokeDashoffset="-106" strokeLinecap="round" strokeWidth="12" />
                    <circle cx="60" cy="60" fill="transparent" r="46" stroke="#2563eb" strokeDasharray="63 226" strokeDashoffset="-192" strokeLinecap="round" strokeWidth="12" />
                    <circle cx="60" cy="60" fill="transparent" r="46" stroke="#b45309" strokeDasharray="43 246" strokeDashoffset="-259" strokeLinecap="round" strokeWidth="12" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-900 leading-tight">284K</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tổng truy cập</span>
                  </div>
                </div>
                {/* Donut Legend */}
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600 flex-shrink-0" />
                    <span className="text-xs text-slate-700 truncate">GV Chủ nhiệm (35%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006c49] flex-shrink-0" />
                    <span className="text-xs text-slate-700 truncate">Phụ huynh (28%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                    <span className="text-xs text-slate-700 truncate">GV Bộ môn (22%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b45309] flex-shrink-0" />
                    <span className="text-xs text-slate-700 truncate">Ban Giám hiệu (15%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Mục tiêu tháng 9 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-base text-slate-900 font-bold">Mục tiêu tháng 9</h3>
                  <span className="text-xs text-slate-500">Chỉ tiêu vận hành quý 3</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">Q3/2026</span>
              </div>
              <div className="flex flex-col gap-3 pt-1">
                {/* Item 1: Hạn mức Gemini AI */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">Hạn mức Gemini AI</span>
                    <span className="text-orange-600 font-bold">88% <span className="text-slate-400 font-normal">(48.2K/55K)</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 w-[88%]" />
                  </div>
                </div>
                {/* Item 2: Tài khoản mới kích hoạt */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">Tài khoản mới kích hoạt</span>
                    <span className="text-[#006c49] font-bold">85% <span className="text-slate-400 font-normal">(847/1,000 GV)</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#006c49] w-[85%]" />
                  </div>
                </div>
                {/* Item 3: Tỷ lệ đồng bộ Sở GD&ĐT */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">Đồng bộ dữ liệu Sở GD&amp;ĐT</span>
                    <span className="text-[#004ac6] font-bold">76% <span className="text-slate-400 font-normal">(3.8/5.0)</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-[#004ac6] w-[76%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTION (68% / 32%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT (8 COLS = ~67%) : Bảng Giao Dịch & Đăng Ký */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-md flex flex-col overflow-hidden">
            {/* Card Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-slate-900">Giao dịch &amp; Đăng ký gói gần đây</h2>
                <span className="text-xs text-slate-500">Lượt đăng ký bản quyền và mua quota AI mới nhất</span>
              </div>
              <Link href="/limits" className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
                <span>Xem tất cả</span>
                <span className="material-symbols-outlined text-[16px]">north_east</span>
              </Link>
            </div>
            {/* Table Container */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-100 font-semibold">
                    <th className="py-3 px-4 whitespace-nowrap">Đơn vị &amp; Người đại diện</th>
                    <th className="py-3 px-4 whitespace-nowrap text-center">Mã GD</th>
                    <th className="py-3 px-4 whitespace-nowrap">Gói dịch vụ</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Trạng thái</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-snug">THCS Lê Quý Đôn</span>
                          <span className="text-slate-400 text-xs">Cô Mai Lan</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">GD-7891</td>
                    <td className="py-3.5 px-4 font-medium text-xs">Gói AI Trường học Pro</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#131b2e] text-white text-xs font-semibold whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />Hoàn tất
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">12.500.000đ</td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-snug">THCS Chu Văn An</span>
                          <span className="text-slate-400 text-xs">Thầy Đức</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">GD-7890</td>
                    <td className="py-3.5 px-4 font-medium text-xs">Nâng cấp Quota AI Khối 7</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#131b2e] text-white text-xs font-medium whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />Đang xử lý
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">4.200.000đ</td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-snug">THPT Chuyên Nguyễn Huệ</span>
                          <span className="text-slate-400 text-xs">BGH Trường</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">GD-7889</td>
                    <td className="py-3.5 px-4 font-medium text-xs">Bản quyền Toàn trường</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#131b2e] text-white text-xs font-semibold whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />Hoàn tất
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">35.000.000đ</td>
                  </tr>
                  {/* Row 4 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-snug">THCS Phan Đình Phùng</span>
                          <span className="text-slate-400 text-xs">Cô Thu Thủy</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">GD-7888</td>
                    <td className="py-3.5 px-4 font-medium text-xs">Bản quyền Cá nhân GV</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#131b2e] text-white text-xs font-medium whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Chờ duyệt
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">1.200.000đ</td>
                  </tr>
                  {/* Row 5 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-snug">THCS Vinschool Central</span>
                          <span className="text-slate-400 text-xs">Tổ Trưởng Chuyên Môn</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">GD-7887</td>
                    <td className="py-3.5 px-4 font-medium text-xs">AI Soạn giáo án &amp; Đề thi</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#131b2e] text-white text-xs font-semibold whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />Hoàn tất
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">6.500.000đ</td>
                  </tr>
                  {/* Row 6 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-snug">THCS Lương Thế Vinh</span>
                          <span className="text-slate-400 text-xs">Thầy Hoàng Nam</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">GD-7886</td>
                    <td className="py-3.5 px-4 font-medium text-xs">Nâng hạn mức Token API</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#131b2e] text-white text-xs font-medium whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />Đã hủy
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-400 line-through">2.800.000đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT (4 COLS = ~33%) : Nhật Ký Hoạt Động Realtime */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base text-slate-900 font-bold">Nhật ký hoạt động</h2>
              </div>
              <Link href="/logs" className="inline-flex items-center gap-0.5 text-xs text-blue-600 font-bold hover:underline">
                <span>Xem tất cả</span>
                <span className="material-symbols-outlined text-[15px]">north_east</span>
              </Link>
            </div>
            {/* Timeline List */}
            <div className="flex flex-col gap-3.5 relative">
              {/* Timeline Item 1 */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-slate-900 font-semibold truncate">Đăng ký gói AI Thành công</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">2 phút trước</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Cô Trần Lan - Trường THPT Chuyên Hà Nội Amsterdam</p>
                </div>
              </div>
              {/* Timeline Item 2 */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-slate-900 font-semibold truncate">Xác thực tài khoản Giáo viên</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">15 phút trước</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Đã phê duyệt định danh Căn cước công dân cho 14 GV mới</p>
                </div>
              </div>
              {/* Timeline Item 3 */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-slate-900 font-semibold truncate">Đánh giá 5 sao cho Trợ lý AI</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">1 giờ trước</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Thầy Hoàng Hải (Tổ Toán): &quot;Soạn ma trận đề thi cực kỳ chuẩn&quot;</p>
                </div>
              </div>
              {/* Timeline Item 4 */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-slate-900 font-semibold truncate">Thanh toán BHYT &amp; Học phí</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">2 giờ trước</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">312 phụ huynh Lớp 9A2 hoàn tất nộp tiền qua cổng VietQR</p>
                </div>
              </div>
              {/* Timeline Item 5 */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-slate-900 font-semibold truncate">Yêu cầu cấp thêm Token</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">3 giờ trước</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Ticket #842: Tổ Ngữ Văn đề xuất tăng hạn mức 200,000 token</p>
                </div>
              </div>
            </div>
            {/* Quick Summary banner inside card */}
            <div className="mt-1 p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">shield</span>
                <span className="text-xs text-slate-600 font-medium">Bảo mật hệ thống</span>
              </div>
              <span className="text-xs text-emerald-600 font-bold">An toàn tuyệt đối</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING QUICK-FEEDBACK PILL BUTTON */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          className="group flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full bg-[#004ac6] hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-white">forum</span>
          </div>
          <span className="text-xs font-semibold tracking-wide">Hỗ trợ &amp; Phản hồi</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
        </button>
      </div>
    </div>
  );
}
