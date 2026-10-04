'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthSession } from '@/lib/auth';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Tổng quan', icon: 'grid_view' },
    { href: '/users', label: 'Quản lý Người dùng', icon: 'group' },
    { href: '/classes', label: 'Lớp & Học sinh', icon: 'school' },
    { href: '/limits', label: 'Hạn mức & AI', icon: 'tune' },
    { href: '/logs', label: 'Nhật ký hệ thống', icon: 'history' },
    { href: '/settings', label: 'Cài đặt', icon: 'settings' },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthSession();
    router.push('/login');
  };

  return (
    <aside
      className={`h-screen flex-shrink-0 bg-gradient-to-b from-[#0d0f14] via-[#090a0e] to-[#050608] border-r border-white/[0.08] flex flex-col justify-between py-5 select-none z-40 transition-all duration-300 ease-in-out relative shadow-[4px_0_30px_rgba(0,0,0,0.85),inset_-1px_0_0_rgba(255,255,255,0.05)] ${
        isCollapsed ? 'w-20 px-2.5' : 'w-64 px-4'
      }`}
    >
      {/* 3D Top Specular Rim Light */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="space-y-6">
        {/* 1. BRAND HEADER (LOGO + APP NAME IN 3D ELEVATED FRAME) */}
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
            {/* 3D Embossed Container for Logo */}
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-b from-white/30 via-white/10 to-transparent shadow-[0_8px_18px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/15 ring-1 ring-black shrink-0 group-hover:scale-105 group-hover:shadow-[0_10px_24px_rgba(59,130,246,0.35)] transition-all duration-300">
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center relative shadow-inner">
                <Image
                  src="/logo.jpg"
                  alt="GiaoVienHay Logo"
                  width={40}
                  height={40}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="text-[16px] font-bold text-white tracking-tight block truncate group-hover:text-blue-400 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  GiaoVienHay
                </span>
                <span className="text-[11px] text-slate-400 font-medium block truncate tracking-wide">
                  Quản trị hệ thống
                </span>
              </div>
            )}
          </Link>

          {/* 3D Tactile Toggle Sidebar Button */}
          <button
            type="button"
            onClick={onToggle}
            className={`w-7 h-7 rounded-lg bg-[#141720] hover:bg-[#1c2130] text-slate-400 hover:text-white border border-white/10 shadow-[0_2px_5px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
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

        {/* 2. NAVIGATION LINKS (3D TACTILE & INSET EFFECTS) */}
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
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-semibold shadow-[0_6px_20px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.35),0_1px_0_rgba(255,255,255,0.15)] border border-blue-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border hover:border-white/[0.08] hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]'
                }`}
              >
                {/* 3D Active Indicator Pill on Left Edge */}
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                )}

                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                      : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>

                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Subtle Right Indicator on Active */}
                {isActive && !isCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. FOOTER NAVIGATION (3D EMBOSSED BUTTONS) */}
      <div className="space-y-1.5 pt-4 border-t border-white/[0.08]">
        <Link
          href="/settings"
          title={isCollapsed ? 'Trợ giúp kỹ thuật' : undefined}
          className={`flex items-center gap-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] hover:border hover:border-white/[0.06] transition-all ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">help</span>
          {!isCollapsed && <span className="truncate">Trợ giúp kỹ thuật</span>}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? 'Đăng xuất' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/15 hover:border hover:border-rose-500/25 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0 text-rose-400">logout</span>
          {!isCollapsed && <span className="truncate">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
