import { api, apiFetch } from './http';

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

export interface QuizUploadFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
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

/** Chuỗi options['A','B',...] → mảng QuestionOptionDto của backend */
const toOptionDto = (options: string[]) =>
  options.map((text, idx) => ({ key: String.fromCharCode(65 + idx), text }));

export const quizService = {
  async generateQuizFromAi(payload: GenerateQuizPayload, file?: QuizUploadFile): Promise<QuizDetail> {
    let response: Response;
    try {
      if (file) {
        const formData = new FormData();
        formData.append('subject_code', payload.subject_code);
        if (payload.class_id) formData.append('class_id', payload.class_id);
        formData.append('title', payload.title);
        formData.append('num_questions', String(payload.num_questions));
        formData.append('difficulty_level', payload.difficulty_level);
        formData.append(
          'file',
          {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/octet-stream',
          } as any,
        );
        response = await apiFetch('/quizzes/generate-ai', { method: 'POST', body: formData });
      } else {
        response = await apiFetch('/quizzes/generate-ai', {
          method: 'POST',
          body: payload,
        });
      }
    } catch (e: any) {
      throw new Error(e?.message || 'Không thể tạo câu hỏi từ AI');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo câu hỏi từ AI');
    }
    return await response.json();
  },

  async getMyQuizzes(classId?: string, subjectCode?: string) {
    try {
      const query = new URLSearchParams();
      if (classId) query.append('class_id', classId);
      if (subjectCode) query.append('subject_code', subjectCode);
      return await api(`/quizzes?${query.toString()}`, { errorMessage: 'Lỗi tải danh sách quiz' });
    } catch (e) {
      return [];
    }
  },

  async getWheelCandidates(quizId: string) {
    try {
      return await api(`/quizzes/${quizId}/wheel-candidates`, {
        errorMessage: 'Lỗi tải danh sách quay',
      });
    } catch (e) {
      return [];
    }
  },

  /** PUT /quizzes/:id/questions/:n — sửa nội dung một câu hỏi (lưu DB) */
  async updateQuestion(
    quizId: string,
    questionNumber: number,
    payload: { content: string; options: string[]; correct_answer: string; explanation?: string },
  ) {
    return api(`/quizzes/${quizId}/questions/${questionNumber}`, {
      method: 'PUT',
      body: {
        content: payload.content,
        options: toOptionDto(payload.options),
        correct_answer: payload.correct_answer,
        explanation: payload.explanation,
      },
      errorMessage: 'Không thể lưu chỉnh sửa câu hỏi',
    });
  },

  /** DELETE /quizzes/:id/questions/:n — xóa một câu hỏi khỏi bộ đề (lưu DB) */
  async deleteQuestion(quizId: string, questionNumber: number) {
    return api(`/quizzes/${quizId}/questions/${questionNumber}`, {
      method: 'DELETE',
      errorMessage: 'Không thể xóa câu hỏi',
    });
  },

  /** POST /quizzes/:id/questions/:n/regenerate — AI sinh lại một câu hỏi */
  async regenerateQuestion(quizId: string, questionNumber: number, difficultyLevel?: DifficultyLevel) {
    return api(`/quizzes/${quizId}/questions/${questionNumber}/regenerate`, {
      method: 'POST',
      body: difficultyLevel ? { difficulty_level: difficultyLevel } : {},
      errorMessage: 'Không thể tạo lại câu hỏi bằng AI',
    });
  },
};
