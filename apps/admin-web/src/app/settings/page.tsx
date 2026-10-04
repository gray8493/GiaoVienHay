'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type SettingsTab = 'PROFILE' | 'ACADEMIC' | 'NOTIFICATIONS' | 'SECURITY';

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE');

  // 1. Profile States
  const [adminFullName, setAdminFullName] = useState('Hoàng Minh Đức');
  const [adminEmail, setAdminEmail] = useState('admin.hoang@giaovienhay.vn');
  const [adminPhone, setAdminPhone] = useState('0988 123 456');
  const [adminRoleTitle, setAdminRoleTitle] = useState('Platform Super Admin');
  const [adminBio, setAdminBio] = useState('Chịu trách nhiệm giám sát toàn diện vận hành, phân quyền người dùng và hạn mức AI trên hệ thống GiaoVienHay.');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2. Academic & School States
  const [schoolUnitName, setSchoolUnitName] = useState('Hệ thống Quản lý Giáo dục GiaoVienHay');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState('Học kỳ I');
  const [gradeScope, setGradeScope] = useState('Cấp 1 & Cấp 2 (Khối 1 - Khối 9)');
  const [headquartersAddress, setHeadquartersAddress] = useState('Số 18, Phố Duy Tân, Quận Cầu Giấy, TP. Hà Nội');

  // 3. Notification & FCM States
  const [enableInstantGradeNotice, setEnableInstantGradeNotice] = useState(true);
  const [enableAbsentAlert, setEnableAbsentAlert] = useState(true);
  const [enableExamReminder, setEnableExamReminder] = useState(true);
  const [enableSystemAlertEmail, setEnableSystemAlertEmail] = useState(true);

  // 4. Security & Session States
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState(24);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      showToast('Đã cập nhật thông tin hồ sơ Quản trị viên thành công!');
    }, 450);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp');
      return;
    }
    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Đã đổi mật khẩu tài khoản Admin thành công!');
    }, 550);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    setTimeout(() => {
      setIsSavingGeneral(false);
      showToast('Đã lưu cấu hình thiết lập hệ thống thành công!');
    }, 450);
  };

  return (
    <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-8 dot-matrix-bg min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[19px] text-emerald-400">check_circle</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-slate-500 text-xs">
        <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Trang chủ</span>
        </Link>
        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
        <span className="text-blue-600 font-semibold">Cài đặt &amp; Hồ sơ cá nhân</span>
      </nav>

      {/* Page Title & Hero Header */}
      <div className="pb-2 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Cài đặt &amp; Hồ sơ
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            Platform Admin
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1.5 font-normal max-w-2xl">
          Quản trị thông tin định danh cá nhân, cơ chế bảo mật tài khoản, thông số niên khóa đào tạo và dịch vụ thông báo đẩy.
        </p>
      </div>

      {/* Modern Filter Tabs Bar (Spacious Pill Badges) */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'PROFILE'
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined !text-[17px]">person</span>
          <span>Hồ sơ Quản trị viên</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACADEMIC')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'ACADEMIC'
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined !text-[17px]">domain</span>
          <span>Đơn vị &amp; Niên khóa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'NOTIFICATIONS'
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined !text-[17px]">notifications_active</span>
          <span>Thông báo Đẩy &amp; FCM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'SECURITY'
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined !text-[17px]">shield</span>
          <span>Bảo mật &amp; Phiên làm việc</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HỒ SƠ QUẢN TRỊ VIÊN (INDEPENDENT SPACIOUS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6 w-full">
          {/* Card 1: Identity & Avatar Banner Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-3xl shadow-md ring-4 ring-blue-50/80">
                    {adminFullName.split(' ').slice(-1)[0][0] || 'H'}
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Mở trình chọn ảnh đại diện')}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-black transition cursor-pointer ring-2 ring-white"
                    title="Đổi ảnh đại diện"
                  >
                    <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900">{adminFullName}</h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Đang hoạt động
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {adminEmail} • <span className="text-blue-700 font-semibold">{adminRoleTitle}</span>
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                    <span>Mã ID: ADM-9901</span>
                    <span>•</span>
                    <span>Quyền: TOÀN QUYỀN NỀN TẢNG</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Mở trình chọn ảnh đại diện mới')}
                  className="h-10 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">upload</span>
                  <span>Thay đổi ảnh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Thông tin cá nhân & Liên hệ (Personal Information Form) */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Thông tin cá nhân &amp; Liên hệ</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thông tin định danh của Quản trị viên, được dùng để ghi log truy vết và gửi thông báo xác thực.
              </p>
            </div>

            {/* Card Body with Generous Inputs */}
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
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Tên hiển thị trên Header và nhật ký quản trị.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Email tài khoản Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Dùng để đăng nhập và khôi phục tài khoản khi cần.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Số điện thoại xác thực OTP
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-mono font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Nhận mã OTP khi đăng nhập từ thiết bị lạ.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Chức danh / Phòng ban phụ trách
                  </label>
                  <input
                    type="text"
                    value={adminRoleTitle}
                    onChange={(e) => setAdminRoleTitle(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Quyền hạn thực thi: Platform Super Admin.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block text-xs font-bold text-slate-800">
                  Ghi chú nhiệm vụ / Phạm vi phụ trách
                </label>
                <textarea
                  rows={3}
                  value={adminBio}
                  onChange={(e) => setAdminBio(e.target.value)}
                  className="w-full p-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-normal focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs resize-none"
                />
              </div>
            </div>

            {/* Dedicated Spacious Card Action Footer */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Hãy chắc chắn đã kiểm tra kỹ trước khi bấm lưu.
              </span>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="h-10 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-60"
              >
                <span className="material-symbols-outlined !text-[17px]">save</span>
                <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu thông tin hồ sơ'}</span>
              </button>
            </div>
          </form>

          {/* Card 3: Đổi mật khẩu tài khoản (Dedicated Security Card) */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Bảo mật &amp; Đổi mật khẩu</h3>
              <p className="text-xs text-slate-500 mt-1">
                Đổi mật khẩu định kỳ giúp bảo vệ quyền quản trị tối cao của bạn trên nền tảng GiaoVienHay.
              </p>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Nhập mật khẩu đang sử dụng.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Tối thiểu 6 ký tự bảo mật.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Khớp với mật khẩu mới ở trên.</p>
                </div>
              </div>
            </div>

            {/* Dedicated Card Footer */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Sau khi đổi thành công, phiên đăng nhập hiện tại sẽ được gia hạn an toàn.
              </span>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="h-10 px-5 text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-60"
              >
                <span className="material-symbols-outlined !text-[17px] text-slate-500">vpn_key</span>
                <span>{isSavingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>

          {/* Card 4: Xác thực 2 bước (2FA Feature Card) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Xác thực 2 bước (Two-Factor Authentication - 2FA)
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Yêu cầu nhập mã xác minh gửi qua ứng dụng Google Authenticator hoặc tin nhắn SMS OTP mỗi khi đăng nhập từ thiết bị lạ.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => {
                  setTwoFactorAuth(e.target.checked);
                  showToast(
                    e.target.checked
                      ? 'Đã bật xác thực 2 bước 2FA cho tài khoản Admin'
                      : 'Đã tắt xác thực 2 bước 2FA'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ĐƠN VỊ & NIÊN KHÓA (ACADEMIC SETTINGS) */}
      {/* ========================================================================= */}
      {activeTab === 'ACADEMIC' && (
        <div className="space-y-6 w-full">
          <form
            onSubmit={handleSaveGeneral}
            className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Thiết lập Đơn vị &amp; Niên khóa Đào tạo</h3>
              <p className="text-xs text-slate-500 mt-1">
                Định hình khung năm học hiện tại, học kỳ hoạt động và thông tin hiển thị trên báo cáo toàn hệ thống.
              </p>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Tên Đơn vị chủ quản / Cơ quan quản lý
                  </label>
                  <input
                    type="text"
                    value={schoolUnitName}
                    onChange={(e) => setSchoolUnitName(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Xuất hiện trên tiêu đề file Excel và phiếu liên lạc.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Phạm vi khối lớp phụ trách
                  </label>
                  <input
                    type="text"
                    value={gradeScope}
                    onChange={(e) => setGradeScope(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">Quy chuẩn môn học theo chương trình GDPT mới.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Niên khóa đào tạo hiện hành
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs cursor-pointer"
                  >
                    <option value="2025-2026">2025 - 2026</option>
                    <option value="2026-2027">2026 - 2027 (Đang áp dụng)</option>
                    <option value="2027-2028">2027 - 2028 (Kế hoạch)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Toàn bộ lớp học mới sẽ được gán niên khóa này.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Học kỳ điều hành
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs cursor-pointer"
                  >
                    <option value="Học kỳ I">Học kỳ I</option>
                    <option value="Học kỳ II">Học kỳ II</option>
                    <option value="Học kỳ Hè">Học kỳ Hè (Ôn tập nâng cao)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Xác định kỳ tính điểm và nề nếp thi đua.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block text-xs font-bold text-slate-800">
                  Địa chỉ văn phòng điều hành trung tâm
                </label>
                <input
                  type="text"
                  value={headquartersAddress}
                  onChange={(e) => setHeadquartersAddress(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Các thay đổi này có hiệu lực trên toàn bộ các đơn vị trường liên kết.
              </span>
              <button
                type="submit"
                disabled={isSavingGeneral}
                className="h-10 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-60"
              >
                <span className="material-symbols-outlined !text-[17px]">check</span>
                <span>{isSavingGeneral ? 'Đang lưu...' : 'Lưu cấu hình niên khóa'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: THÔNG BÁO ĐẨY & FCM (NOTIFICATIONS) */}
      {/* ========================================================================= */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-6 w-full">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Card Header */}
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Cơ chế Thông báo Đẩy Firebase Cloud Messaging (FCM)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cấu hình các kịch bản phát thông báo tự động đến ứng dụng di động của Phụ huynh và Giáo viên.
              </p>
            </div>

            {/* Card Body - Spacious Toggle Rows */}
            <div className="p-6 sm:p-8 divide-y divide-slate-100 space-y-6">
              {/* Item 1 */}
              <div className="flex items-center justify-between gap-6 pt-0">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Phát thông báo kết quả điểm số tức thì
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Tự động gửi thông báo đẩy đến điện thoại của phụ huynh ngay sau khi giáo viên nhập và xác nhận điểm kiểm tra trên hệ thống.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableInstantGradeNotice}
                    onChange={(e) => setEnableInstantGradeNotice(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between gap-6 pt-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Cảnh báo chuyên cần &amp; vắng học tự động đầu giờ
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Tự động gửi tin nhắn báo động nếu học sinh chưa có mặt tại lớp trước 08:00 sáng nhằm phối hợp chặt chẽ với gia đình.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableAbsentAlert}
                    onChange={(e) => setEnableAbsentAlert(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between gap-6 pt-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Tự động gửi lời nhắc lịch kiểm tra định kỳ
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Thông báo đôn đốc phụ huynh hỗ trợ con em ôn tập trước các đợt kiểm tra giữa kỳ hoặc cuối kỳ trước 3 ngày.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableExamReminder}
                    onChange={(e) => setEnableExamReminder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between gap-6 pt-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Gửi email cảnh báo hệ thống khẩn cấp
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Gửi email đến hòm thư Admin khi phát hiện lưu lượng gọi Gemini AI vượt ngưỡng hoặc có sự cố đăng nhập bất thường.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableSystemAlertEmail}
                    onChange={(e) => setEnableSystemAlertEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Các gói tin đẩy được bảo vệ và mã hóa qua giao thức Firebase Cloud Messaging.
              </span>
              <button
                type="button"
                onClick={() => showToast('Đã lưu các thiết lập thông báo đẩy FCM')}
                className="h-10 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined !text-[17px]">save</span>
                <span>Lưu cấu hình thông báo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BẢO MẬT & PHIÊN TRUY CẬP (SECURITY) */}
      {/* ========================================================================= */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6 w-full">
          {/* Card 1: Session & Policy */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Chính sách Bảo mật &amp; Phiên làm việc
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Quy định thời gian hết hạn Access Token, xác thực 2 bước và tính toàn vẹn dữ liệu sư phạm.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="font-bold text-slate-900 block text-sm">
                    Thời gian hết hạn phiên làm việc (Session Timeout)
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tự động thu hồi JWT Token và yêu cầu Admin đăng nhập lại sau khoảng thời gian không có thao tác:
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={sessionTimeoutHours}
                      onChange={(e) => setSessionTimeoutHours(Number(e.target.value))}
                      className="w-24 h-10 px-3.5 bg-white border border-slate-200/90 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-blue-600 shadow-2xs"
                    />
                    <span className="text-slate-600 font-semibold text-xs">giờ (Mặc định 24 giờ)</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      Bảo lưu dữ liệu sư phạm khi khóa tài khoản
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      100% dữ liệu điểm số, chuyên cần và học phí của học sinh được bảo lưu nguyên vẹn khi giáo viên bị khóa tài khoản hoặc chuyển trường.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Bật mặc định bảo vệ toàn vẹn</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Chính sách bảo mật tuân thủ nghiêm ngặt tiêu chuẩn RBAC NestJS Server-side.
              </span>
              <button
                type="button"
                onClick={() => showToast('Đã lưu cấu hình thời gian phiên làm việc')}
                className="h-10 px-5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined !text-[17px]">save</span>
                <span>Lưu cấu hình bảo mật</span>
              </button>
            </div>
          </div>

          {/* Card 2: Active Sessions Management */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8 pb-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Thiết bị đang đăng nhập</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Danh sách các phiên làm việc đang duy trì quyền truy cập vào cổng quản trị của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast('Đã đăng xuất khỏi tất cả các thiết bị khác')}
                className="h-9 px-3.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                Đăng xuất tất cả thiết bị khác
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">laptop_mac</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Chrome trên macOS (Thiết bị hiện tại)
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        Phiên này
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Địa chỉ IP: <span className="font-mono text-slate-600">192.168.1.10</span> • Đăng nhập lúc: 08:15 hôm nay
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">smartphone</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Mobile Admin App (iOS 18)
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Apple iPhone 15 Pro</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Địa chỉ IP: <span className="font-mono text-slate-600">118.69.12.4</span> • Đăng nhập hôm qua lúc 19:40
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Đã thu hồi phiên đăng nhập trên thiết bị iOS')}
                  className="h-8.5 px-3 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  Thu hồi phiên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM LOGOUT & SESSION CONTROL */}
      {/* ========================================================================= */}
      <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-700">lock_person</span>
            <h4 className="text-sm font-bold text-slate-900">Phiên đăng nhập Quản trị viên</h4>
          </div>
          <p className="text-xs text-slate-500">
            Đăng xuất tài khoản an toàn khỏi phiên làm việc hiện tại trên thiết bị này khi kết thúc phiên quản trị.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('Đăng xuất thành công khỏi hệ thống!')}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined !text-[18px] text-rose-500">logout</span>
          <span>Đăng xuất khỏi hệ thống</span>
        </button>
      </div>
    </main>
  );
}
