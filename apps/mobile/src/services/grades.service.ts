import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';

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
  async getClassGrades(classId: string, subjectCode: string, semester: number = 1) {
    if (!classId) return null;
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
      const resJson = await response.json();
      return resJson.data || resJson;
    } catch (error: any) {
      console.warn('Backend grades notice (offline fallback):', error.message);
      return null;
    }
  },

  async getLeaderboard(classId: string, subjectCode: string, semester: number = 1, limit: number = 5) {
    if (!classId) return null;
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
      const resJson = await response.json();
      return resJson.data || resJson;
    } catch (error: any) {
      console.warn('Backend leaderboard notice (offline fallback):', error.message);
      return null;
    }
  },

  async batchInputScores(payload: BatchScoresPayload) {
    const authHeader = await authService.getAuthHeaderAsync();
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/grades/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể lưu điểm');
    }
    return await response.json();
  },

  async publishScores(payload: PublishScoresPayload) {
    const authHeader = await authService.getAuthHeaderAsync();
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/grades/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể công bố sổ điểm');
    }
    return await response.json();
  },
};
