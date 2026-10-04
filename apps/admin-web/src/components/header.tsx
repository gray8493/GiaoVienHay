'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function Header({ onToggleSidebar, isSidebarCollapsed }: HeaderProps) {
  const [currentDateStr, setCurrentDateStr] = useState('Thứ Sáu, 02/10/2026');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  // Global hotkey: Ctrl+K or Cmd+K focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-global-search', { detail: val }));
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-global-search', { detail: '' }));
    }
    inputRef.current?.focus();
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0 z-30 shadow-2xs">
      {/* Left Area: Mobile toggle & Modern Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
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

        {/* Refined Modern Header Search Bar */}
        <div className="relative group w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Tìm kiếm trường học, địa bàn..."
            className="w-full h-9 pl-9 pr-14 text-xs font-normal text-slate-800 placeholder:text-slate-400 bg-slate-100/70 hover:bg-slate-100/90 focus:bg-white border border-slate-200/80 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/5 rounded-xl transition-all shadow-2xs outline-none"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
            {searchQuery ? (
              <button
                type="button"
                onClick={handleClear}
                title="Xóa tìm kiếm"
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200/90 rounded-md shadow-2xs group-focus-within:border-slate-300 group-focus-within:text-slate-500 transition-all select-none pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions: Date, Notification, Admin Profile */}
      <div className="flex items-center gap-3.5">
        <span className="text-xs text-slate-500 hidden md:inline-block font-medium">
          {currentDateStr}
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
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white">
            H
          </div>
          <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
            Admin Hoàng
          </span>
        </Link>
      </div>
    </header>
  );
}
