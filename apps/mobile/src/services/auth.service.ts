import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  phone: string;
  password: string;
  role: 'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT' | 'PARENT' | 'ADMIN';
  school_name?: string;
  teaching_subjects?: string[];
  email?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  email?: string | null;
  school_name?: string | null;
  teaching_subjects?: string[];
}

// In-memory token cache
let activeToken: string | null = null;
let activeRefreshToken: string | null = null;
let activeUser: UserProfile | null = null;
let activeExpiresAt: number | null = null;

const loadPersistedAuth = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedToken = window.localStorage.getItem('gvh_access_token');
      const savedRefreshToken = window.localStorage.getItem('gvh_refresh_token');
      const savedUserStr = window.localStorage.getItem('gvh_user');
      if (savedToken && !activeToken) activeToken = savedToken;
      if (savedRefreshToken && !activeRefreshToken) activeRefreshToken = savedRefreshToken;
      if (savedUserStr && !activeUser) activeUser = JSON.parse(savedUserStr);
    } catch (e) {}
  }
};
loadPersistedAuth();

const decodeJwtPayload = (token: string): any => {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bits = 0;
    let value = 0;
    let out = '';
    for (let i = 0; i < base64.length; i++) {
      const c = base64[i];
      if (c === '=') break;
      const idx = chars.indexOf(c);
      if (idx === -1) return null;
      value = (value << 6) | idx;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out += String.fromCharCode((value >> bits) & 0xff);
      }
    }
    return JSON.parse(out);
  } catch (e) {
    return null;
  }
};

// Khóa lưu trữ phiên đăng nhập (AsyncStorage hoạt động trên cả native và web)
const STORAGE_KEYS = {
  token: 'gvh_access_token',
  refreshToken: 'gvh_refresh_token',
  user: 'gvh_user',
  expiresAt: 'gvh_token_expires_at',
};

const persistAuthWrite = (entries: [string, string][]) => {
  if (entries.length === 0) return;
  AsyncStorage.multiSet(entries).catch(() => null);
};

const persistAuthRemove = (keys: string[]) => {
  if (keys.length === 0) return;
  AsyncStorage.multiRemove(keys).catch(() => null);
};

let hydratedAuthPromise: Promise<void> | null = null;

// Khôi phục trạng thái phiên đăng nhập từ AsyncStorage (gọi 1 lần khi app khởi động)
const hydrateAuth = (): Promise<void> => {
  if (!hydratedAuthPromise) {
    hydratedAuthPromise = (async () => {
      try {
        const pairs = await AsyncStorage.multiGet([
          STORAGE_KEYS.token,
          STORAGE_KEYS.refreshToken,
          STORAGE_KEYS.user,
          STORAGE_KEYS.expiresAt,
        ]);
        const map = new Map(pairs);
        const savedToken = map.get(STORAGE_KEYS.token);
        const savedRefreshToken = map.get(STORAGE_KEYS.refreshToken);
        const savedUserStr = map.get(STORAGE_KEYS.user);
        const savedExpiresAt = map.get(STORAGE_KEYS.expiresAt);
        if (savedToken && !activeToken) activeToken = savedToken;
        if (savedRefreshToken && !activeRefreshToken) activeRefreshToken = savedRefreshToken;
        if (savedUserStr && !activeUser) {
          try {
            activeUser = JSON.parse(savedUserStr);
          } catch (e) {}
        }
        if (savedExpiresAt && !activeExpiresAt) activeExpiresAt = Number(savedExpiresAt) || null;
      } catch (e) {}
    })();
  }
  return hydratedAuthPromise;
};

