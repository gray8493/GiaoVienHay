import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';

/**
 * HTTP client dùng chung cho toàn bộ service của app.
 * - Tự gắn Authorization header (kèm refresh token khi hết hạn)
 * - Tự thử lại 1 lần khi gặp 401 (token chết giữa phiên)
 * - Tự bóc envelope `.data` của backend và ném ApiError có message tiếng Việt
 * Mọi service nghiệp vụ nên đi qua đây thay vì tự viết fetch riêng.
 */

export interface ApiErrorDetail {
  field: string;
  issue: string;
}

/** Message validation chung của backend khi không specialize lỗi theo trường */
const GENERIC_VALIDATION_MESSAGE = 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng';

const parseDetails = (payload: any): ApiErrorDetail[] =>
  Array.isArray(payload?.details)
    ? payload.details
        .map((d: any) => ({
          field: String(d?.field ?? ''),
          issue: String(d?.issue ?? d?.message ?? 'Dữ liệu không hợp lệ'),
        }))
        .filter((d: ApiErrorDetail) => d.issue)
    : [];

export class ApiError extends Error {
  status: number;
  payload: any;
  /** Chi tiết từng trường vi phạm từ backend (details[]) — để UI tô lỗi theo trường */
  details: ApiErrorDetail[];

  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
    this.details = parseDetails(payload);
  }

  /** Ghép danh sách vi phạm thành bullet list cho Alert */
  static buildDetailsMessage(details: ApiErrorDetail[]): string {
    return details.map((d) => `• ${d.issue}`).join('\n');
  }
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Object sẽ được JSON.stringify; FormData được gửi nguyên bản (không set Content-Type) */
  body?: any;
  /** Gắn Bearer token và tự refresh khi 401 (mặc định true). Login/register đặt false. */
  auth?: boolean;
  /** Message mặc định khi backend không trả message */
  errorMessage?: string;
}

const NETWORK_ERROR_MESSAGE =
  'Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra kết nối mạng.';

const extractErrorMessage = (json: any, fallback?: string): string =>
  json?.message || json?.error || fallback || 'Đã xảy ra lỗi. Vui lòng thử lại.';

/**
 * Chọn message hiển thị: nếu backend trả message chung chung kèm details[]
 * thì mở rộng thành bullet list từng trường để người dùng biết sai chỗ nào.
 */
const buildUserMessage = (json: any, fallback?: string): string => {
  const details = parseDetails(json);
  const message = extractErrorMessage(json, fallback);
  if (details.length > 0 && (!json?.message || json.message === GENERIC_VALIDATION_MESSAGE)) {
    return ApiError.buildDetailsMessage(details);
  }
  return message;
};

/**
 * Gọi API trả về raw Response (cho các trường hợp cần đọc details[] như register,
 * hoặc cần kiểm tra response.ok thủ công). Đã kèm retry 401.
 */
export async function apiFetch(path: string, opts: ApiOptions = {}): Promise<Response> {
  const { method = 'GET', body, auth = true } = opts;

  const buildRequest = (extraHeaders: Record<string, string> = {}): RequestInit => {
    const headers: Record<string, string> = { ...extraHeaders };
    if (body instanceof FormData) {
      // để browser/RN tự set boundary multipart
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    return { method, headers, body };
  };

  const doFetch = async (headers: Record<string, string>): Promise<Response> => {
    try {
      return await fetch(`${API_BASE_URL}${path}`, buildRequest(headers));
    } catch {
      throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
    }
  };

  if (!auth) {
    return doFetch({});
  }

  const authHeader = await authService.getAuthHeaderAsync();
  let response = await doFetch(authHeader);

  if (response.status === 401) {
    const refreshed = await authService.refreshToken();
    if (refreshed) {
      const newHeader = await authService.getAuthHeaderAsync();
      response = await doFetch(newHeader);
    }
  }
  return response;
}

/**
 * Gọi API chuẩn: trả về `json.data` (hoặc json nếu không có envelope),
 * ném ApiError với message từ backend khi !response.ok.
 */
export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const response = await apiFetch(path, opts);
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(buildUserMessage(json, opts.errorMessage), response.status, json);
  }
  return (json !== null && json !== undefined && json.data !== undefined ? json.data : json) as T;
}
