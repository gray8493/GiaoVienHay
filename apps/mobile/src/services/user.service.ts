import { Platform } from 'react-native';

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
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_jwt_token_demo',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi tải thông tin cá nhân');
      }

      return await response.json();
    } catch (error: any) {
      // Mock dữ liệu chuẩn TEA-03 khi chạy offline
      return {
        id: 'usr_teacher_ha_01',
        phone: '0987 654 321',
        full_name: 'Cô Nguyễn Thu Hà',
        email: 'ha.nguyen@school.edu.vn',
        role: 'TEACHER_HOMEROOM',
        homeroom_class: '6A1',
        school_name: 'THCS Lê Quý Đôn',
        teaching_subjects: ['Toán', 'Tin Học'],
      };
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_jwt_token_demo',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cập nhật hồ sơ thất bại');
      }

      return await response.json();
    } catch (error: any) {
      console.warn('Update profile notice:', error.message);
      return {
        id: 'usr_teacher_ha_01',
        phone: '0987 654 321',
        full_name: payload.full_name || 'Cô Nguyễn Thu Hà',
        email: payload.email || 'ha.nguyen@school.edu.vn',
        role: 'TEACHER_HOMEROOM',
        homeroom_class: '6A1',
        school_name: payload.school_name || 'THCS Lê Quý Đôn',
        teaching_subjects: payload.teaching_subjects || ['Toán', 'Tin Học'],
      };
    }
  },

  async changePassword(payload: ChangePasswordPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_jwt_token_demo',
        },
        body: JSON.stringify({
          current_password: payload.current_password || payload.old_password,
          new_password: payload.new_password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Mật khẩu hiện tại không chính xác');
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_jwt_token_demo',
        },
      });
    } catch (error) {}
    return { success: true };
  },
};
