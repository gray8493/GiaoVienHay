'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithBackend, loginOfflineDemo, isAuthenticated, getStoredUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('0988888888');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        router.push('/');
      }
    }
  }, [router]);

  const handleFillDemo = () => {
    setPhone('0988888888');
    setPassword('Admin@123');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phone.replace(/\s+/g, '').trim();
    if (!cleanPhone) {
      setErrorMessage('Vui lòng nhập số điện thoại quản trị viên');
      return;
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithBackend(cleanPhone, password);

      if (result.success && result.data) {
        setSuccessMessage(`Đăng nhập thành công! Chào mừng ${result.data.user.full_name || 'Quản trị viên'}.`);
        setTimeout(() => {
          router.push('/');
        }, 600);
      } else {
        setErrorMessage(result.error || 'Số điện thoại hoặc mật khẩu không chính xác');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi không xác định khi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineLogin = () => {
    const session = loginOfflineDemo();
    setSuccessMessage(`Đăng nhập Ngoại tuyến thành công! Chào mừng ${session.user.full_name}.`);
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 relative p-4 selection:bg-slate-900 selection:text-white">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl opacity-70" />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[440px] z-10">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 transition-all">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-900 text-white shadow-md shadow-slate-900/10 mb-4 ring-4 ring-slate-100">
              <span className="material-symbols-outlined text-[30px]">admin_panel_settings</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Cổng Quản trị GiaoVienHay
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1.5">
              Hệ thống Điều hành Giáo dục &amp; Sổ liên lạc Điện tử
            </p>
          </div>

          {/* Quick Demo Fill Helper Pill */}
          <div className="mb-6 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="material-symbols-outlined text-[16px] text-blue-600">info</span>
              <span>Tài khoản mẫu Backend:</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-md transition-colors cursor-pointer"
            >
              Điền nhanh
            </button>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] shrink-0 text-rose-600">error</span>
              <div className="leading-relaxed flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] shrink-0 text-emerald-600">check_circle</span>
              <div className="leading-relaxed flex-1">{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="admin-phone">
                Số điện thoại Admin
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                </div>
                <input
                  id="admin-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  disabled={isLoading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0988 888 888"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-transparent rounded-xl outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="admin-password">
                  Mật khẩu
                </label>
                <span className="text-[11px] text-slate-400">Mặc định: Admin@123</span>
              </div>
              <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-900 bg-transparent rounded-xl outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>

              <span className="text-xs text-slate-400">SSL 256-bit</span>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md shadow-slate-900/10 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Đang xác thực Backend...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative inline-block bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hoặc
            </div>
          </div>

          {/* Secondary Offline/Demo Login */}
          <button
            type="button"
            onClick={handleOfflineLogin}
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">wifi_off</span>
            <span>Đăng nhập chế độ Ngoại tuyến / Demo</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-3">
          <span>GiaoVienHay Platform v1.0.0</span>
          <span>•</span>
          <span>Bảo mật NestJS &amp; Firestore</span>
        </div>
      </div>
    </div>
  );
}
