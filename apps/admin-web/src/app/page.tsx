import React from 'react';
import { UserRole } from '@giaovienhay/shared-types';

export default function AdminDashboardPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>
          Hệ thống Quản trị Nền tảng GiaoVienHay
        </h1>
        <p style={{ color: '#64748b' }}>
          Quản lý tập trung 12 phân hệ nghiệp vụ, người dùng, lớp học, học phí và cấu hình hệ thống.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155' }}>Người Dùng</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Quản lý Giáo viên, Phụ huynh và phân quyền Quản trị.</p>
        </div>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155' }}>Lớp Học & Học Sinh</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Theo dõi danh sách lớp, sĩ số và giáo viên chủ nhiệm.</p>
        </div>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155' }}>Học Phí & BHYT</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Báo cáo tổng hợp số liệu thu nộp học phí toàn trường.</p>
        </div>
      </section>
    </main>
  );
}
