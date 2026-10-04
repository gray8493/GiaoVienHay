'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Tổng quan', icon: 'grid_view' },
    { href: '/users', label: 'Quản lý Người dùng', icon: 'group' },
    { href: '/classes', label: 'Lớp & Học sinh', icon: 'school' },
    { href: '/limits', label: 'Hạn mức & AI', icon: 'tune' },
    { href: '/logs', label: 'Nhật ký hệ thống', icon: 'history' },
    { href: '/settings', label: 'Cài đặt', icon: 'settings' },
  ];

  return (
    <aside
      className={`h-screen flex-shrink-0 bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#090D16] border-r border-slate-800/90 flex flex-col justify-between py-5 select-none z-40 transition-all duration-300 ease-in-out relative shadow-[4px_0_28px_rgba(0,0,0,0.45),1px_0_0_rgba(255,255,255,0.06)_inset] ${
        isCollapsed ? 'w-20 px-2.5' : 'w-64 px-4'
      }`}
    >
      <div className="space-y-6">
        {/* 1. BRAND HEADER (LOGO + APP NAME IN SIDEBAR) */}
        <div
          className={`flex items-center gap-2.5 px-1 ${
            isCollapsed ? 'flex-col justify-center' : 'justify-between'
          }`}
        >
          <Link
            href="/"
            className={`flex items-center gap-3 group cursor-pointer overflow-hidden min-w-0 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="GiaoVienHay - Quản trị hệ thống"
          >
            {/* 3D Elevated Logo Icon */}
            <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 ring-1 ring-white/20 shrink-0 transform group-hover:scale-105 transition-transform duration-200">
              <span
                className="material-symbols-outlined text-[22px] drop-shadow-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="text-[16px] font-bold text-white tracking-tight block truncate group-hover:text-blue-400 transition-colors drop-shadow-xs">
                  GiaoVienHay
                </span>
                <span className="text-[11px] text-slate-400 font-medium block truncate tracking-wide">
                  Quản trị hệ thống
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Sidebar Button */}
          <button
            onClick={onToggle}
            className={`w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-400 hover:text-white border border-slate-700/60 shadow-xs flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isCollapsed ? 'mt-2' : ''
            }`}
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* 2. NAVIGATION LINKS (DARK 3D ELEVATION) */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isCollapsed ? 'justify-center py-2.5 px-0' : 'px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-600/35 border border-blue-400/40 ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70 hover:shadow-inner'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white drop-shadow-sm' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>

                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Subtle Active Indicator Glow on Right Edge */}
                {isActive && !isCollapsed && (
                  <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. FOOTER NAVIGATION */}
      <div className="space-y-1.5 pt-4 border-t border-slate-800/90">
        <a
          href="#"
          title={isCollapsed ? 'Trợ giúp kỹ thuật' : undefined}
          className={`flex items-center gap-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">help</span>
          {!isCollapsed && <span className="truncate">Trợ giúp kỹ thuật</span>}
        </a>

        <a
          href="#"
          title={isCollapsed ? 'Đăng xuất' : undefined}
          className={`flex items-center gap-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">logout</span>
          {!isCollapsed && <span className="truncate">Đăng xuất</span>}
        </a>
      </div>
    </aside>
  );
}
