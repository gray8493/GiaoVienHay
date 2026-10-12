import { Platform } from 'react-native';
import { authService } from './auth.service';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

export interface UserProfile {
  id: string;
  phone: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  role: string;
  homeroom_class?: string;
  school_name?: string;
  teaching_subjects?: string[];
}

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
  avatar_url?: string;
  school_name?: string;
  teaching_subjects?: string[];
}

export interface ChangePasswordPayload {
  old_password?: string;
  current_password?: string;
  new_password: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        const resJson = await response.json();
        const user = resJson.data || resJson;
        if (user && user.id) {
          return {
            id: user.id,
            phone: user.phone || '0988 888 888',
            full_name: user.full_name || 'Quản trị viên Hệ thống',
            email: user.email || 'admin@giaovienhay.vn',
            role: user.role || 'ADMIN',
            school_name: user.school_name || 'Trường Tiểu Học Chu Văn An',
            teaching_subjects: user.teaching_subjects || ['Toán', 'Tiếng Việt'],
          };
        }
      }
    } catch (error: any) {
      console.warn('Lỗi tải thông tin cá nhân:', error.message);
    }

    const cachedUser = authService.getUser();
    return {
      id: cachedUser?.id || 'usr_01',
      phone: cachedUser?.phone || '0988 888 888',
      full_name: cachedUser?.full_name || 'Cô Nguyễn Thị Lan',
      email: cachedUser?.email || 'lan.nguyen@chuvanan.edu.vn',
      role: cachedUser?.role || 'TEACHER_HOMEROOM',
      homeroom_class: '1A',
      school_name: cachedUser?.school_name || 'Trường Tiểu Học Chu Văn An',
      teaching_subjects: cachedUser?.teaching_subjects || ['Toán', 'Tiếng Việt'],
    };
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cập nhật hồ sơ thất bại');
      }

      const resJson = await response.json();
      const updated = resJson.data || resJson;
      authService.setUser({ ...authService.getUser(), ...updated });
      return updated;
    } catch (error: any) {
      throw error;
    }
  },

  async changePassword(payload: ChangePasswordPayload) {
    const currentPassword = payload.current_password || payload.old_password || '';
    return authService.changePassword(currentPassword, payload.new_password);
  },

  async logout() {
    return authService.logout();
  },
};
