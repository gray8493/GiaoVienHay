'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { INITIAL_PARENTS, ParentUser } from '../../../lib/users-data';
import UserCrudModal from '../../../components/UserCrudModal';

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentUser[]>(INITIAL_PARENTS);
  const [searchKeyword, setSearchKeyword] = useState('');

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

  // Filter logic
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
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
  }, [parents, searchKeyword]);

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
    showToast(`Đã gửi liên kết reset mật khẩu đến SĐT & Email của ${user.full_name}`);
  };

  const handleDeleteParent = (userId: string) => {
    const parent = parents.find((p) => p.id === userId);
    setParents((prev) => prev.filter((p) => p.id !== userId));
    showToast(`Đã xóa tài khoản phụ huynh ${parent?.full_name}`);
  };

  return (
    <main className="flex-1 p-5 md:p-6 max-w-7xl w-full mx-auto flex flex-col gap-4 overflow-y-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="material-symbols-outlined text-teal-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header: Back & Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/users"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Quay lại Người dùng</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Phụ huynh &amp; Học sinh
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100/80">
              {parents.length}
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-8.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span>Thêm phụ huynh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[17px]">
            search
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên PH, số điện thoại, tên con, lớp..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {searchKeyword && (
          <button
            onClick={() => setSearchKeyword('')}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Xóa tìm kiếm"
          >
            <span className="material-symbols-outlined text-[17px]">close</span>
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3.5">Phụ huynh</th>
                <th className="py-2.5 px-3.5">Số điện thoại</th>
                <th className="py-2.5 px-3.5">Học sinh liên kết (Con)</th>
                <th className="py-2.5 px-3.5">Trường học</th>
                <th className="py-2.5 px-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Không tìm thấy phụ huynh nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => (
                  <tr
                    key={parent.id}
                    onClick={() => handleOpenDetail(parent)}
                    className="hover:bg-teal-50/30 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-[11px] flex items-center justify-center border border-teal-200/70 flex-shrink-0">
                          {parent.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{parent.full_name}</span>
                            <span className="text-[10px] font-mono text-slate-400">#{parent.code}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">{parent.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-slate-600">
                      {parent.phone}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {parent.students && parent.students.length > 0 ? (
                          parent.students.map((st, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50/70 text-teal-800 border border-teal-100 text-[11px]"
                            >
                              <span className="font-semibold">{st.full_name}</span>
                              <span className="text-teal-600 font-mono">({st.class_name})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Chưa liên kết</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600">
                      {parent.school_name}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {parent.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Bị khóa
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Popup Modal */}
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
