import { api } from './http';

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
  /** Công bố nhiều cột cùng lúc — backend gom thành 1 thông báo/học sinh */
  score_types?: string[];
  semester?: number;
}

export const gradesService = {
  async getClassGrades(classId: string, subjectCode: string, semester: number = 1) {
    if (!classId) return null;
    try {
      return await api(`/grades/class/${classId}?subject_code=${subjectCode}&semester=${semester}`, {
        errorMessage: 'Không thể tải sổ điểm',
      });
    } catch (error: any) {
      console.warn('getClassGrades failed:', error.message);
      return null;
    }
  },

  async getLeaderboard(classId: string, subjectCode: string, semester: number = 1, limit: number = 5) {
    if (!classId) return null;
    try {
      return await api(
        `/grades/leaderboard/${classId}?subject_code=${subjectCode}&semester=${semester}&limit=${limit}`,
        { errorMessage: 'Không thể tải bảng vinh danh' },
      );
    } catch (error: any) {
      console.warn('getLeaderboard failed:', error.message);
      return null;
    }
  },

  async batchInputScores(payload: BatchScoresPayload) {
    return api('/grades/batch', {
      method: 'POST',
      body: payload,
      errorMessage: 'Không thể lưu điểm',
    });
  },

  async publishScores(payload: PublishScoresPayload) {
    return api('/grades/publish', {
      method: 'POST',
      body: payload,
      errorMessage: 'Không thể công bố sổ điểm',
    });
  },
};
