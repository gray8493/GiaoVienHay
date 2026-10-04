'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { INITIAL_TEACHERS, TeacherUser } from '../../../lib/users-data';
import UserCrudModal from '../../../components/UserCrudModal';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherUser[]>(INITIAL_TEACHERS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'VIEW'>('VIEW');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherUser | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (roleFilter !== 'ALL' && t.role !== roleFilter) return false;
      if (subjectFilter !== 'ALL' && t.subject !== subjectFilter) return false;

      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const match =
          t.full_name.toLowerCase().includes(q) ||
          t.phone.includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.assigned_class.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [teachers, searchKeyword, roleFilter, subjectFilter]);

  // CRUD Handlers
  const handleOpenCreate = () => {
    setSelectedTeacher(null);
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenDetail = (teacher: TeacherUser) => {
    setSelectedTeacher(teacher);
    setModalMode('VIEW');
    setIsModalOpen(true);
  };

  const handleSaveTeacher = (saved: TeacherUser, isNew: boolean) => {
    if (isNew) {
      setTeachers((prev) => [saved, ...prev]);
      showToast(`Đã thêm mới giáo viên ${saved.full_name}`);
    } else {
      setTeachers((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      showToast(`Đã lưu thay đổi cho ${saved.full_name}`);
    }
  };

  const handleToggleStatus = (userId: string, newStatus: boolean, reason?: string) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === userId) {
          return { ...t, is_active: newStatus, status_reason: reason || undefined };
        }
        return t;
      })
    );
    const teacher = teachers.find((t) => t.id === userId);
    showToast(
      newStatus
        ? `Đã kích hoạt lại tài khoản ${teacher?.full_name}`
        : `Đã khóa tài khoản ${teacher?.full_name}`
    );
  };

  const handleResetPassword = (user: any) => {
    showToast(`Đã gửi liên kết reset mật khẩu đến SĐT & Email của ${user.full_name}`);
  };

  const handleDeleteTeacher = (userId: string) => {
    const teacher = teachers.find((t) => t.id === userId);
    setTeachers((prev) => prev.filter((t) => t.id !== userId));
    showToast(`Đã xóa tài khoản giáo viên ${teacher?.full_name}`);
  };

  return (
    <main className="flex-1 p-5 md:p-6 max-w-7xl w-full mx-auto flex flex-col gap-4 overflow-y-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Quay lại Người dùng</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Danh sách Giáo viên</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
              {teachers.length}
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span>Thêm giáo viên</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[17px]">
            search
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã GV, môn dạy..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs font-medium"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="TEACHER_HOMEROOM">GV Chủ nhiệm</option>
          <option value="TEACHER_SUBJECT">GV Bộ môn</option>
        </select>

        {/* Subject Filter */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs font-medium"
        >
          <option value="ALL">Tất cả môn học</option>
          <option value="Toán">Toán</option>
          <option value="Ngữ văn">Ngữ văn</option>
          <option value="Tiếng Anh">Tiếng Anh</option>
          <option value="Vật lý">Vật lý</option>
          <option value="Hóa học">Hóa học</option>
          <option value="Tin học">Tin học</option>
        </select>

        {(searchKeyword || roleFilter !== 'ALL' || subjectFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchKeyword('');
              setRoleFilter('ALL');
              setSubjectFilter('ALL');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Xóa bộ lọc"
          >
            <span className="material-symbols-outlined text-[17px]">filter_alt_off</span>
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3.5">Giáo viên</th>
                <th className="py-2.5 px-3.5">Vai trò</th>
                <th className="py-2.5 px-3.5">Môn giảng dạy &amp; Phân công</th>
                <th className="py-2.5 px-3.5">Số điện thoại</th>
                <th className="py-2.5 px-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Không tìm thấy giáo viên nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    onClick={() => handleOpenDetail(teacher)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] flex items-center justify-center border border-indigo-200/70 flex-shrink-0">
                          {teacher.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{teacher.full_name}</span>
                            <span className="text-[10px] font-mono text-slate-400">#{teacher.code}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">{teacher.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                          teacher.role === 'TEACHER_HOMEROOM'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}
                      >
                        {teacher.role === 'TEACHER_HOMEROOM' ? 'GV Chủ nhiệm' : 'GV Bộ môn'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{teacher.subject}</span>
                      <span className="text-slate-300 mx-1.5">•</span>
                      <span className="text-slate-500">{teacher.assigned_class}</span>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-slate-600">
                      {teacher.phone}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {teacher.is_active ? (
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
        category="TEACHER"
        mode={modalMode}
        userData={selectedTeacher}
        onSave={handleSaveTeacher}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
        onDelete={handleDeleteTeacher}
      />
    </main>
  );
}
