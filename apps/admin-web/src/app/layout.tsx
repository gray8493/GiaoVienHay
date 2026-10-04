import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '../components/AppShell';

const inter = Inter({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'GiaoVienHay - Quản trị hệ thống',
  description: 'Hệ thống Quản lý Giáo dục & Sổ liên lạc Điện tử GiaoVienHay',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`h-full ${inter.variable} ${inter.className}`}>
      <body className="h-full font-sans text-slate-800 bg-slate-50/70 antialiased overflow-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
