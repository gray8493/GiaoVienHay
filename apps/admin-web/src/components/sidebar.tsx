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

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: {
    text: string;
    type: 'number' | 'pro' | 'pill';
  };
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const sections: NavSection[] = [
    {
      title: 'DASHBOARDS & QUẢN TRỊ',
      items: [
        {
          href: '/',
          label: 'Tổng quan',
          icon: 'home',
        },
        {
          href: '/users',
          label: 'Quản lý Người dùng',
          icon: 'group',
        },
        {
          href: '/classes',
          label: 'Lớp & Học sinh',
          icon: 'school',
        },
      ],
    },
    {
      title: 'APPS & HỆ THỐNG',
      items: [
        {
          href: '/limits',
          label: 'Hạn mức & Cấu hình AI',
          icon: 'tune',
        },
        {
          href: '/settings',
          label: 'Cài đặt hệ thống',
          icon: 'settings',
        },
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
      className={`h-screen flex-shrink-0 bg-white border-r border-[#e7e7e8] flex flex-col justify-between py-4 select-none z-40 transition-all duration-300 ease-in-out relative shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'w-[78px] px-2.5' : 'w-[260px] px-3.5'
      }`}
    >
      {/* Floating Circular Toggle Button ở mép phải (Sneat style) */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white text-[#697a8d] shadow-[0_2px_6px_rgba(67,89,113,0.2)] border border-[#e7e7e8] flex items-center justify-center hover:text-[#696cff] hover:scale-110 active:scale-95 transition-all cursor-pointer z-50"
        title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
      >
        <span className="material-symbols-outlined text-[15px] font-bold">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div className="space-y-5 overflow-y-auto overflow-x-hidden no-scrollbar pr-0.5">
        {/* 1. BRAND HEADER (LOGO + APP NAME) - Phong cách Sneat */}
        <div
          className={`flex items-center pt-1.5 pb-2 px-1.5 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer overflow-hidden min-w-0"
            title="GiaoVienHay - Quản trị hệ thống"
          >
            {/* Sneat Logo Icon wrapper với gradient tím đặc trưng */}
            <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-gradient-to-tr from-[#696cff] to-[#8f92ff] text-white flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(105,108,255,0.35)] p-0.5">
              <div className="w-full h-full rounded-[10px] overflow-hidden bg-white/10 flex items-center justify-center">
                <Image
                  src="/logo.jpg"
                  alt="GiaoVienHay Logo"
                  width={34}
                  height={34}
                  priority
                  className="w-full h-full object-cover rounded-[9px]"
                />
              </div>
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex flex-col justify-center">
                <span className="text-[19px] font-extrabold text-[#566a7f] tracking-tight block truncate leading-tight group-hover:text-[#696cff] transition-colors">
                  GiaoVienHay
                </span>
                <span className="text-[10px] font-bold text-[#a1acb8] tracking-widest uppercase block truncate leading-none mt-0.5">
                  ADMIN PANEL
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* 2. NAVIGATION SECTIONS */}
        <div className="space-y-4">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {/* Category Header (Sneat Divider with Uppercase muted text) */}
              {!isCollapsed ? (
                <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
                  <span className="text-[11px] font-semibold text-[#a1acb8] uppercase tracking-wider whitespace-nowrap">
                    {section.title}
                  </span>
                  <div className="flex-1 h-px bg-[#ebebee]" />
                </div>
              ) : (
                <div className="w-6 h-px bg-[#ebebee] mx-auto my-2" />
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
                      className={`flex items-center gap-3 rounded-lg text-[13.5px] font-medium transition-all duration-150 group relative ${
                        isCollapsed
                          ? 'justify-center py-2.5 px-0'
                          : 'px-3.5 py-2.5'
                      } ${
                        isActive
                          ? 'bg-[#ebe7ff] text-[#696cff] font-semibold shadow-[0_2px_6px_rgba(105,108,255,0.12)]'
                          : 'text-[#697a8d] hover:bg-[#f5f5f9] hover:text-[#566a7f]'
                      }`}
                    >
                      {/* Active Indicator bar bên trái (nếu collapsed) */}
                      {isActive && isCollapsed && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#696cff] rounded-r-md" />
                      )}

                      {/* Icon menu */}
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#696cff]'
                            : 'text-[#697a8d] group-hover:text-[#566a7f]'
                        }`}
                      >
                        {item.icon}
                      </span>

                      {/* Text nhãn */}
                      {!isCollapsed && (
                        <span className="truncate flex-1 tracking-[-0.01em]">
                          {item.label}
                        </span>
                      )}

                      {/* Sneat Badges */}
                      {!isCollapsed && item.badge && (
                        <>
                          {item.badge.type === 'number' && (
                            <span className="w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold bg-[#ff3e1d] text-white shadow-[0_2px_4px_rgba(255,62,29,0.3)]">
                              {item.badge.text}
                            </span>
                          )}
                          {item.badge.type === 'pro' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#ebe7ff] text-[#696cff] border border-[#d8d4fd]">
                              {item.badge.text}
                            </span>
                          )}
                          {item.badge.type === 'pill' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#71dd37]/15 text-[#56b420]">
                              {item.badge.text}
                            </span>
                          )}
                        </>
                      )}

                      {/* Chevron phải mờ cho item chưa có badge (như Sneat) */}
                      {!isCollapsed && !item.badge && !isActive && (
                        <span className="material-symbols-outlined text-[15px] text-[#b4bdc6] opacity-0 group-hover:opacity-100 transition-opacity">
                          chevron_right
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

      {/* 3. FOOTER NAVIGATION (Sneat Style) */}
      <div className="space-y-1 pt-3 border-t border-[#e7e7e8] mt-2">
        <Link
          href="/settings"
          title={isCollapsed ? 'Trợ giúp' : undefined}
          className={`flex items-center gap-3 rounded-lg text-[13px] font-medium text-[#697a8d] hover:text-[#566a7f] hover:bg-[#f5f5f9] transition-colors group ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3.5 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[19px] shrink-0 text-[#697a8d] group-hover:text-[#566a7f]">
            help
          </span>
          {!isCollapsed && <span className="truncate">Trợ giúp kỹ thuật</span>}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? 'Đăng xuất' : undefined}
          className={`w-full flex items-center gap-3 rounded-lg text-[13px] font-medium text-[#ff3e1d] hover:bg-[#ff3e1d]/10 transition-colors cursor-pointer group ${
            isCollapsed ? 'justify-center py-2 px-0' : 'px-3.5 py-2'
          }`}
        >
          <span className="material-symbols-outlined text-[19px] shrink-0 text-[#ff3e1d]">
            logout
          </span>
          {!isCollapsed && <span className="truncate font-semibold">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}

