'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredUser, AdminUser } from '@/lib/auth';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function Header({ onToggleSidebar, isSidebarCollapsed }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCurrentUser(getStoredUser());
    try {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setCurrentDateStr(`${dayName}, ${day}/${month}/${year}`);
    } catch {
      // Fallback
    }
  }, []);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0 z-30 shadow-2xs">
      {/* Left Area: Mobile toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors lg:hidden cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}
      </div>

      {/* Right Actions: Date, Notification, Admin Profile */}
      <div className="flex items-center gap-3.5 ml-auto">
        <span className="text-xs text-slate-500 hidden md:inline-block font-medium min-h-[16px]" suppressHydrationWarning>
          {isMounted ? currentDateStr : ''}
        </span>

        {/* Notification Button */}
        <button
          type="button"
          aria-label="Thông báo"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200/80" />

        {/* Profile Pill */}
        <Link
          href="/settings"
          className="flex items-center gap-2.5 py-1 pl-1.5 pr-3 rounded-full hover:bg-slate-100/80 active:bg-slate-200/60 transition-all cursor-pointer group"
          title={isMounted && currentUser ? `${currentUser.full_name} (${currentUser.role})` : 'Cài đặt tài khoản'}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white" suppressHydrationWarning>
            {isMounted && currentUser?.full_name ? currentUser.full_name.trim().charAt(currentUser.full_name.trim().lastIndexOf(' ') + 1) || currentUser.full_name.charAt(0) : 'A'}
          </div>
          <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 transition-colors max-w-[140px] truncate" suppressHydrationWarning>
            {isMounted && currentUser?.full_name ? currentUser.full_name : 'Quản trị viên'}
          </span>
        </Link>
      </div>
    </header>
  );
}
