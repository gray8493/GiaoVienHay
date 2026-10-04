'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import Header from './header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // If on login page, render full screen without AppShell chrome
  if (pathname === '/login') {
    return <div className="min-h-screen w-full antialiased font-sans">{children}</div>;
  }

  return (
    <div className="h-full flex flex-row overflow-hidden dot-matrix-bg antialiased font-sans text-slate-800 select-none">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      {/* 2. MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP NAVBAR */}
        <Header onToggleSidebar={toggleSidebar} isSidebarCollapsed={isCollapsed} />

        {/* DYNAMIC SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto flex flex-col relative select-text dot-matrix-bg">
          {children}
        </div>
      </div>
    </div>
  );
}
