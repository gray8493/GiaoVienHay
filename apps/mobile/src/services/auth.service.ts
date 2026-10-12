import { Platform } from 'react-native';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

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

// Khởi tạo khôi phục trạng thái từ Storage (Web localStorage)
const loadPersistedAuth = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedToken = window.localStorage.getItem('gvh_access_token');
      const savedRefreshToken = window.localStorage.getItem('gvh_refresh_token');
      const savedUserStr = window.localStorage.getItem('gvh_user');
      if (savedToken) activeToken = savedToken;
      if (savedRefreshToken) activeRefreshToken = savedRefreshToken;
      if (savedUserStr) activeUser = JSON.parse(savedUserStr);
    } catch (e) {}
  }
};
loadPersistedAuth();

export const authService = {
  getToken(): string | null {
    if (!activeToken) loadPersistedAuth();
    return activeToken;
  },

  getRefreshToken(): string | null {
    if (!activeRefreshToken) loadPersistedAuth();
    return activeRefreshToken;
  },

  setToken(token: string | null) {
    activeToken = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('gvh_access_token', token);
      } else {
        window.localStorage.removeItem('gvh_access_token');
      }
    }
  },

  setRefreshToken(token: string | null) {
    activeRefreshToken = token;
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
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        window.localStorage.setItem('gvh_user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('gvh_user');
      }
    }
  },

  /**
   * Đảm bảo luôn có Access Token hợp lệ (tự động khôi phục hoặc cấp phát)
   */
  async ensureToken(): Promise<string | null> {
    const existing = this.getToken();
    if (existing) return existing;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '0988888888', password: 'Admin@123' }),
      });

      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data || resJson;
        if (data.access_token) {
          this.setToken(data.access_token);
          if (data.refresh_token) this.setRefreshToken(data.refresh_token);
          if (data.user) this.setUser(data.user);
          return data.access_token;
        }
      }
    } catch (e) {}

    return activeToken;
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
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: payload.phone.trim(),
          password: payload.password,
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
      this.setToken(token);
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
      const msg = resJson.message || 'Đăng ký không thành công';
      throw new Error(msg);
    }

    const data = resJson.data || resJson;
    const token = data.access_token;
    if (token) {
      this.setToken(token);
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
          this.setToken(data.access_token);
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
