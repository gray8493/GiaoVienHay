'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { INITIAL_PARENTS, ParentUser } from '../../../lib/users-data';
import UserCrudModal from '../../../components/UserCrudModal';

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentUser[]>(INITIAL_PARENTS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'MULTI_CHILD'>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'VIEW'>('VIEW');
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Metrics
  const stats = useMemo(() => {
    const total = parents.length;
    const active = parents.filter((p) => p.is_active).length;
    const inactive = total - active;
    const totalLinkedStudents = parents.reduce((acc, p) => acc + (p.students?.length || 0), 0);
    const multiChildParents = parents.filter((p) => (p.students?.length || 0) > 1).length;
    return { total, active, inactive, totalLinkedStudents, multiChildParents };
  }, [parents]);

  // Filter logic
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      if (statusFilter === 'ACTIVE' && !p.is_active) return false;
      if (statusFilter === 'INACTIVE' && p.is_active) return false;
      if (statusFilter === 'MULTI_CHILD' && (p.students?.length || 0) <= 1) return false;

      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchBasic =
          p.full_name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.school_name.toLowerCase().includes(q);

        const matchStudent = p.students?.some(
          (st) =>
            st.full_name.toLowerCase().includes(q) ||
            st.class_name.toLowerCase().includes(q) ||
            st.student_code.toLowerCase().includes(q)
        );

        if (!matchBasic && !matchStudent) return false;
      }
      return true;
    });
  }, [parents, searchKeyword, statusFilter]);

  // CRUD Handlers
  const handleOpenCreate = () => {
    setSelectedParent(null);
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenDetail = (parent: ParentUser) => {
    setSelectedParent(parent);
    setModalMode('VIEW');
    setIsModalOpen(true);
  };

  const handleSaveParent = (saved: ParentUser, isNew: boolean) => {
    if (isNew) {
      setParents((prev) => [saved, ...prev]);
      showToast(`Đã thêm mới phụ huynh ${saved.full_name}`);
    } else {
      setParents((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      showToast(`Đã lưu thay đổi cho ${saved.full_name}`);
    }
  };

  const handleToggleStatus = (userId: string, newStatus: boolean, reason?: string) => {
    setParents((prev) =>
      prev.map((p) => {
        if (p.id === userId) {
          return { ...p, is_active: newStatus, status_reason: reason || undefined };
        }
        return p;
      })
    );
    const parent = parents.find((p) => p.id === userId);
    showToast(
      newStatus
        ? `Đã kích hoạt lại tài khoản ${parent?.full_name}`
        : `Đã khóa tài khoản ${parent?.full_name}`
    );
  };

  const handleResetPassword = (user: any) => {
    showToast(`Đã gửi liên kết đặt lại mật khẩu đến SĐT & Email của ${user.full_name}`);
  };

  const handleDeleteParent = (userId: string) => {
    const parent = parents.find((p) => p.id === userId);
    setParents((prev) => prev.filter((p) => p.id !== userId));
    showToast(`Đã xóa tài khoản phụ huynh ${parent?.full_name}`);
  };

  return (
    <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP BREADCRUMB NAVIGATION & BACK ARROW BUTTON */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-slate-900 transition-colors cursor-pointer">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
        <Link href="/users" className="hover:text-slate-900 transition-colors cursor-pointer">
          Quản lý Người dùng
        </Link>
        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
        <span className="text-slate-900 font-semibold">Danh sách Phụ huynh</span>

        {/* Back Button */}
        <Link
          href="/users"
          title="Quay lại Quản lý Người dùng"
          className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
      </nav>

      {/* 2. PAGE TITLE & MAJOR ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Danh sách Phụ huynh
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
              {stats.total} Phụ huynh
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hồ sơ tài khoản phụ huynh &amp; quản trị kết nối con em qua Sổ liên lạc điện tử GiaoVienHay
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => showToast('Đang tạo file xuất Excel danh sách phụ huynh...')}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined !text-[16px] text-slate-500">download</span>
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined !text-[16px]">person_add</span>
            <span>Thêm phụ huynh</span>
          </button>
        </div>
      </div>

      {/* 3. MINIMALIST 4 KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số phụ huynh */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng phụ huynh</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.total} <span className="text-sm font-normal text-slate-400">tài khoản</span>
            </div>
            <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>Định danh qua số điện thoại</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-[20px]">family_restroom</span>
          </div>
        </div>

        {/* Card 2: Tổng con em liên kết */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Học sinh liên kết</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.totalLinkedStudents} <span className="text-sm font-normal text-slate-400">học sinh</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Trung bình {(stats.total ? (stats.totalLinkedStudents / stats.total).toFixed(1) : '1.0')} con/phụ huynh
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
        </div>

        {/* Card 3: Phụ huynh có từ 2 con */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Gia đình nhiều con</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.multiChildParents} <span className="text-sm font-normal text-slate-400">phụ huynh</span>
            </div>
            <div className="mt-1 text-xs text-indigo-600 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">diversity_1</span>
              <span>Quản lý chung 1 tài khoản</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-[20px]">diversity_1</span>
          </div>
        </div>

        {/* Card 4: Trạng thái tài khoản */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Đang hoạt động</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.active} <span className="text-sm font-normal text-slate-400">/ {stats.total}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {stats.inactive > 0 ? `${stats.inactive} tài khoản đang khóa` : '100% tài khoản hoạt động'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
        </div>
      </div>

      {/* 4. PILL FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Rounded-full Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>Đang hoạt động</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'ACTIVE' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('MULTI_CHILD')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'MULTI_CHILD'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>Nhiều con em</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'MULTI_CHILD' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.multiChildParents}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'INACTIVE'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>Đã khóa</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'INACTIVE' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.inactive}
            </span>
          </button>
        </div>

        {/* Clean White Search Bar */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên PH, tên con, SĐT..."
            className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-slate-800 placeholder:text-slate-400 shadow-2xs"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. STANDARDIZED DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Phụ huynh</th>
                <th className="py-3.5 px-6">Số điện thoại</th>
                <th className="py-3.5 px-6">Con em liên kết (Học sinh)</th>
                <th className="py-3.5 px-6">Trường học</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-2">
                      person_search
                    </span>
                    <span>Không tìm thấy phụ huynh nào phù hợp với điều kiện tìm kiếm</span>
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => {
                  const initials = parent.full_name
                    .trim()
                    .split(' ')
                    .slice(-2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={parent.id}
                      onClick={() => handleOpenDetail(parent)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Parent Profile */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                              <span>{parent.full_name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">#{parent.code}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {parent.email || 'Chưa liên kết email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-6 whitespace-nowrap text-slate-600 font-medium">
                        {parent.phone}
                      </td>

                      {/* Linked Children Chips */}
                      <td className="py-3.5 px-6">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {parent.students && parent.students.length > 0 ? (
                            parent.students.map((child, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                              >
                                <span className="material-symbols-outlined text-[13px] text-slate-500">
                                  person
                                </span>
                                <span className="font-semibold text-slate-900">{child.full_name}</span>
                                <span className="text-slate-400 font-normal">({child.class_name})</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">Chưa liên kết học sinh</span>
                          )}
                        </div>
                      </td>

                      {/* School Name */}
                      <td className="py-3.5 px-6 whitespace-nowrap text-slate-700 font-medium">
                        {parent.school_name}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {parent.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Đang hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(parent)}
                            title="Xem chi tiết & Chỉnh sửa"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetPassword(parent)}
                            title="Đặt lại mật khẩu"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">key</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(parent.id, !parent.is_active)}
                            title={parent.is_active ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                            className={`w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer ${
                              parent.is_active
                                ? 'text-slate-400 hover:text-rose-600'
                                : 'text-slate-400 hover:text-emerald-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {parent.is_active ? 'lock' : 'lock_open'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. TABLE PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <span className="font-semibold text-slate-800">{filteredParents.length}</span> /{' '}
            <span className="font-semibold text-slate-800">{parents.length}</span> phụ huynh
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed font-medium"
            >
              Trước
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold">1</span>
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed font-medium"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* CRUD / Detail Modal */}
      <UserCrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category="PARENT"
        mode={modalMode}
        userData={selectedParent}
        onSave={handleSaveParent}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
        onDelete={handleDeleteParent}
      />
    </main>
  );
}
