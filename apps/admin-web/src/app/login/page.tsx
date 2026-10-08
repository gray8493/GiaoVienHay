'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithBackend, isAuthenticated, getStoredUser, clearAuthSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Kiểm tra nếu đã đăng nhập và có tham số redirect chỉ định
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        setCurrentUser(user);
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const redirectPath = params?.get('redirect');
        if (redirectPath) {
          router.push(redirectPath);
        }
      }
    }
  }, [router]);

  // Kiểm tra phím Caps Lock khi người dùng gõ
  const handleKeyEvent = (e: React.KeyboardEvent) => {
    setCapsLockActive(e.getModifierState('CapsLock'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phone.replace(/\s+/g, '').trim();
    if (!cleanPhone) {
      setErrorMessage('Vui lòng nhập số điện thoại hoặc email');
      return;
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithBackend(cleanPhone, password, rememberMe);

      if (result.success && result.data) {
        setSuccessMessage(`Đăng nhập thành công! Chào mừng ${result.data.user.full_name || 'Quản trị viên'}.`);
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const redirectPath = params?.get('redirect') || '/';
        setTimeout(() => {
          router.push(redirectPath);
        }, 400);
      } else {
        setErrorMessage(result.error || 'Tài khoản hoặc mật khẩu không chính xác');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 overflow-x-hidden selection:bg-sky-200 font-sans">
      {/* 
        HỆ THỐNG NỀN VÀ MÂY CỐ ĐỊNH (FIXED BACKGROUND SCENERY)
        - Sử dụng position: fixed inset-0 để nền trời và mây luôn trải đều toàn màn hình
        - KHÔNG sử dụng đường viền 1px (border) gây cảm giác viền ngang khi kéo
        - Các khối mây được làm mềm tự nhiên bằng blur đa tầng, không bị cắt xén (no clip boundary)
      */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden -z-10"
        style={{
          background: 'linear-gradient(180deg, #78b8eb 0%, #a2cff3 28%, #c9e4fb 55%, #e8f4fd 80%, #f6fafd 100%)',
        }}
      >
        {/* Hào quang ánh sáng mềm mại phía sau thẻ login (Soft Glow, không dùng border) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full bg-white/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full bg-sky-200/30 blur-3xl" />

        {/* Mây bồng bềnh tầng trên */}
        <div className="absolute -top-20 -left-20 w-[540px] h-[320px] rounded-full bg-white/70 blur-3xl" />
        <div className="absolute -top-28 left-1/3 -translate-x-1/2 w-[700px] h-[340px] rounded-full bg-gradient-to-b from-white/85 to-transparent blur-3xl" />
        <div className="absolute -top-16 -right-16 w-[560px] h-[320px] rounded-full bg-white/75 blur-3xl" />

        {/* TẦNG MÂY CHÂN TRỜI (FADE-OUT TỰ NHIÊN, KHÔNG TẠO ĐƯỜNG CẮT NGANG) */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none h-[520px]">
          {/* Lớp sương mù tỏa mờ phía xa */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] rounded-full bg-gradient-to-t from-white via-sky-100/60 to-transparent blur-3xl opacity-80" />
          
          {/* Tầng mây xanh thiên thanh nhẹ */}
          <div className="absolute -bottom-16 -left-32 w-[750px] h-[360px] rounded-[100%] bg-gradient-to-tr from-white via-sky-200/40 to-transparent blur-2xl opacity-80" />
          <div className="absolute -bottom-12 -right-28 w-[800px] h-[380px] rounded-[100%] bg-gradient-to-tl from-white via-sky-200/40 to-transparent blur-2xl opacity-80" />

          {/* Các cụm mây trắng mềm mại trung tâm */}
          <div className="absolute -bottom-8 left-[6%] w-[460px] h-[280px] rounded-full bg-gradient-to-t from-white via-white/95 to-sky-100/50 blur-xl opacity-90" />
          <div className="absolute -bottom-12 left-[32%] w-[540px] h-[300px] rounded-full bg-gradient-to-t from-white via-white/95 to-sky-50/70 blur-xl opacity-95" />
          <div className="absolute -bottom-6 right-[4%] w-[500px] h-[270px] rounded-full bg-gradient-to-t from-white via-white/95 to-sky-100/50 blur-xl opacity-90" />

          {/* Lớp nền mây trắng chuyển tiếp êm đáy màn hình */}
          <div className="absolute -bottom-8 -left-10 w-[520px] h-[240px] rounded-full bg-white/95 blur-md" />
          <div className="absolute -bottom-12 left-[24%] w-[580px] h-[260px] rounded-full bg-white blur-md" />
          <div className="absolute -bottom-8 right-[-2%] w-[560px] h-[250px] rounded-full bg-white/95 blur-md" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>

      {/* HEADER: Thương hiệu với Logo to hơn và sắc nét hơn */}
      <header className="w-full max-w-7xl flex items-center justify-between z-10 pt-2 sm:pt-4 px-2 sm:px-6">
        <div className="flex items-center gap-3.5">
          {/* Logo phủ kín khung, không chừa viền trắng bên ngoài */}
          <div className="w-14 h-14 overflow-hidden rounded-2xl shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-transform hover:scale-105">
            <img
              src="/logo-admin.jpg"
              alt="GiaoVienHay Logo"
              className="block w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            GiaoVienHay
          </span>
        </div>
      </header>

      {/* CENTRAL CARD: Thẻ kính mờ đăng nhập với hiệu ứng viền 3D nổi đa tầng */}
      <section
        className="relative z-20 my-auto w-full max-w-[420px] rounded-[32px] p-7 sm:p-9 flex flex-col items-center border-[2.5px] border-white shadow-[0_24px_55px_-10px_rgba(14,165,233,0.28),0_12px_28px_-6px_rgba(15,23,42,0.1),inset_0_2px_0_0_rgba(255,255,255,1),inset_0_-2.5px_0_0_rgba(186,230,253,0.7),0_0_0_1px_rgba(255,255,255,0.9)] transition-all"
        style={{
          background: 'linear-gradient(175deg, rgba(255, 255, 255, 0.94) 0%, rgba(246, 251, 255, 0.85) 60%, rgba(255, 255, 255, 0.96) 100%)',
          backdropFilter: 'blur(26px) saturate(150%)',
          WebkitBackdropFilter: 'blur(26px) saturate(150%)',
        }}
      >
        <h1 className="text-[24px] font-bold text-slate-900 tracking-tight text-center leading-snug">
          Đăng nhập Quản trị
        </h1>
        <p className="text-[13px] text-slate-600 font-medium text-center mt-2 mb-6 px-1 leading-relaxed">
          Hệ thống Điều hành Giáo dục &amp; Sổ liên lạc Điện tử
        </p>

        {/* Thông báo lỗi */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 shadow-2xs">
            <svg className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="leading-relaxed flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Thông báo thành công */}
        {successMessage && (
          <div className="w-full mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 shadow-2xs">
            <svg className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="leading-relaxed flex-1">{successMessage}</div>
          </div>
        )}

        {/* Banner trạng thái phiên nếu đang đăng nhập */}
        {currentUser && (
          <div className="w-full mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
            <div className="leading-snug">
              <span>Đang có phiên: <strong>{currentUser.full_name}</strong></span>
              <div className="text-[11px] text-blue-700">{currentUser.phone || currentUser.email} ({currentUser.role})</div>
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              <Link
                href="/"
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[11px] transition shadow-xs"
              >
                Vào Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearAuthSession();
                  setCurrentUser(null);
                }}
                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-medium text-[11px] transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* FORM ĐĂNG NHẬP: Các ô input tối ưu độ tương phản, viền nổi 3D rõ nét */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          {/* Ô nhập Số điện thoại hoặc Email */}
          <div>
            <label htmlFor="admin-account" className="block text-[13px] font-bold text-slate-800 mb-1.5 ml-1">
              Số điện thoại hoặc Email
            </label>
            <div className="rounded-xl flex items-center px-3.5 py-2.5 bg-[#EEF4FA] border border-slate-300/90 shadow-[inset_0_2px_4px_rgba(15,23,42,0.06),inset_0_-1px_0_rgba(255,255,255,0.9),0_1px_0_rgba(255,255,255,0.8)] hover:border-slate-400 hover:bg-[#E7EFF7] focus-within:bg-white focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-200/60 focus-within:shadow-[0_4px_12px_rgba(2,132,199,0.15),inset_0_1px_0_rgba(255,255,255,1)] transition-all">
              <svg className="w-4 h-4 text-sky-700 mr-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                id="admin-account"
                type="text"
                autoComplete="username"
                required
                disabled={isLoading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại hoặc email"
                className="w-full bg-transparent border-0 p-0 text-[13.5px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Ô nhập Mật khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label htmlFor="admin-password" className="block text-[13px] font-bold text-slate-800">
                Mật khẩu
              </label>
              {capsLockActive && (
                <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 animate-pulse">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Caps Lock đang bật
                </span>
              )}
            </div>
            <div className="rounded-xl flex items-center px-3.5 py-2.5 bg-[#EEF4FA] border border-slate-300/90 shadow-[inset_0_2px_4px_rgba(15,23,42,0.06),inset_0_-1px_0_rgba(255,255,255,0.9),0_1px_0_rgba(255,255,255,0.8)] hover:border-slate-400 hover:bg-[#E7EFF7] focus-within:bg-white focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-200/60 focus-within:shadow-[0_4px_12px_rgba(2,132,199,0.15),inset_0_1px_0_rgba(255,255,255,1)] transition-all">
              <svg className="w-4 h-4 text-sky-700 mr-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyEvent}
                onKeyUp={handleKeyEvent}
                placeholder="Nhập mật khẩu"
                className="w-full bg-transparent border-0 p-0 text-[13.5px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-0"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 hover:text-slate-700 focus:outline-none ml-1 p-0.5 cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Ghi nhớ phiên & Quên mật khẩu */}
          <div className="flex items-center justify-between pt-0.5 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[12.5px] text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-slate-800 border-slate-300 cursor-pointer"
              />
              <span>Ghi nhớ phiên</span>
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Vui lòng liên hệ Trưởng bộ phận Kỹ thuật / Quản trị viên cấp cao để cấp lại mật khẩu.');
              }}
              className="text-[12.5px] font-medium text-sky-700 hover:text-sky-900 hover:underline transition-colors cursor-pointer"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Nút Submit đăng nhập: chỉ để 'Đăng nhập', bỏ dấu mũi tên -> */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-t border-white/20 text-white font-semibold text-[14px] shadow-[0_4px_14px_rgba(15,23,42,0.25),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.35)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.3)] active:translate-y-0.5 active:shadow-[0_2px_6px_rgba(15,23,42,0.2)] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>

        </form>
      </section>


      {/* FOOTER BẢO MẬT & BẢN QUYỀN */}
      <footer className="w-full text-center py-2 z-20 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 select-none">
        <span className="text-[11.5px] text-slate-500 font-medium">© 2026 GiaoVienHay Education. Mọi quyền được bảo lưu.</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="text-[11.5px] text-slate-500 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-emerald-600 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Bảo mật SSL 256-bit
        </span>
      </footer>
    </div>
  );
}
