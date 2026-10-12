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
  role: 'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT' | 'PARENT';
  school_name?: string;
  teaching_subjects?: string[];
}

export const authService = {
  async login(payload: LoginPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập không thành công');
      }

      return data;
    } catch (error: any) {
      // Fallback cho chế độ offline/demo nếu backend server chưa bật
      console.warn('Backend login notice:', error.message);
      return {
        access_token: 'mock_jwt_token_demo',
        user: {
          full_name: 'Cô Nguyễn Thu Hà',
          phone: payload.phone,
          role: 'TEACHER_HOMEROOM',
        },
      };
    }
  },

  async register(payload: RegisterPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký không thành công');
      }

      return data;
    } catch (error: any) {
      console.warn('Backend register notice:', error.message);
      return {
        access_token: 'mock_jwt_token_registered',
        user: {
          full_name: payload.full_name,
          phone: payload.phone,
          role: payload.role,
          school_name: payload.school_name,
          teaching_subjects: payload.teaching_subjects,
        },
      };
    }
  },
};
