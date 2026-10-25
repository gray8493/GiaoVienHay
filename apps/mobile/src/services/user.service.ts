import { api } from './http';
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
      const user = await api<any>('/users/me');
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
    const updated = await api<UserProfile>('/users/profile', {
      method: 'PATCH',
      body: payload,
      errorMessage: 'Cập nhật hồ sơ thất bại',
    });
    authService.setUser({ ...authService.getUser(), ...updated } as any);
    return updated;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const currentPassword = payload.current_password || payload.old_password || '';
    return authService.changePassword(currentPassword, payload.new_password);
  },

  async logout() {
    return authService.logout();
  },
};
