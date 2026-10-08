import React from 'react';
import Script from 'next/script';
import './globals.css';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'GiaoVienHay - Quản trị hệ thống',
  description: 'Hệ thống Quản lý Giáo dục & Sổ liên lạc Điện tử GiaoVienHay',
  icons: {
    icon: '/logo-admin.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts CDN — giảm DNS+TLS latency cho Material Symbols */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full font-sans text-slate-800 bg-slate-50/70 antialiased overflow-hidden" suppressHydrationWarning>
        <AppShell>{children}</AppShell>

        {/* Material Symbols: load async thay vì render-blocking @import
            strategy="afterInteractive" → load sau khi page hydrate, không block LCP */}
        <Script
          id="material-symbols-font"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
              document.head.appendChild(link);
            `,
          }}
        />
      </body>
    </html>
  );
}
