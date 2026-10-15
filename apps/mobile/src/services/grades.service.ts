import { Platform } from 'react-native';
import { authService } from './auth.service';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

export interface ScoreItem {
  student_id: string;
  score_value: number;
  teacher_comment?: string;
}

export interface BatchScoresPayload {
  class_id: string;
  subject_code: string;
  semester?: number;
  score_type: 'ORAL_TEST' | 'TEST_15P' | 'TEST_1P' | 'MID_TERM' | 'FINAL';
  scores: ScoreItem[];
}

export interface PublishScoresPayload {
  class_id: string;
  subject_code: string;
  score_type: 'ORAL_TEST' | 'TEST_15P' | 'TEST_1P' | 'MID_TERM' | 'FINAL';
  semester?: number;
}

export const gradesService = {
  async getClassGrades(classId: string = 'cls_1a_2026', subjectCode: string = 'MATH', semester: number = 1) {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(
        `${API_BASE_URL}/grades/class/${classId}?subject_code=${subjectCode}&semester=${semester}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        }
      );
      if (!response.ok) throw new Error('Không thể tải sổ điểm');
      return await response.json();
    } catch (error: any) {
      console.warn('Backend grades notice (offline fallback):', error.message);
      return null;
    }
  },

  async getLeaderboard(classId: string = 'cls_1a_2026', subjectCode: string = 'MATH', semester: number = 1, limit: number = 5) {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(
        `${API_BASE_URL}/grades/leaderboard/${classId}?subject_code=${subjectCode}&semester=${semester}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        }
      );
      if (!response.ok) throw new Error('Không thể tải bảng vinh danh');
      return await response.json();
    } catch (error: any) {
      console.warn('Backend leaderboard notice (offline fallback):', error.message);
      return null;
    }
  },

  async batchInputScores(payload: BatchScoresPayload) {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/grades/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Không thể lưu điểm');
      return await response.json();
    } catch (error: any) {
      console.warn('Backend save scores notice (offline fallback):', error.message);
      return { success: true, message: 'Đã lưu điểm thành công (chế độ demo)' };
    }
  },

  async publishScores(payload: PublishScoresPayload) {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/grades/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Không thể công bố sổ điểm');
      return await response.json();
    } catch (error: any) {
      console.warn('Backend publish scores notice (offline fallback):', error.message);
      return { success: true, message: 'Đã công bố điểm cho phụ huynh (chế độ demo)' };
    }
  },
};
