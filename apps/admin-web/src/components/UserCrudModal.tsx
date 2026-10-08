'use client';

import React, { useState, useEffect } from 'react';
import { TeacherUser, ParentUser, LinkedStudent } from '../lib/users-data';

export type UserCategory = 'TEACHER' | 'PARENT';

interface UserCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: UserCategory;
  mode: 'CREATE' | 'VIEW';
  userData: TeacherUser | ParentUser | null;
  onSave: (savedUser: any, isNew: boolean) => void;
  onToggleStatus: (userId: string, newStatus: boolean, reason?: string) => void;
  onResetPassword: (user: TeacherUser | ParentUser) => void;
  onDelete: (userId: string) => void;
}

export default function UserCrudModal({
  isOpen,
  onClose,
  category,
  mode: initialMode,
  userData,
  onSave,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: UserCrudModalProps) {
  const [isEditing, setIsEditing] = useState(initialMode === 'CREATE');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states for Teacher
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('Trường Tiểu Học Chu Văn An');
  const [teacherRole, setTeacherRole] = useState<'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT'>('TEACHER_SUBJECT');
  const [subject, setSubject] = useState('Toán');
  const [assignedClass, setAssignedClass] = useState('');
  const [aiDailyQuota, setAiDailyQuota] = useState(25);

  // Form states for Parent
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('1A');
  const [newStudentCode, setNewStudentCode] = useState('');

  // Sync state whenever modal opens or userData changes
  useEffect(() => {
    if (initialMode === 'CREATE') {
      setIsEditing(true);
      setFullName('');
      setPhone('');
      setEmail('');
      setSchoolName('Trường Tiểu Học Chu Văn An');
      setTeacherRole('TEACHER_SUBJECT');
      setSubject('Toán');
      setAssignedClass('');
      setAiDailyQuota(25);
      setStudents([]);
    } else if (userData) {
      setIsEditing(false);
      setFullName(userData.full_name || '');
      setPhone(userData.phone || '');
      setEmail(userData.email || '');
      setSchoolName(userData.school_name || 'Trường Tiểu Học Chu Văn An');

      if (category === 'TEACHER') {
        const t = userData as TeacherUser;
        setTeacherRole(t.role || 'TEACHER_SUBJECT');
        setSubject(t.subject || 'Toán');
        setAssignedClass(t.assigned_class || '');
        setAiDailyQuota(t.ai_daily_quota ?? 25);
      } else {
        const p = userData as ParentUser;
        setStudents(p.students ? [...p.students] : []);
      }
    }
    setShowStatusConfirm(false);
    setShowDeleteConfirm(false);
    setStatusReason('');
  }, [isOpen, initialMode, userData, category]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const code = newStudentCode.trim() || `HS-${Math.floor(100 + Math.random() * 900)}`;
    setStudents((prev) => [
      ...prev,
      { student_code: code, full_name: newStudentName.trim(), class_name: newStudentClass },
    ]);
    setNewStudentName('');
    setNewStudentCode('');
  };

  const handleRemoveStudent = (index: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const isNew = initialMode === 'CREATE';
    const baseId = userData?.id || `usr_${category === 'TEACHER' ? 't' : 'p'}_${Date.now()}`;
    const baseCode =
      userData?.code ||
      `${category === 'TEACHER' ? 'GV' : 'PH'}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (category === 'TEACHER') {
      const savedTeacher: TeacherUser = {
        id: baseId,
        code: baseCode,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role: teacherRole,
        school_name: schoolName,
        subject,
        assigned_class: assignedClass.trim() || (teacherRole === 'TEACHER_HOMEROOM' ? 'Chủ nhiệm' : 'Bộ môn'),
        is_active: userData ? userData.is_active : true,
        ai_daily_quota: Number(aiDailyQuota) || 25,
        ai_used_today: (userData as TeacherUser)?.ai_used_today ?? 0,
        ai_model_tier: (userData as TeacherUser)?.ai_model_tier ?? 'AUTO',
        created_at: userData?.created_at || new Date().toISOString(),
      };
      onSave(savedTeacher, isNew);
    } else {
      const savedParent: ParentUser = {
        id: baseId,
        code: baseCode,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        school_name: schoolName,
        students,
        is_active: userData ? userData.is_active : true,
        created_at: userData?.created_at || new Date().toISOString(),
      };
      onSave(savedParent, isNew);
    }
    onClose();
  };

  const teacherData = category === 'TEACHER' && userData ? (userData as TeacherUser) : null;
  const parentData = category === 'PARENT' && userData ? (userData as ParentUser) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {initialMode === 'CREATE'
                ? category === 'TEACHER'
                  ? 'Thêm giáo viên mới'
                  : 'Thêm phụ huynh mới'
                : isEditing
                ? 'Chỉnh sửa thông tin'
                : 'Thông tin tài khoản'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[calc(85vh-100px)] overflow-y-auto">
          {/* VIEW MODE */}
          {!isEditing && userData && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center border flex-shrink-0 bg-slate-900 text-white border-slate-900">
                    {userData.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{userData.full_name}</h4>
                      <span className="text-[11px] font-mono text-slate-400">#{userData.code}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{userData.school_name}</span>
                      <span>•</span>
                      {userData.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Đang bị khóa
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Sửa</span>
                </button>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Số điện thoại</span>
                  <span className="font-semibold text-slate-800 font-mono">{userData.phone}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Email liên hệ</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {userData.email || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>

              {/* Role Specific Details */}
              {teacherData && (
                <div className="p-3 rounded-lg border border-slate-100 bg-white text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Vai trò:</span>
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {teacherData.role === 'TEACHER_HOMEROOM' ? 'Giáo viên Chủ nhiệm' : 'Giáo viên Bộ môn'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Môn giảng dạy:</span>
                    <span className="font-semibold text-slate-800">{teacherData.subject}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Phân công lớp:</span>
                    <span className="font-semibold text-slate-800">{teacherData.assigned_class}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-slate-400">Hạn mức AI:</span>
                    <span className="font-semibold text-[#696cff] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                      <span>
                        {teacherData.ai_daily_quota ?? 25} lượt/ngày (Đã dùng: {teacherData.ai_used_today ?? 0})
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {parentData && (
                <div className="p-3 rounded-lg border border-slate-100 bg-white text-xs space-y-2">
                  <span className="text-slate-500 font-semibold block">Học sinh liên kết:</span>
                  {parentData.students && parentData.students.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parentData.students.map((st, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[15px] text-slate-600">face</span>
                          <span className="font-semibold">{st.full_name}</span>
                          <span className="text-slate-500 font-mono text-[11px]">({st.class_name})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Chưa liên kết học sinh nào</span>
                  )}
                </div>
              )}

              {/* Inline Lock Confirmation */}
              {showStatusConfirm && (
                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                  <span className="font-semibold text-amber-900 block">
                    {userData.is_active ? 'Khóa tài khoản người dùng' : 'Kích hoạt lại tài khoản'}
                  </span>
                  {userData.is_active && (
                    <input
                      type="text"
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="Nhập lý do khóa (tùy chọn)..."
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs focus:outline-none"
                    />
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowStatusConfirm(false)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        onToggleStatus(userData.id, !userData.is_active, statusReason);
                        setShowStatusConfirm(false);
                      }}
                      className={`px-3 py-1 rounded text-white font-semibold ${
                        userData.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-2">
                  <span className="font-semibold text-rose-900 block">
                    Bạn có chắc muốn xóa tài khoản này không?
                  </span>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        onDelete(userData.id);
                        onClose();
                      }}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onResetPassword(userData)}
                    className="px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-slate-700">lock_reset</span>
                    <span>Reset mật khẩu</span>
                  </button>

                  <button
                    onClick={() => setShowStatusConfirm(true)}
                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      userData.is_active
                        ? 'border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100/60'
                        : 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {userData.is_active ? 'block' : 'lock_open'}
                    </span>
                    <span>{userData.is_active ? 'Khóa' : 'Mở khóa'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-2.5 py-1.5 rounded-md text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          )}

          {/* EDIT / CREATE FORM */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu.vn"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Trường học</label>
                <select
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
                >
                  <option value="THCS Lê Quý Đôn">THCS Lê Quý Đôn</option>
                  <option value="THCS Chu Văn An">THCS Chu Văn An</option>
                  <option value="THCS Phan Đình Phùng">THCS Phan Đình Phùng</option>
                </select>
              </div>

              {/* TEACHER SPECIFIC FIELDS */}
              {category === 'TEACHER' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Vai trò</label>
                      <select
                        value={teacherRole}
                        onChange={(e) => setTeacherRole(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
                      >
                        <option value="TEACHER_SUBJECT">GV Bộ môn</option>
                        <option value="TEACHER_HOMEROOM">GV Chủ nhiệm</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Môn giảng dạy</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
                      >
                        <option value="Toán">Toán</option>
                        <option value="Ngữ văn">Ngữ văn</option>
                        <option value="Tiếng Anh">Tiếng Anh</option>
                        <option value="Vật lý">Vật lý</option>
                        <option value="Hóa học">Hóa học</option>
                        <option value="Tin học">Tin học</option>
                        <option value="Sinh học">Sinh học</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Phân công lớp</label>
                    <input
                      type="text"
                      value={assignedClass}
                      onChange={(e) => setAssignedClass(e.target.value)}
                      placeholder={teacherRole === 'TEACHER_HOMEROOM' ? 'Ví dụ: Chủ nhiệm 7A' : 'Ví dụ: Khối 7 & 8'}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#696cff]">smart_toy</span>
                        <span>Hạn mức sử dụng AI (Lượt/ngày)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Mặc định: 25 lượt/ngày</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={aiDailyQuota}
                      onChange={(e) => setAiDailyQuota(Math.max(1, Number(e.target.value) || 1))}
                      placeholder="25"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#696cff] shadow-2xs"
                    />
                  </div>
                </>
              )}

              {/* PARENT SPECIFIC FIELDS (LINKED STUDENTS) */}
              {category === 'PARENT' && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="block text-slate-700 font-semibold">Học sinh liên kết (Con)</label>

                  {/* Existing students list */}
                  {students.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {students.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-600 text-[16px]">school</span>
                            <span className="font-semibold text-slate-800">{st.full_name}</span>
                            <span className="text-slate-400 text-[11px] font-mono">
                              ({st.class_name} • {st.student_code})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                            title="Xóa học sinh"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add student inline */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Tên học sinh"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-slate-900"
                    />
                    <select
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="6A">6A</option>
                      <option value="6B">6B</option>
                      <option value="7A">7A</option>
                      <option value="7B">7B</option>
                      <option value="8A">8A</option>
                      <option value="8B">8B</option>
                      <option value="9A">9A</option>
                      <option value="9B">9B</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddStudent}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors cursor-pointer"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              )}

              {/* Form Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                {initialMode === 'VIEW' && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-black"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{initialMode === 'CREATE' ? 'Tạo tài khoản' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
