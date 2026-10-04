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

  const sections = [
    {
      title: 'QUẢN TRỊ',
      items: [
        { href: '/', label: 'Tổng quan', icon: 'grid_view' },
        { href: '/users', label: 'Quản lý Người dùng', icon: 'group' },
        { href: '/classes', label: 'Lớp & Học sinh', icon: 'school' },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { href: '/limits', label: 'Hạn mức & AI', icon: 'tune' },
        { href: '/logs', label: 'Nhật ký hệ thống', icon: 'history' },
        { href: '/settings', label: 'Cài đặt', icon: 'settings' },
      ],
    },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthSession();
    router.push('/login');
  };

  return (
    <aside
      className={`h-screen flex-shrink-0 bg-[#0B0C0E] border-r border-zinc-800/80 flex flex-col justify-between py-5 select-none z-40 transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-20 px-3' : 'w-64 px-4'
      }`}
    >
      {/* Floating Circular Toggle Button on Border (As in Reference Image) */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-50"
        title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
      >
        <span className="material-symbols-outlined text-[15px] font-bold">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div className="space-y-6">
        {/* 1. BRAND HEADER (LOGO + APP NAME) */}
        <div
          className={`flex items-center px-1 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer overflow-hidden min-w-0"
            title="GiaoVienHay - Quản trị hệ thống"
          >
            {/* Logo Container with Rounded Corners */}
            <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
              <Image
                src="/logo.jpg"
                alt="GiaoVienHay Logo"
                width={40}
                height={40}
                priority
                className="w-full h-full object-cover"
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-[17px] font-bold text-white tracking-tight block truncate">
                  GiaoVienHay
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block truncate">
                  DASHBOARD
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* 2. NAVIGATION SECTIONS */}
        <div className="space-y-5">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {/* Category Header */}
              {!isCollapsed ? (
                <div className="px-3 flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  <span>{section.title}</span>
                  <span className="material-symbols-outlined text-[14px] text-zinc-600">
                    expand_more
                  </span>
                </div>
              ) : (
                <div className="h-2" />
              )}

              {/* Items in Section */}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-xl text-xs font-medium transition-all duration-150 group ${
                        isCollapsed ? 'justify-center py-2.5 px-0' : 'px-3.5 py-2.5'
                      } ${
                        isActive
                          ? 'border border-emerald-500 bg-emerald-950/20 text-emerald-400 font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[19px] shrink-0 ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-zinc-400 group-hover:text-white'
                        }`}
                      >
                        {item.icon}
                      </span>

                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}

                      {/* Optional minimal count indicator for active */}
                      {isActive && !isCollapsed && item.href === '/classes' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/50 text-emerald-400">
                          Mới
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FOOTER NAVIGATION */}
      <div className="space-y-1 pt-4 border-t border-zinc-800/80">
        <Link
          href="/settings"
          title={isCollapsed ? 'Trợ giúp' : undefined}
          className={`flex items-center gap-3 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3.5 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">help</span>
          {!isCollapsed && <span className="truncate">Trợ giúp kỹ thuật</span>}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? 'Đăng xuất' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-xs font-semibold text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3.5 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">logout</span>
          {!isCollapsed && <span className="truncate">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
