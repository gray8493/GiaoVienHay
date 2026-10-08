'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import Header from './header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const previousPathname = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleInternalNavigation = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]') as HTMLAnchorElement | null;
    if (!link || link.target === '_blank') return;

    const destination = new URL(link.href, window.location.href);
    if (
      destination.origin === window.location.origin &&
      destination.pathname !== window.location.pathname
    ) {
      setIsNavigating(true);
    }
  };

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    // Khi pathname thay đổi = route đã load xong → ẩn progress bar
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setIsNavigating(false), 100);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  // If on login page, render full screen without AppShell chrome
  return (
    <div
      className={pathname === '/login' ? 'min-h-screen' : 'h-full'}
      onClickCapture={handleInternalNavigation}
    >
      {pathname === '/login' ? (
        <div className="min-h-screen w-full antialiased font-sans">{children}</div>
      ) : (
        <div className="h-full flex flex-row overflow-hidden dot-matrix-bg antialiased font-sans text-slate-800 select-none">
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header onToggleSidebar={toggleSidebar} isSidebarCollapsed={isCollapsed} />
            <div className="flex-1 overflow-y-auto flex flex-col relative select-text dot-matrix-bg">
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Slim top progress bar thay vì fullscreen overlay spinner.
          Cải thiện INP: không block interactions. Cải thiện CLS: không có overlay layout shift. */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]" role="progressbar" aria-label="Đang tải trang">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 rounded-r-full shadow-sm"
            style={{
              animation: 'progress-bar 1.5s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes progress-bar {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 95%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
