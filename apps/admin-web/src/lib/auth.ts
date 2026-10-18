/**
 * Authentication Client Service for Admin Web Portal
 * Communicates with NestJS Backend Module 01-auth (/api/v1/auth)
 * Implements RBAC Guard, Session Storage, Silent Refresh & Mock Adapter
 */

import { UserRole, ErrorCode, ApiResponse } from '@giaovienhay/shared-types';

export interface AdminUser {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole | string;
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

export interface AuthResult {
  success: boolean;
  data?: LoginResponseData;
  error?: string;
  errorCode?: ErrorCode | string;
  isMock?: boolean;
}

const TOKEN_KEY = 'gvh_admin_access_token';
const REFRESH_TOKEN_KEY = 'gvh_admin_refresh_token';
const USER_KEY = 'gvh_admin_user_profile';
const COOKIE_TOKEN_NAME = 'gvh_admin_token';
const COOKIE_REFRESH_NAME = 'gvh_admin_refresh_token';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// --- Session & Storage Helpers ---

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
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
  rememberMe = true,
): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // Đồng bộ Cookie để Next.js Middleware và SSR đọc được phiên
  const maxAge = rememberMe ? 60 * 60 * 24 * 7 : ''; // 7 ngày nếu ghi nhớ, session cookie nếu không
  const maxAgeAttr = maxAge ? `; max-age=${maxAge}` : '';

  document.cookie = `${COOKIE_TOKEN_NAME}=${accessToken}; path=/${maxAgeAttr}; SameSite=Lax`;
  document.cookie = `${COOKIE_REFRESH_NAME}=${refreshToken}; path=/${maxAgeAttr}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Xóa sạch Cookies trên mọi biến thể path
  document.cookie = `${COOKIE_TOKEN_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${COOKIE_REFRESH_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// --- Error Code Mapper (Việt hóa theo Tài liệu Chuẩn) ---

export function mapAuthErrorMessage(errorCode?: string, defaultMsg?: string): string {
  switch (errorCode) {
    case ErrorCode.AUTH_INVALID_CREDENTIALS:
      return 'Số điện thoại hoặc mật khẩu không chính xác.';
    case ErrorCode.AUTH_ACCOUNT_LOCKED:
      return 'Tài khoản của bạn đã bị khóa hoặc tạm dừng. Vui lòng liên hệ IT.';
    case ErrorCode.AUTH_ROLE_FORBIDDEN:
      return 'Tài khoản không có quyền truy cập vào Cổng Quản trị viên.';
    case ErrorCode.AUTH_TOKEN_EXPIRED:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case ErrorCode.AUTH_TOKEN_INVALID:
      return 'Mã xác thực không hợp lệ.';
    case ErrorCode.AUTH_REFRESH_TOKEN_INVALID:
      return 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
    case ErrorCode.COMMON_VALIDATION_ERROR:
      return defaultMsg || 'Dữ liệu nhập vào chưa đúng định dạng yêu cầu.';
    default:
      return defaultMsg || 'Đăng nhập không thành công. Vui lòng thử lại.';
  }
}

// --- Main Login Function (Backend + Smart Mock Fallback) ---

export async function loginWithBackend(
  identifier: string,
  password: string,
  rememberMe = true,
): Promise<AuthResult> {
  const cleanIdentifier = identifier.replace(/\s+/g, '').trim();

  // Chuẩn hóa input: nếu nhập email admin mặc định thì map về SĐT của seed backend
  const phonePayload = cleanIdentifier.includes('@')
    ? cleanIdentifier === 'admin@giaovienhay.vn'
      ? '0988888888'
      : cleanIdentifier
    : cleanIdentifier;

  // 1. Chế độ Mock ép buộc qua ENV
  if (USE_MOCK) {
    return handleMockLogin(cleanIdentifier, password, rememberMe);
  }

  // 2. Gọi API Backend thật: POST /api/v1/auth/login
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: phonePayload, password }),
    });

    const body: ApiResponse<LoginResponseData> = await res.json().catch(() => null);

    if (!res.ok) {
      const errorCode = (body as any)?.error_code;
      const errorMsg =
        mapAuthErrorMessage(errorCode, (body as any)?.message) ||
        'Số điện thoại hoặc mật khẩu không chính xác';

      return {
        success: false,
        errorCode,
        error: errorMsg,
      };
    }

    const responseData = body.data || (body as any);

    if (responseData.access_token && responseData.user) {
      // RBAC GUARD: Cổng Quản trị viên BẮT BUỘC role === ADMIN
      if (responseData.user.role !== UserRole.ADMIN && responseData.user.role !== 'ADMIN') {
        return {
          success: false,
          errorCode: ErrorCode.AUTH_ROLE_FORBIDDEN,
          error: 'Tài khoản không có quyền truy cập vào Cổng Quản trị (Admin Portal).',
        };
      }

      saveAuthSession(
        responseData.access_token,
        responseData.refresh_token,
        responseData.user,
        rememberMe,
      );

      return {
        success: true,
        data: responseData,
      };
    }

    return {
      success: false,
      error: 'Phản hồi từ máy chủ không hợp lệ.',
    };
  } catch (err: any) {
    console.warn(`[AuthService] Không thể kết nối Backend (${API_BASE_URL}):`, err?.message);
    return {
      success: false,
      error: 'Không thể kết nối máy chủ xác thực. Vui lòng kiểm tra kết nối và thử lại.',
    };
  }
}