export const authService = {
  hydrateAuth,

  getToken(): string | null {
    return activeToken;
  },

  getRefreshToken(): string | null {
    return activeRefreshToken;
  },

  setToken(token: string | null, expiresInSeconds?: number) {
    activeToken = token;
    if (!token) {
      activeExpiresAt = null;
    } else if (expiresInSeconds && expiresInSeconds > 0) {
      activeExpiresAt = Date.now() + expiresInSeconds * 1000;
    } else {
      const payload = decodeJwtPayload(token);
      activeExpiresAt = payload?.exp ? payload.exp * 1000 : null;
    }
    if (token) {
      persistAuthWrite([
        [STORAGE_KEYS.token, token],
        ...(activeExpiresAt ? [[STORAGE_KEYS.expiresAt, String(activeExpiresAt)] as [string, string]] : []),
      ]);
    } else {
      persistAuthRemove([STORAGE_KEYS.token, STORAGE_KEYS.expiresAt]);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('gvh_access_token', token);
        if (activeExpiresAt) {
          window.localStorage.setItem('gvh_token_expires_at', String(activeExpiresAt));
        } else {
          window.localStorage.removeItem('gvh_token_expires_at');
        }
      } else {
        window.localStorage.removeItem('gvh_access_token');
        window.localStorage.removeItem('gvh_token_expires_at');
      }
    }
  },

  isAccessTokenExpired(skewMs: number = 60000): boolean {
    if (!activeToken) return true;
    if (!activeExpiresAt) {
      const payload = decodeJwtPayload(activeToken);
      if (payload?.exp) activeExpiresAt = payload.exp * 1000;
    }
    if (!activeExpiresAt) return false;
    return Date.now() >= activeExpiresAt - skewMs;
  },

  setRefreshToken(token: string | null) {
    activeRefreshToken = token;
    if (token) {
      persistAuthWrite([[STORAGE_KEYS.refreshToken, token]]);
    } else {
      persistAuthRemove([STORAGE_KEYS.refreshToken]);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('gvh_refresh_token', token);
      } else {
        window.localStorage.removeItem('gvh_refresh_token');
      }
    }
  },

  getUser(): UserProfile | null {
    if (!activeUser) loadPersistedAuth();
    return activeUser;
  },

  setUser(user: UserProfile | null) {
    activeUser = user;
    if (user) {
      persistAuthWrite([[STORAGE_KEYS.user, JSON.stringify(user)]]);
    } else {
      persistAuthRemove([STORAGE_KEYS.user]);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        window.localStorage.setItem('gvh_user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('gvh_user');
      }
    }
  },

  /**
   * Đảm bảo luôn có Access Token hợp lệ của tài khoản hiện tại
   */
  async ensureToken(): Promise<string | null> {
    await hydrateAuth();
    const existing = this.getToken();
    if (existing && !this.isAccessTokenExpired()) return existing;

    // Nếu token hết hạn (hoặc chưa có) thì thử refresh
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      const newToken = await this.refreshToken();
      if (newToken) return newToken;
    }

    if (existing) this.setToken(null);
    return null;
  },

  /**
   * Header Authorization Bearer kèm cơ chế tự động refresh token nếu cần
   */
  async getAuthHeaderAsync(): Promise<Record<string, string>> {
    const token = await this.ensureToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  /**
   * Đăng nhập chuẩn theo API Backend POST /api/v1/auth/login
   */
  async login(payload: LoginPayload) {
    // Bộ gõ tiếng Việt (Unikey/EVKey) có thể chèn ký tự zero-width vô hình vào ô
    // nhập — rửa sạch trước khi gửi để backend tra cứu đúng tài khoản
    const stripInvisible = (v: string) => String(v ?? '').replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: stripInvisible(payload.phone).trim().replace(/\s+/g, ''),
          // Autofill/bàn phím di động hay chèn khoảng trắng đầu/cuối vào mật khẩu
          password: stripInvisible(payload.password).trim(),
        }),
      });
    } catch (netErr: any) {
      throw new Error('Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra kết nối mạng.');
    }

    const resJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg = resJson.message || 'Số điện thoại hoặc mật khẩu không chính xác';
      throw new Error(msg);
    }

    const data = resJson.data || resJson;
    const token = data.access_token;
    if (token) {
      this.setToken(token, data.expires_in);
    }
    if (data.refresh_token) {
      this.setRefreshToken(data.refresh_token);
    }
    if (data.user) {
      this.setUser(data.user);
    }

    // Đăng ký FCM Device Token ngầm
    import('./fcm.service').then((m) => m.fcmService.initFCM()).catch(() => null);

    return data;
  },

  /**
   * Đăng ký tài khoản mới chuẩn theo POST /api/v1/auth/register
   */
  async register(payload: RegisterPayload) {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (netErr: any) {
      throw new Error('Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra kết nối mạng.');
    }

    const resJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Backend trả details[] mô tả từng trường vi phạm => hiển thị rõ cho người dùng
      const details = Array.isArray(resJson.details) ? resJson.details : [];
      if (details.length > 0) {
        throw new Error(
          details
            .map((d: any) => '• ' + (d.issue || d.message || 'Trường dữ liệu không hợp lệ'))
            .join('\n'),
        );
      }
      throw new Error(resJson.message || 'Đăng ký không thành công');
    }

    const data = resJson.data || resJson;
    const token = data.access_token;
    if (token) {
      this.setToken(token, data.expires_in);
    }
    if (data.refresh_token) {
      this.setRefreshToken(data.refresh_token);
    }
    if (data.user) {
      this.setUser(data.user);
    }

    // Đăng ký FCM Device Token ngầm
    import('./fcm.service').then((m) => m.fcmService.initFCM()).catch(() => null);

    return data;
  },

  /**
   * Làm mới Access Token chuẩn theo POST /api/v1/auth/refresh-token
   */
  async refreshToken(): Promise<string | null> {
    const currentRefresh = this.getRefreshToken();
    if (!currentRefresh) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentRefresh }),
      });

      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data || resJson;
        if (data.access_token) {
          this.setToken(data.access_token, data.expires_in);
          if (data.refresh_token) this.setRefreshToken(data.refresh_token);
          return data.access_token;
        }
      }
    } catch (e) {}

    return null;
  },

  /**
   * Đổi mật khẩu chuẩn theo POST /api/v1/auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const authHeader = await this.getAuthHeaderAsync();
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const resJson = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(resJson.message || 'Đổi mật khẩu không thành công');
    }

    return true;
  },

  /**
   * Đăng xuất khỏi hệ thống chuẩn theo POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      const authHeader = await this.getAuthHeaderAsync();
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      }).catch(() => null);
    } finally {
      this.setToken(null);
      this.setRefreshToken(null);
      this.setUser(null);
    }
  },
};
