import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';

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
            phone: user.phone || '',
            full_name: user.full_name || 'Người dùng',
            email: user.email || '',
            role: user.role || 'TEACHER_HOMEROOM',
            school_name: user.school_name || 'Chưa cập nhật',
            teaching_subjects: user.teaching_subjects || [],
          };
        }
      }
    } catch (error: any) {
      console.warn('Lỗi tải thông tin cá nhân:', error.message);
    }

    const cachedUser = authService.getUser();
    return {
      id: cachedUser?.id || '',
      phone: cachedUser?.phone || '',
      full_name: cachedUser?.full_name || 'Người dùng',
      email: cachedUser?.email || '',
      role: cachedUser?.role || 'TEACHER_HOMEROOM',
      homeroom_class: '',
      school_name: cachedUser?.school_name || 'Chưa cập nhật',
      teaching_subjects: cachedUser?.teaching_subjects || [],
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
