import React from 'react';

export const metadata = {
  title: 'GiaoVienHay - Cổng Quản trị Nền tảng',
  description: 'Trang quản trị toàn diện hệ sinh thái giáo dục GiaoVienHay',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f8fafc', color: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}
