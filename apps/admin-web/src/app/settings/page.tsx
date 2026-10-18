'use client';

import React, { useState, useEffect } from 'react';
import Toast, { type ToastVariant } from '../../components/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  clearAuthSession,
  getStoredUser,
  AdminUser,
  saveAuthSession,
  getAuthToken,
  getRefreshToken,
  changePasswordApi,
} from '@/lib/auth';
import { apiFetch } from '@/lib/api-client';

type SettingsTab = 'PROFILE' | 'SECURITY';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE');

  // 1. Profile States (Từ phiên đăng nhập thực tế)
  const [adminFullName, setAdminFullName] = useState('Quản trị viên Hệ thống');
  const [adminEmail, setAdminEmail] = useState('admin@giaovienhay.vn');
  const [adminPhone, setAdminPhone] = useState('0988888888');
  const [adminRoleTitle, setAdminRoleTitle] = useState('Quản trị viên Hệ thống (ADMIN)');
  const [schoolUnitName, setSchoolUnitName] = useState('Trường Tiểu Học Chu Văn An');

  // Nạp thông tin tài khoản đang đăng nhập từ Session
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (user.full_name) setAdminFullName(user.full_name);
      if (user.email) setAdminEmail(user.email);
      if (user.phone) setAdminPhone(user.phone);
      if (user.role) setAdminRoleTitle(user.role === 'ADMIN' ? 'Quản trị viên Hệ thống (ADMIN)' : String(user.role));
      if (user.school_name) setSchoolUnitName(user.school_name);
    }
  }, []);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const showToast = (msg: string, variant: ToastVariant = 'success') => {
    setToastMessage(msg);
    setToastVariant(variant);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await apiFetch('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: adminFullName.trim(),
          email: adminEmail.trim(),
          phone: adminPhone.trim(),
        }),
      });

      // Cập nhật lại session lưu trữ local
      const currentUser = getStoredUser();
      const accessToken = getAuthToken();
      const refreshToken = getRefreshToken();
      if (currentUser && accessToken && refreshToken) {
        const updatedUser: AdminUser = {
          ...currentUser,
          full_name: adminFullName.trim(),
          email: adminEmail.trim(),
          phone: adminPhone.trim(),
        };
        saveAuthSession(accessToken, refreshToken, updatedUser);
      }

      if (res.success) {
        showToast('Đã cập nhật thông tin hồ sơ Quản trị viên thành công');
      } else {
        showToast(res.error || 'Không thể cập nhật hồ sơ Quản trị viên.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể kết nối máy chủ.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await changePasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Đã đổi mật khẩu tài khoản Admin thành công');
      } else {
        showToast(res.error || 'Lỗi đổi mật khẩu', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-8 min-h-screen">
      {/* Toast Notification (Text Only) */}
      {toastMessage && (
        <Toast message={toastMessage} variant={toastVariant} />
      )}

      {/* Breadcrumb Navigation (Text Only) */}
      <nav className="flex items-center gap-2 text-slate-500 text-xs font-medium">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Cài đặt tài khoản</span>
      </nav>

      {/* Page Title Header (Text Only) */}
      <div className="pb-2 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Cài đặt tài khoản
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            Quản trị viên
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1.5 font-normal max-w-2xl">
          Quản lý thông tin định danh quản trị viên, thông tin đơn vị trường học và bảo mật mật khẩu tài khoản.
        </p>
      </div>

      {/* Filter Tabs Bar (Text Only) */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === 'PROFILE'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Hồ sơ Quản trị viên
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === 'SECURITY'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HỒ SƠ QUẢN TRỊ VIÊN */}
      {/* ========================================================================= */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6 w-full">
          {/* Identity Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                  {adminFullName.split(' ').slice(-1)[0][0] || 'A'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900">{adminFullName}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      Đang hoạt động
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {adminEmail} • <span className="text-blue-700 font-semibold">{adminRoleTitle}</span>
                  </p>
                  <p className="text-xs text-slate-600 font-medium pt-0.5">
                    Đơn vị: <strong className="text-slate-800">{schoolUnitName}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Thông tin cá nhân & Đơn vị */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
          >
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Thông tin cá nhân &amp; Liên hệ</h3>
              <p className="text-xs text-slate-500 mt-1">
                Dữ liệu định danh của Quản trị viên phục vụ ghi nhật ký truy cập và đối soát hệ thống.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Họ và tên Quản trị viên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-900 transition shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Tên hiển thị trên hệ thống quản trị.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Email tài khoản Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-900 transition shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Hòm thư nhận thông báo tài khoản.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Số điện thoại đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-mono font-medium focus:outline-none focus:border-slate-900 transition shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Số điện thoại dùng để đăng nhập hệ thống.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Đơn vị trường học trực thuộc
                  </label>
                  <input
                    type="text"
                    value={schoolUnitName}
                    readOnly
                    className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium shadow-2xs cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-400">Đơn vị quản trị gán cố định từ cơ sở dữ liệu.</p>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Lưu ý kiểm tra chính xác số điện thoại và email.
              </span>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="h-10 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSavingProfile ? 'Đang lưu...' : 'Lưu thông tin hồ sơ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ĐỔI MẬT KHẨU BẢO MẬT */}
      {/* ========================================================================= */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6 w-full">
          <form
            onSubmit={handleChangePassword}
            className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
          >
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Đổi mật khẩu tài khoản</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thay đổi mật khẩu đăng nhập định kỳ giúp bảo đảm an toàn cho tài khoản Quản trị viên.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Mật khẩu bạn đang dùng để đăng nhập.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Độ dài tối thiểu 6 ký tự.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Khớp với mật khẩu mới ở ô bên cạnh.</p>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Sau khi đổi mật khẩu thành công, phiên đăng nhập sẽ tiếp tục được duy trì.
              </span>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="h-10 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSavingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM LOGOUT CONTROL (Text Only) */}
      {/* ========================================================================= */}
      <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Phiên đăng nhập Quản trị viên</h4>
          <p className="text-xs text-slate-500">
            Đăng xuất tài khoản an toàn khỏi phiên làm việc hiện tại trên thiết bị này khi kết thúc phiên quản trị.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearAuthSession();
            showToast('Đang đăng xuất khỏi hệ thống...');
            setTimeout(() => {
              router.push('/login');
            }, 400);
          }}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined !text-[18px] text-rose-500">logout</span>
          <span>Đăng xuất khỏi hệ thống</span>
        </button>
      </div>
    </main>
  );
}
