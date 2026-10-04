/**
 * Generic API Client with Authorization Bearer Interceptor
 */
import { getAuthToken, clearAuthSession } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

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
      // Token invalid or expired
      if (typeof window !== 'undefined' && requiresAuth) {
        clearAuthSession();
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