// --- Mock Adapter Phục vụ Kiểm thử Frontend khi Backend Offline ---

function handleMockLogin(
  identifier: string,
  password: string,
  rememberMe: boolean,
): Promise<AuthResult> {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng thực tế 400ms
    setTimeout(() => {
      // Kịch bản 1: Tài khoản Quản trị viên Root hợp lệ (Seed sẵn trong Backend)
      if (
        (identifier === '0988888888' || identifier === 'admin@giaovienhay.vn') &&
        password === 'Admin@123'
      ) {
        const mockUser: AdminUser = {
          id: 'usr_admin_root',
          full_name: 'Quản trị viên Hệ thống',
          phone: '0988888888',
          email: 'admin@giaovienhay.vn',
          role: UserRole.ADMIN,
          school_name: 'Sở GD&ĐT / Hệ thống GiaoVienHay',
          avatar: '/logo-admin.jpg',
        };

        const mockData: LoginResponseData = {
          user: mockUser,
          access_token: 'mock_jwt_admin_token_' + Date.now(),
          refresh_token: 'mock_jwt_refresh_token_' + Date.now(),
          expires_in: 604800,
        };

        saveAuthSession(mockData.access_token, mockData.refresh_token, mockUser, rememberMe);

        resolve({
          success: true,
          data: mockData,
          isMock: true,
        });
        return;
      }

      // Kịch bản 2: Tài khoản bị khóa (Mock test)
      if (identifier === '0900000000') {
        resolve({
          success: false,
          errorCode: ErrorCode.AUTH_ACCOUNT_LOCKED,
          error: 'Tài khoản của bạn đã bị khóa hoặc tạm dừng. Vui lòng liên hệ IT.',
          isMock: true,
        });
        return;
      }

      // Kịch bản 3: Tài khoản Giáo viên không có quyền Admin (RBAC test)
      if (identifier === '0912345678') {
        resolve({
          success: false,
          errorCode: ErrorCode.AUTH_ROLE_FORBIDDEN,
          error: 'Tài khoản Giáo viên không có quyền truy cập vào Cổng Quản trị.',
          isMock: true,
        });
        return;
      }

      // Kịch bản 4: Sai tài khoản hoặc mật khẩu
      resolve({
        success: false,
        errorCode: ErrorCode.AUTH_INVALID_CREDENTIALS,
        error: 'Số điện thoại hoặc mật khẩu không chính xác.',
        isMock: true,
      });
    }, 450);
  });
}

// --- Refresh Token Service ---

export async function refreshAuthToken(): Promise<{ success: boolean; token?: string }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return { success: false };

  // Nếu là mock token
  if (refreshToken.startsWith('mock_jwt_')) {
    const newToken = 'mock_jwt_admin_token_' + Date.now();
    const user = getStoredUser();
    if (user) {
      saveAuthSession(newToken, refreshToken, user);
      return { success: true, token: newToken };
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const body = await res.json().catch(() => null);

    if (res.ok && body?.data?.access_token) {
      const user = getStoredUser();
      if (user) {
        saveAuthSession(body.data.access_token, refreshToken, user);
        return { success: true, token: body.data.access_token };
      }
    }

    clearAuthSession();
    return { success: false };
  } catch {
    return { success: false };
  }
}

// --- Logout Service ---

export async function logoutUser(): Promise<void> {
  const token = getAuthToken();
  if (token && !token.startsWith('mock_jwt_')) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);
    } catch {}
  }

  clearAuthSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function changePasswordApi(data: {
  current_password: string;
  new_password: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => null);
    if (res.ok) {
      return { success: true, message: body?.message || 'Đổi mật khẩu thành công' };
    }
    return {
      success: false,
      error: body?.message || 'Mật khẩu hiện tại không chính xác',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
  }
}

