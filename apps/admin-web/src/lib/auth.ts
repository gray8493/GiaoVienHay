/**
 * Authentication Client Service for Admin Web Portal
 * Communicates with NestJS Backend Module 01-auth (/api/v1/auth/login)
 */

export interface AdminUser {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: string;
  school_name?: string | null;
  teaching_subjects?: string[];
  avatar?: string;
}

export interface LoginResponseData {
  user: AdminUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const TOKEN_KEY = 'gvh_admin_access_token';
const REFRESH_TOKEN_KEY = 'gvh_admin_refresh_token';
const USER_KEY = 'gvh_admin_user_profile';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function saveAuthSession(
  accessToken: string,
  refreshToken: string,
  user: AdminUser,
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Also store in cookie for basic SSR or middleware access
  document.cookie = `gvh_admin_token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `gvh_admin_token=; path=/; max-age=0; SameSite=Lax`;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Call NestJS backend POST /api/v1/auth/login
 */
export async function loginWithBackend(
  phone: string,
  password: string,
): Promise<{ success: boolean; data?: LoginResponseData; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    const body = await res.json();

    if (!res.ok) {
      const errorMsg =
        body?.message ||
        (Array.isArray(body?.message) ? body.message.join(', ') : 'Đăng nhập không thành công');
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Save session
    const responseData = body.data || body;
    if (responseData.access_token && responseData.user) {
      saveAuthSession(
        responseData.access_token,
        responseData.refresh_token,
        responseData.user,
      );
      return {
        success: true,
        data: responseData,
      };
    }

    return {
      success: false,
      error: 'Phản hồi từ máy chủ không hợp lệ',
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Không thể kết nối đến máy chủ Backend (http://localhost:3000). Vui lòng kiểm tra lại dịch vụ Backend hoặc dùng Chế độ Ngoại tuyến.'
          : err.message || 'Lỗi kết nối máy chủ',
    };
  }
}

/**
 * Fallback Offline/Demo Login for development when Backend is unreachable
 */
export function loginOfflineDemo(): LoginResponseData {
  const demoUser: AdminUser = {
    id: 'usr_admin_demo',
    full_name: 'Admin Hoàng (Chế độ Ngoại tuyến)',
    phone: '0988888888',
    email: 'admin@giaovienhay.vn',
    role: 'ADMIN',
    school_name: 'Hệ thống Quản trị GiaoVienHay',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  };

  const demoToken = 'mock_jwt_token_admin_offline_' + Date.now();
  saveAuthSession(demoToken, demoToken + '_refresh', demoUser);

  return {
    user: demoUser,
    access_token: demoToken,
    refresh_token: demoToken + '_refresh',
    expires_in: 86400 * 7,
  };
}
