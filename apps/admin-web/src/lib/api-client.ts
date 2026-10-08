/**
 * Generic API Client with Authorization Bearer Interceptor & Silent Refresh
 * Complies with GiaoVienHay API standards (Module 01-auth)
 */
import { getAuthToken, refreshAuthToken, clearAuthSession } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  _isRetry?: boolean;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  const { requiresAuth = true, _isRetry = false, headers = {}, ...rest } = options;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

    const status = res.status;
    const body = await res.json().catch(() => null);

    if (status === 401) {
      // Nếu request yêu cầu auth và chưa retry lần nào -> Thử silent refresh token
      if (requiresAuth && !_isRetry) {
        const refreshResult = await refreshAuthToken();
        if (refreshResult.success && refreshResult.token) {
          // Thử lại request một lần với token mới
          return apiFetch<T>(endpoint, {
            ...options,
            _isRetry: true,
            headers: {
              ...headers,
              Authorization: `Bearer ${refreshResult.token}`,
            },
          });
        }
      }

      // Refresh thất bại hoặc token không còn hợp lệ -> Xóa phiên và redirect về /login
      if (typeof window !== 'undefined' && requiresAuth) {
        clearAuthSession();
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }

      return {
        success: false,
        status,
        error: body?.message || 'Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập',
      };
    }

    if (!res.ok) {
      const errorMsg =
        body?.message ||
        (Array.isArray(body?.message) ? body.message.join(', ') : `Lỗi HTTP ${status}`);
      return {
        success: false,
        status,
        error: errorMsg,
      };
    }

    return {
      success: true,
      status,
      data: (body?.data !== undefined ? body.data : body) as T,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      error:
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Không thể kết nối đến máy chủ Backend'
          : err.message || 'Lỗi mạng không xác định',
    };
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const res = await apiFetch<T>(endpoint, options);
  if (!res.success) {
    throw new Error(res.error || 'Yêu cầu thất bại');
  }
  return res.data as T;
}

