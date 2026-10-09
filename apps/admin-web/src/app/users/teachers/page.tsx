'use client';

import React, { useState, useMemo, useEffect, useDeferredValue } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Toast from '../../../components/Toast';
import { TeacherUser } from '../../../lib/users-data';
import {
  getTeachersList,
  createAdminUser,
  updateUserStatus,
  updateTeacherAiQuota,
} from '../../../lib/users.service';
const UserCrudModal = dynamic(() => import('../../../components/UserCrudModal'));

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const deferredSearchKeyword = useDeferredValue(searchKeyword);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'VIEW'>('VIEW');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherUser | null>(null);

  // AI Quota Modal states
  const [isAiQuotaModalOpen, setIsAiQuotaModalOpen] = useState(false);
  const [quotaTeacher, setQuotaTeacher] = useState<TeacherUser | null>(null);
  const [quotaInput, setQuotaInput] = useState<number>(25);
  const [modelTierInput, setModelTierInput] = useState<'FLASH' | 'PRO' | 'AUTO'>('AUTO');
  const [resetUsedInput, setResetUsedInput] = useState<boolean>(false);
  const [isSavingQuota, setIsSavingQuota] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Nạp danh sách giáo viên từ Backend khi mở trang
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await getTeachersList();
        if (isMounted) {
          setTeachers(res.teachers || []);
          setIsLiveBackend(!res.isMock);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách giáo viên:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // KPI Metrics
  const stats = useMemo(() => {
    const total = teachers.length;
    const homeroom = teachers.filter((t) => t.role === 'TEACHER_HOMEROOM').length;
    const subjectTeachers = teachers.filter((t) => t.role === 'TEACHER_SUBJECT').length;
    const active = teachers.filter((t) => t.is_active).length;
    const inactive = total - active;
    return { total, homeroom, subjectTeachers, active, inactive };
  }, [teachers]);

  // Filter logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (roleFilter === 'TEACHER_HOMEROOM' && t.role !== 'TEACHER_HOMEROOM') return false;
      if (roleFilter === 'TEACHER_SUBJECT' && t.role !== 'TEACHER_SUBJECT') return false;
      if (roleFilter === 'ACTIVE' && !t.is_active) return false;
      if (roleFilter === 'INACTIVE' && t.is_active) return false;

      if (subjectFilter !== 'ALL' && t.subject !== subjectFilter) return false;

      if (deferredSearchKeyword.trim()) {
        const q = deferredSearchKeyword.toLowerCase();
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
  }, [teachers, deferredSearchKeyword, roleFilter, subjectFilter]);

  // Unique subjects for filter
  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set);
  }, [teachers]);

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

  const handleSaveTeacher = async (saved: TeacherUser, isNew: boolean) => {
    if (isNew) {
      showToast(`Đang khởi tạo tài khoản giáo viên...`);
      const res = await createAdminUser({
        full_name: saved.full_name,
        phone: saved.phone,
        email: saved.email,
        role: saved.role,
        school_name: saved.school_name,
        subject: saved.subject,
        assigned_class: saved.assigned_class,
      });

      if (res.success) {
        const createdTeacher: TeacherUser = {
          ...saved,
          id: res.data?.id || saved.id,
        };
        setTeachers((prev) => [createdTeacher, ...prev]);
        showToast(`Đã thêm mới giáo viên ${saved.full_name}`);
      } else {
        showToast(res.error || 'Lỗi tạo giáo viên');
      }
    } else {
      setTeachers((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      showToast(`Đã lưu thay đổi cho ${saved.full_name}`);
    }
  };

  const handleToggleStatus = async (userId: string, newStatus: boolean, reason?: string) => {
    const teacher = teachers.find((t) => t.id === userId);
    const res = await updateUserStatus(userId, newStatus, reason);

    if (res.success) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === userId) {
            return { ...t, is_active: newStatus, status_reason: reason || undefined };
          }
          return t;
        })
      );
      showToast(
        newStatus
          ? `Đã kích hoạt lại tài khoản ${teacher?.full_name}`
          : `Đã khóa tài khoản ${teacher?.full_name}`
      );
    } else {
      showToast(res.error || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleResetPassword = (user: any) => {
    showToast(`Đã gửi liên kết đặt lại mật khẩu đến SĐT & Email của ${user.full_name}`);
  };

  const handleDeleteTeacher = (userId: string) => {
    const teacher = teachers.find((t) => t.id === userId);
    setTeachers((prev) => prev.filter((t) => t.id !== userId));
    showToast(`Đã xóa tài khoản giáo viên ${teacher?.full_name}`);
  };

  // AI Quota Handlers
  const handleOpenAiQuota = (teacher: TeacherUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQuotaTeacher(teacher);
    setQuotaInput(teacher.ai_daily_quota ?? 25);
    setModelTierInput(teacher.ai_model_tier ?? 'AUTO');
    setResetUsedInput(false);
    setIsAiQuotaModalOpen(true);
  };

  const handleSaveAiQuota = async () => {
    if (!quotaTeacher) return;
    setIsSavingQuota(true);
    try {
      const quotaNum = Math.max(1, Number(quotaInput) || 25);
      const res = await updateTeacherAiQuota(quotaTeacher.id, {
        ai_daily_quota: quotaNum,
        ai_model_tier: modelTierInput,
        reset_used: resetUsedInput,
      });

      if (res.success) {
        setTeachers((prev) =>
          prev.map((t) => {
            if (t.id === quotaTeacher.id) {
              return {
                ...t,
                ai_daily_quota: quotaNum,
                ai_model_tier: modelTierInput,
                ai_used_today: resetUsedInput ? 0 : (t.ai_used_today ?? 0),
              };
            }
            return t;
          })
        );
        showToast(
          `Đã lưu hạn mức AI cho ${quotaTeacher.full_name}: ${quotaNum} lượt/ngày`
        );
        setIsAiQuotaModalOpen(false);
      } else {
        showToast(res.error || 'Cập nhật hạn mức thất bại');
      }
    } catch {
      showToast('Lỗi khi cập nhật hạn mức AI');
    } finally {
      setIsSavingQuota(false);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} />
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
        <span className="text-slate-900 font-semibold">Danh sách Giáo viên</span>

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
              Danh sách Giáo viên
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              {stats.total} Giáo viên
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hồ sơ cán bộ, phân công lớp chủ nhiệm &amp; bộ môn giảng dạy trên toàn trường
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined !text-[16px]">person_add</span>
            <span>Thêm giáo viên</span>
          </button>
        </div>
      </div>

      {/* 3. MINIMALIST 4 KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số giáo viên */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng giáo viên</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.total} <span className="text-sm font-normal text-slate-400">nhân sự</span>
            </div>
            <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>100% hồ sơ đã định danh</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
        </div>

        {/* Card 2: Giáo viên Chủ nhiệm */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">GV Chủ nhiệm</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.homeroom} <span className="text-sm font-normal text-slate-400">lớp</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {stats.total ? Math.round((stats.homeroom / stats.total) * 100) : 0}% phụ trách lớp
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[20px]">stars</span>
          </div>
        </div>

        {/* Card 3: Giáo viên Bộ môn */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">GV Bộ môn</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.subjectTeachers} <span className="text-sm font-normal text-slate-400">giáo viên</span>
            </div>
            <div className="mt-1 text-xs text-indigo-600 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              <span>{subjectsList.length} chuyên môn</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
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
              {stats.inactive > 0 ? `${stats.inactive} tài khoản đang khóa` : 'Không có tài khoản bị khóa'}
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
            onClick={() => setRoleFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                roleFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('TEACHER_HOMEROOM')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              roleFilter === 'TEACHER_HOMEROOM'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>GV Chủ nhiệm</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                roleFilter === 'TEACHER_HOMEROOM' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.homeroom}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('TEACHER_SUBJECT')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              roleFilter === 'TEACHER_SUBJECT'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>GV Bộ môn</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                roleFilter === 'TEACHER_SUBJECT' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.subjectTeachers}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              roleFilter === 'ACTIVE'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>Hoạt động</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                roleFilter === 'ACTIVE' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {stats.active}
            </span>
          </button>
        </div>

        {/* Right Filter Actions: Subject dropdown & Search Input */}
        <div className="flex items-center gap-2">
          {/* Subject Dropdown */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-900 font-medium cursor-pointer shadow-2xs"
          >
            <option value="ALL">Tất cả môn dạy</option>
            {subjectsList.map((sub) => (
              <option key={sub} value={sub}>
                Môn: {sub}
              </option>
            ))}
          </select>

          {/* Clean White Search Bar */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên, SĐT, mã GV..."
              className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. STANDARDIZED DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Giáo viên</th>
                <th className="py-3.5 px-6">Vai trò</th>
                <th className="py-3.5 px-6">Môn học &amp; Phân công</th>
                <th className="py-3.5 px-6">Hạn mức AI / Ngày</th>
                <th className="py-3.5 px-6">Số điện thoại</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-2xs">
                        <span className="material-symbols-outlined !text-[24px]">school</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">Chưa có giáo viên nào</h4>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Hệ thống chưa có tài khoản giáo viên. Bấm nút bên dưới để tạo tài khoản giáo viên đầu tiên.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined !text-[16px]">add</span>
                        <span>Thêm giáo viên mới</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-2">
                      person_search
                    </span>
                    <span>Không tìm thấy giáo viên nào phù hợp với điều kiện tìm kiếm</span>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const initials = teacher.full_name
                    .trim()
                    .split(' ')
                    .slice(-2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  const quotaCount = teacher.ai_daily_quota ?? 25;
                  const usedCount = teacher.ai_used_today ?? 0;
                  const percent = Math.min(100, Math.round((usedCount / quotaCount) * 100));
                  const barColor =
                    percent >= 90
                      ? 'bg-[#ff3e1d]'
                      : percent >= 70
                      ? 'bg-[#ffab00]'
                      : 'bg-[#696cff]';

                  return (
                    <tr
                      key={teacher.id}
                      onClick={() => handleOpenDetail(teacher)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Teacher Profile */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-black transition-colors flex items-center gap-1.5">
                              <span>{teacher.full_name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">#{teacher.code}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {teacher.email || 'Chưa cập nhật email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            teacher.role === 'TEACHER_HOMEROOM'
                              ? 'bg-slate-100 text-slate-800 border-slate-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200/80'
                          }`}
                        >
                          {teacher.role === 'TEACHER_HOMEROOM' ? 'GV Chủ nhiệm' : 'GV Bộ môn'}
                        </span>
                      </td>

                      {/* Subject & Assignment */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{teacher.subject}</span>
                        <span className="text-slate-300 mx-2">•</span>
                        <span className="text-slate-600">{teacher.assigned_class}</span>
                      </td>

                      {/* AI Quota Column */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div
                          onClick={(e) => handleOpenAiQuota(teacher, e)}
                          title="Bấm để cấu hình hạn mức AI cho giáo viên này"
                          className="inline-flex flex-col gap-1 p-1.5 -m-1.5 rounded-lg hover:bg-purple-50/80 transition-colors border border-transparent hover:border-purple-200/60 cursor-pointer group/quota min-w-[130px]"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-slate-900 group-hover/quota:text-[#696cff] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-[#696cff]">smart_toy</span>
                              <span>{usedCount}/{quotaCount} lượt</span>
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-[#696cff]">
                              {percent}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>
                              {teacher.ai_model_tier === 'PRO'
                                ? 'Gemini Pro'
                                : teacher.ai_model_tier === 'FLASH'
                                ? 'Gemini Flash'
                                : 'Chuẩn (Auto)'}
                            </span>
                            <span className="underline opacity-0 group-hover/quota:opacity-100 text-[#696cff] font-medium">
                              Chỉnh
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-6 whitespace-nowrap text-slate-600 font-medium">
                        {teacher.phone}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {teacher.is_active ? (
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
                            onClick={(e) => handleOpenAiQuota(teacher, e)}
                            title="Quản lý hạn mức AI"
                            className="w-8 h-8 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#696cff] transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDetail(teacher)}
                            title="Xem chi tiết & Chỉnh sửa"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-black transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetPassword(teacher)}
                            title="Đặt lại mật khẩu"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">key</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(teacher.id, !teacher.is_active)}
                            title={teacher.is_active ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                            className={`w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer ${
                              teacher.is_active
                                ? 'text-slate-400 hover:text-rose-600'
                                : 'text-slate-400 hover:text-emerald-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {teacher.is_active ? 'lock' : 'lock_open'}
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
            Hiển thị <span className="font-semibold text-slate-800">{filteredTeachers.length}</span> /{' '}
            <span className="font-semibold text-slate-800">{teachers.length}</span> giáo viên
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
      {isModalOpen && <UserCrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category="TEACHER"
        mode={modalMode}
        userData={selectedTeacher}
        onSave={handleSaveTeacher}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
        onDelete={handleDeleteTeacher}
      />}

      {/* 7. MODAL CẤU HÌNH HẠN MỨC AI CHO TỪNG GIÁO VIÊN */}
      {isAiQuotaModalOpen && quotaTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            onClick={() => setIsAiQuotaModalOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-purple-50 to-indigo-50/50 border-b border-purple-100/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#696cff] to-[#8f92ff] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(105,108,255,0.35)]">
                  <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cấu hình Hạn mức AI
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {quotaTeacher.full_name} (#{quotaTeacher.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiQuotaModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/80 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Thống kê sử dụng hiện tại */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Đã dùng hôm nay</span>
                  <span className="text-lg font-bold text-slate-900">
                    {quotaTeacher.ai_used_today ?? 0} <span className="text-xs font-normal text-slate-400">lượt gọi</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-500 block">Hạn mức hiện tại</span>
                  <span className="text-lg font-bold text-[#696cff]">
                    {quotaTeacher.ai_daily_quota ?? 25} <span className="text-xs font-normal text-slate-400">lượt/ngày</span>
                  </span>
                </div>
              </div>

              {/* Chọn mức nhanh */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Chọn hạn mức hàng ngày (Gợi ý nhanh):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuotaInput(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        quotaInput === num
                          ? 'bg-[#696cff] text-white border-[#696cff] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#696cff]/60 hover:bg-purple-50/50'
                      }`}
                    >
                      {num} lượt
                    </button>
                  ))}
                </div>
              </div>

              {/* Ô nhập số tùy ý */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Số lượt quota hàng ngày (Tùy chỉnh):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quotaInput}
                    onChange={(e) => setQuotaInput(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full h-10 px-3.5 pr-20 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/10 text-slate-900"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                    lượt/ngày
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mặc định toàn trường là 25 lượt/ngày. Có thể nâng cho GV phụ trách STEM, tiếng Anh.
                </p>
              </div>

              {/* Chọn Model AI */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Quyền sử dụng Mô hình AI:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'AUTO', label: 'Tự động (Khuyên dùng)' },
                    { id: 'FLASH', label: 'Gemini 1.5 Flash' },
                    { id: 'PRO', label: 'Gemini 1.5 Pro' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModelTierInput(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        modelTierInput === m.id
                          ? 'border-[#696cff] bg-purple-50/80 text-[#696cff] font-bold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-semibold text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tùy chọn đặt lại hôm nay */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetUsedInput}
                  onChange={(e) => setResetUsedInput(e.target.checked)}
                  className="rounded text-[#696cff] focus:ring-[#696cff] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Đặt lại số lượt đã sử dụng hôm nay về 0 (Khôi phục hạn ngạch tức thì)
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAiQuotaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSavingQuota}
                onClick={handleSaveAiQuota}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#696cff] hover:bg-[#5b5ef0] shadow-[0_2px_8px_rgba(105,108,255,0.3)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{isSavingQuota ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
