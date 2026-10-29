import { Platform } from 'react-native';
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
  /** Text giáo án đã extract — BE trả về khi tạo đề để gửi lại lúc tạo lại câu hỏi */
  lesson_content?: string;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

const resolveMimeType = (file: QuizUploadFile): string => {
  if (file.mimeType) return file.mimeType;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return MIME_BY_EXTENSION[ext] || 'application/octet-stream';
};

/**
 * Trên web, FormData chỉ nhận Blob/File thật — append object { uri, name, type }
 * sẽ bị stringify thành "[object Object]" và server không thấy file.
 * Trên native, object { uri, name, type } mới là định dạng React Native chấp nhận.
 */
const appendLessonFile = async (formData: FormData, file: QuizUploadFile): Promise<void> => {
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    // RN typings khai báo append(name, value) nên phải cast để truyền filename (web).
    (formData as any).append('file', blob, file.name);
    return;
  }
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: resolveMimeType(file),
  } as any);
};

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
        await appendLessonFile(formData, file);
        formData.append('file_name', file.name);
        if (file.size) formData.append('file_size_bytes', String(file.size));
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
  async regenerateQuestion(
    quizId: string,
    questionNumber: number,
    difficultyLevel?: DifficultyLevel,
    lessonContent?: string,
  ) {
    const body: Record<string, unknown> = {};
    if (difficultyLevel) body.difficulty_level = difficultyLevel;
    if (lessonContent) body.lesson_content = lessonContent;
    return api(`/quizzes/${quizId}/questions/${questionNumber}/regenerate`, {
      method: 'POST',
      body,
      errorMessage: 'Không thể tạo lại câu hỏi bằng AI',
    });
  },
};
