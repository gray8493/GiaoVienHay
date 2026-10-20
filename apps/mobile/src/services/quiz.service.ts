import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';

export interface QuizQuestion {
  question_index: number;
  content: string;
  options: string[];
  correct_answer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  time_limit_seconds?: number;
}

export interface GenerateQuizPayload {
  subject_code: string;
  class_id?: string;
  title: string;
  num_questions: number;
  difficulty_level: DifficultyLevel;
}

export interface QuizDetail {
  quiz_id: string;
  title: string;
  subject_code: string;
  class_id: string;
  difficulty_level: DifficultyLevel;
  total_questions: number;
  questions: QuizQuestion[];
}

// TODO(backend): hiện lưu điểm miệng ngoài Quiz vẫn phải gắn vào một quiz trên API
// /quizzes/{quizId}/in-class-scores. Cần endpoint riêng để bỏ giá trị tạm này.
export const ORAL_SCORE_QUIZ_ID = 'qz_88219';

export const quizService = {
  async generateQuizFromAi(payload: GenerateQuizPayload): Promise<QuizDetail> {
    const authHeader = await authService.getAuthHeaderAsync();
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/quizzes/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          subject_code: payload.subject_code,
          class_id: payload.class_id,
          title: payload.title,
          num_questions: payload.num_questions,
          difficulty_level: payload.difficulty_level,
        }),
      });
    } catch (e: any) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo câu hỏi từ AI');
    }
    return await response.json();
  },

  async getMyQuizzes(classId?: string, subjectCode?: string) {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const query = new URLSearchParams();
      if (classId) query.append('class_id', classId);
      if (subjectCode) query.append('subject_code', subjectCode);

      const response = await fetch(`${API_BASE_URL}/quizzes?${query.toString()}`, {
        method: 'GET',
        headers: {
          ...authHeader,
        },
      });

      if (!response.ok) throw new Error('Lỗi tải danh sách quiz');
      return await response.json();
    } catch (e) {
      return [];
    }
  },

  async getWheelCandidates(quizId: string) {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/wheel-candidates`, {
        method: 'GET',
        headers: {
          ...authHeader,
        },
      });

      if (!response.ok) throw new Error('Lỗi tải danh sách quay');
      return await response.json();
    } catch (e) {
      return [];
    }
  },

  async recordInClassScore(
    quizId: string = ORAL_SCORE_QUIZ_ID,
    payload: {
      student_id: string;
      score: number;
      teacher_note?: string;
      mode_played?: string;
      sync_to_scores_table?: boolean;
    },
  ) {
    const authHeader = await authService.getAuthHeaderAsync();
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/in-class-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          ...payload,
          sync_to_scores_table: true,
        }),
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
};
