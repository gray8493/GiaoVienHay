'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/users', label: 'Người dùng', icon: 'group' },
    { href: '/classes', label: 'Lớp & Học sinh', icon: 'school' },
    { href: '/limits', label: 'Hạn mức & AI', icon: 'tune' },
    { href: '/settings', label: 'Cài đặt', icon: 'settings' },
  ];

  return (
    <header className="w-full h-14 min-h-[56px] max-h-[56px] bg-white border-b border-slate-200/80 px-5 flex items-center justify-between select-none z-50 shrink-0 relative shadow-2xs">
      {/* 1. Left: Brand Identity & Nav Links */}
      <div className="flex items-center gap-6 min-w-0">
        <Link
          href="/users"
          className="flex items-center gap-2.5 rounded-xl hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
        >
          {/* Constrained Strict Size Logo Box */}
          <div className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-lg overflow-hidden border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
            <img
              src="/logo.jpg"
              alt="GiaoVienHay"
              width={32}
              height={32}
              className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] object-cover block"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">
              GiaoVienHay
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Quản trị
            </span>
          </div>
        </Link>

        {/* Subtle Divider */}
        <div className="hidden lg:block h-5 w-[1px] bg-slate-200 shrink-0" />

        {/* 2. Center: Horizontal Navigation Items */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[17px] ${
                    isActive ? 'text-indigo-700' : 'text-slate-400'
                  }`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Right: Utility, Profile & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* System Health Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/70 text-slate-600 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống: Live</span>
        </div>

        {/* Help Link */}
        <a
          href="#"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Trợ giúp kỹ thuật"
        >
          <span className="material-symbols-outlined text-[17px]">help</span>
          <span>Trợ giúp</span>
        </a>

        {/* Admin Profile Cluster */}
        <Link
          href="/settings"
          className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
            H
          </div>
          <span className="text-xs font-semibold text-slate-700">Admin Hoàng</span>
        </Link>

        {/* Logout Button */}
        <button
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
          title="Đăng xuất khỏi hệ thống"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
