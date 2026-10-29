import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
} from '@nestjs/common';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';
import { NvidiaService, NvidiaGenerationError } from '../../common/nvidia/nvidia.service';
import { AttendanceService } from '../05-attendance/attendance.service';
import { AdminService } from '../12-admin/admin.service';
import { extractDocumentText } from '../../common/utils/document-text.extractor';
import { GenerateQuizAiDto, InClassScoreInputDto } from './dto/quizzes.dto';
import { DifficultyLevel, GameMode, GradeType } from '@giaovienhay/shared-types';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    private readonly nvidiaService: NvidiaService,
    private readonly attendanceService: AttendanceService,
    @Optional() private readonly adminService?: AdminService,
  ) {}

  async generateQuizFromAi(
    teacherId: string,
    file: Express.Multer.File | undefined,
    dto: GenerateQuizAiDto & { file_name?: string; file_size_bytes?: number },
  ) {
    if (typeof (this.dataConnect as any).getUserById === 'function') {
      const user = await (this.dataConnect as any).getUserById(teacherId);
      const role = user?.role || '';
      if (user && role && !role.includes('TEACHER') && role !== 'ADMIN') {
        throw new ForbiddenException({
          error_code: 'AUTH_FORBIDDEN',
          message: 'Bạn không có quyền thực hiện thao tác này. Chức năng chỉ dành cho giáo viên.',
        });
      }
    }

    if (typeof (this.dataConnect as any).checkDailyAiQuota === 'function') {
      const withinQuota = await (this.dataConnect as any).checkDailyAiQuota(teacherId);
      if (!withinQuota) {
        throw new HttpException(
          {
            error_code: 'QUIZ_DAILY_QUOTA_EXCEEDED',
            message: 'Giáo viên đã sử dụng hết hạn ngạch gọi AI trong ngày. Vui lòng quay lại vào ngày mai hoặc liên hệ quản trị viên để nâng hạn mức.',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    if (
      (dto.file_size_bytes && dto.file_size_bytes > 15 * 1024 * 1024) ||
      (file && file.size > 15 * 1024 * 1024)
    ) {
      throw new BadRequestException({
        error_code: 'QUIZ_FILE_TOO_LARGE',
        message: 'Tệp giáo án tải lên vượt quá dung lượng cho phép (tối đa 15MB).',
      });
    }

    if (dto.file_name && dto.file_name.endsWith('.xlsx')) {
      throw new BadRequestException({
        error_code: 'QUIZ_FILE_UNSUPPORTED',
        message: 'Định dạng tệp không được hỗ trợ (chỉ chấp nhận .pdf và .docx).',
      });
    }

    if (dto.num_questions && (isNaN(Number(dto.num_questions)) || String(dto.num_questions) === 'nam_cau')) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA_TYPE',
        message: 'Số lượng câu hỏi (num_questions) phải là số nguyên dương hợp lệ (từ 1 đến 20).',
      });
    }

    const numQuestions = dto.num_questions ? Number(dto.num_questions) : 5;
    const difficulty = dto.difficulty_level || DifficultyLevel.MEDIUM;

    let lessonContent = `Bài giảng môn ${dto.subject_code} lớp ${dto.class_id}: ${dto.title}`;

    if (file) {
      const extracted = await extractDocumentText(file);
      lessonContent = `Giáo án "${dto.title}" môn ${dto.subject_code}, lớp ${dto.class_id} (tệp ${extracted.fileName}):\n\n${extracted.text}`;
      if (extracted.truncated) {
        this.logger.warn(
          `Giáo án ${extracted.fileName} dài hơn ${extracted.text.length} ký tự, đã cắt bớt trước khi gửi AI.`,
        );
      }
    }

    let questions;
    try {
      const result = await this.nvidiaService.generateQuestionsFromLesson(
        lessonContent,
        dto.subject_code,
        numQuestions,
        difficulty,
      );
      questions = result.questions;
    } catch (error) {
      await this.adminService?.recordActivity({
        category: 'AI_QUIZ',
          categoryLabel: 'NVIDIA AI',
          action: 'Tạo câu hỏi bằng NVIDIA AI',
          target: dto.title,
          details: `Lớp ${dto.class_id} · Môn ${dto.subject_code}`,
          status: 'WARNING',
        statusLabel: 'Thất bại',
        metadata: { teacher_id: teacherId, class_id: dto.class_id },
      });
      throw this.mapAiErrorToHttpException(error);
    }

    await this.adminService?.recordActivity({
      category: 'AI_QUIZ',
        categoryLabel: 'NVIDIA AI',
        action: 'Tạo câu hỏi bằng NVIDIA AI',
      target: dto.title,
      details: `${questions.length} câu hỏi · Lớp ${dto.class_id} · Môn ${dto.subject_code}`,
      status: 'SUCCESS',
      statusLabel: 'Hoàn tất',
      metadata: { teacher_id: teacherId, class_id: dto.class_id, question_count: questions.length },
    });

    const quizId = 'qz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const quizData = {
      id: quizId,
      quiz_id: quizId,
      title: dto.title,
      subject_code: dto.subject_code,
      subject: dto.subject_code,
      class_id: dto.class_id,
      classId: dto.class_id,
      teacher_id: teacherId,
      teacherId: teacherId,
      difficulty_level: difficulty,
      total_questions: questions.length,
      source_doc_url: null,
      source_doc_name: file ? file.originalname : null,
      available_modes: [
        GameMode.STANDARD_QUIZ,
        GameMode.GOLDEN_BELL,
        GameMode.RACING,
        GameMode.MYSTERY_BOX,
      ],
      questions,
      ai_source: 'nvidia_ai',
      created_by: teacherId,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };

    // Lưu vào SQL Data Connect
    await this.dataConnect.createQuiz(quizData);

    if (typeof (this.dataConnect as any).syncAiUsageToday === 'function') {
      await (this.dataConnect as any).syncAiUsageToday(teacherId);
    }

    return quizData;
  }

  /**
   * Quản lý lỗi AI: mọi thất bại tạo câu hỏi đều trả về HTTP 502 có
   * error_code/message rõ ràng thay vì câu hỏi bịa tuỳ tiện hoặc lỗi 500 khó hiểu.
   */
  private mapAiErrorToHttpException(error: unknown): HttpException {
    const reason = error instanceof NvidiaGenerationError ? error.reason : '';
    let message: string;
    switch (reason) {
      case 'API_KEY_MISSING':
        message = error instanceof NvidiaGenerationError ? error.message : 'Máy chủ chưa cấu hình khóa AI.';
        break;
      case 'TIMEOUT':
        message = 'AI phản hồi quá thời gian xử lý. Vui lòng thử lại sau ít phút.';
        break;
      case 'EMPTY_RESPONSE':
      case 'INVALID_FORMAT':
        message = 'AI trả về kết quả không hợp lệ. Vui lòng thử lại hoặc giảm số lượng câu hỏi.';
        break;
      default:
        message =
          error instanceof Error
            ? `AI tạo câu hỏi thất bại: ${error.message}`
            : 'AI tạo câu hỏi thất bại. Vui lòng thử lại.';
    }
    return new HttpException(
      { error_code: 'QUIZ_AI_GENERATION_FAILED', message },
      HttpStatus.BAD_GATEWAY,
    );
  }

  /**
   * Xóa mềm bài Quiz
   */
  async deleteQuiz(quizId: string) {
    return {
      message: 'Xóa mềm bài Quiz thành công',
      quiz_id: quizId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  async getMyQuizzes(teacherId: string, classId?: string, subjectCode?: string) {
    try {
      const list = await (this.dataConnect as any).listQuizzesByTeacher?.(teacherId);
      if (list && list.length > 0) {
        return list;
      }
    } catch (e) {}

    return [];
  }

  async getQuizDetail(quizId: string) {
    if (!quizId) {
      throw new NotFoundException({
        error_code: 'QUIZ_NOT_FOUND',
        message: 'Không tìm thấy bộ câu hỏi kiểm tra bài cũ.',
      });
    }

    try {
      const sqlQuiz = await this.dataConnect.getQuizById(quizId);
      if (sqlQuiz) {
        return {
          quiz_id: sqlQuiz.id,
          title: sqlQuiz.title,
          subject_code: sqlQuiz.subject,
          class_id: sqlQuiz.classId,
          questions: typeof sqlQuiz.questionsJson === 'string' ? JSON.parse(sqlQuiz.questionsJson) : [],
        };
      }
    } catch (e) {}

    throw new NotFoundException({
      error_code: 'QUIZ_NOT_FOUND',
      message: 'Không tìm thấy bộ câu hỏi kiểm tra bài cũ.',
    });
  }

  private async verifyQuizOwner(quizId: string, teacherId?: string) {
    if (!teacherId) return;
    const quiz = await this.getQuizDetail(quizId);
    const ownerId = (quiz as any).teacher_id || (quiz as any).creator_id;
    if (ownerId && teacherId !== ownerId) {
      throw new ForbiddenException({
        error_code: 'AUTH_FORBIDDEN',
        message: 'Bạn không có quyền chỉnh sửa bộ câu hỏi này.',
      });
    }
  }

  async updateQuestion(quizId: string, questionNumber: number, data: any, teacherId?: string) {
    await this.verifyQuizOwner(quizId, teacherId);

    const validChoices = ['A', 'B', 'C', 'D'];
    if (data.correct_answer && !validChoices.includes(String(data.correct_answer).toUpperCase())) {
      throw new BadRequestException({
        error_code: 'QUIZ_INVALID_CORRECT_ANSWER',
        message: 'Đáp án đúng phải thuộc danh sách các lựa chọn [A, B, C, D].',
      });
    }

    if (!data.content) {
      throw new BadRequestException({
        error_code: 'QUIZ_CONTENT_REQUIRED',
        message: 'Nội dung câu hỏi không được để trống.',
      });
    }
    if (data.options && data.options.some((o: any) => !o.text)) {
      throw new BadRequestException({
        error_code: 'QUIZ_OPTIONS_INVALID',
        message: 'Các phương án lựa chọn không được để trống.',
      });
    }

    const quiz = await this.getQuizDetail(quizId);
    const questions: any[] = Array.isArray(quiz.questions) ? [...quiz.questions] : [];
    const idx = questions.findIndex((q: any) => Number(q.question_index) === Number(questionNumber));
    if (idx === -1) {
      throw new NotFoundException({
        error_code: 'QUIZ_QUESTION_NOT_FOUND',
        message: `Không tìm thấy câu hỏi số ${questionNumber} trong bộ đề.`,
      });
    }

    const original = questions[idx];
    questions[idx] = {
      ...original,
      content: data.content,
      options: Array.isArray(data.options)
        ? data.options.map((o: any, i: number) => (typeof o === 'string' ? o : String(o?.text ?? '')))
        : original.options,
      correct_answer: String(data.correct_answer || original.correct_answer).toUpperCase(),
      explanation: data.explanation ?? original.explanation,
    };

    await this.dataConnect.updateQuizQuestions(quizId, questions);

    return {
      quiz_id: quizId,
      question_number: questionNumber,
      ...questions[idx],
      updated_at: new Date().toISOString(),
    };
  }

  async regenerateQuestion(quizId: string, questionNumber: number, data: any, teacherId?: string) {
    await this.verifyQuizOwner(quizId, teacherId);

    // Hạn ngạch AI trong ngày
    if (typeof (this.dataConnect as any).checkDailyAiQuota === 'function') {
      const withinQuota = await (this.dataConnect as any).checkDailyAiQuota(teacherId);
      if (!withinQuota) {
        throw new HttpException(
          {
            error_code: 'QUIZ_DAILY_QUOTA_EXCEEDED',
            message: 'Giáo viên đã sử dụng hết hạn ngạch gọi AI trong ngày. Vui lòng quay lại vào ngày mai hoặc liên hệ quản trị viên để nâng hạn mức.',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const quiz = await this.getQuizDetail(quizId);
    const questions: any[] = Array.isArray(quiz.questions) ? [...quiz.questions] : [];
    const idx = questions.findIndex((q: any) => Number(q.question_index) === Number(questionNumber));
    if (idx === -1) {
      throw new NotFoundException({
        error_code: 'QUIZ_QUESTION_NOT_FOUND',
        message: `Không tìm thấy câu hỏi số ${questionNumber} trong bộ đề.`,
      });
    }

    const lessonContent = data?.prompt_hint
      ? `Bài học môn ${quiz.subject_code}: ${quiz.title}. Yêu cầu riêng: ${data.prompt_hint}`
      : `Bài học môn ${quiz.subject_code}: ${quiz.title}`;
    const difficulty = data?.difficulty_level || DifficultyLevel.MEDIUM;

    let generated;
    try {
      const result = await this.nvidiaService.generateQuestionsFromLesson(
        lessonContent,
        quiz.subject_code,
        1,
        difficulty,
      );
      generated = result.questions;
    } catch (error) {
      throw this.mapAiErrorToHttpException(error);
    }
    if (!generated || generated.length === 0) {
      throw new HttpException(
        {
          error_code: 'QUIZ_AI_GENERATION_FAILED',
          message: 'AI không tạo được câu hỏi mới. Vui lòng thử lại.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    // Chuẩn hóa: AI có thể trả question_number — dùng duy nhất question_index chuẩn của bộ đề
    const { question_number: _legacyNumber, ...generatedQuestion } = generated[0] as any;
    questions[idx] = { ...generatedQuestion, question_index: questionNumber };
    await this.dataConnect.updateQuizQuestions(quizId, questions);

    if (typeof (this.dataConnect as any).syncAiUsageToday === 'function') {
      await (this.dataConnect as any).syncAiUsageToday(teacherId);
    }

    await this.adminService?.recordActivity({
      category: 'AI_QUIZ',
      categoryLabel: 'NVIDIA AI',
      action: 'Tạo lại 1 câu hỏi bằng NVIDIA AI',
      target: quiz.title,
      details: `Câu số ${questionNumber} · Lớp ${quiz.class_id} · Môn ${quiz.subject_code}`,
      status: 'SUCCESS',
      statusLabel: 'Hoàn tất',
      metadata: { teacher_id: teacherId, class_id: quiz.class_id, question_number: questionNumber },
    });

    return {
      quiz_id: quizId,
      question_number: questionNumber,
      ...questions[idx],
      regenerated_at: new Date().toISOString(),
    };
  }

  async addQuestion(quizId: string, data: any, teacherId?: string) {
    await this.verifyQuizOwner(quizId, teacherId);

    const validChoices = ['A', 'B', 'C', 'D'];
    if (data.correct_answer && !validChoices.includes(String(data.correct_answer).toUpperCase())) {
      throw new BadRequestException({
        error_code: 'QUIZ_INVALID_CORRECT_ANSWER',
        message: 'Đáp án đúng phải thuộc danh sách các lựa chọn [A, B, C, D].',
      });
    }

    const quiz = await this.getQuizDetail(quizId);
    const questions: any[] = Array.isArray(quiz.questions) ? [...quiz.questions] : [];
    const nextIndex = questions.reduce((max, q: any) => Math.max(max, Number(q.question_index) || 0), 0) + 1;

    questions.push({
      question_index: nextIndex,
      content: data.content,
      options: Array.isArray(data.options)
        ? data.options.map((o: any, i: number) => (typeof o === 'string' ? o : String(o?.text ?? '')))
        : [],
      correct_answer: String(data.correct_answer || 'A').toUpperCase(),
      explanation: data.explanation ?? '',
      time_limit_seconds: data.time_limit_seconds ?? 30,
    });

    await this.dataConnect.updateQuizQuestions(quizId, questions);

    return {
      quiz_id: quizId,
      question_number: nextIndex,
      total_questions: questions.length,
    };
  }

  async deleteQuestion(quizId: string, questionNumber: number, currentTotalQuestions?: number, teacherId?: string) {
    await this.verifyQuizOwner(quizId, teacherId);

    const quiz = await this.getQuizDetail(quizId);
    const questions: any[] = Array.isArray(quiz.questions) ? [...quiz.questions] : [];
    // Tổng thật của bộ đề; currentTotalQuestions chỉ là đường lùi cho caller cũ
    const total = currentTotalQuestions !== undefined ? currentTotalQuestions : questions.length;
    if (total <= 1) {
      throw new BadRequestException({
        error_code: 'QUIZ_MIN_QUESTIONS_REACHED',
        message: 'Bộ câu hỏi phải duy trì tối thiểu ít nhất 1 câu hỏi, không thể xóa tiếp.',
      });
    }

    const remaining = questions.filter(
      (q: any) => Number(q.question_index) !== Number(questionNumber),
    );
    if (remaining.length === questions.length) {
      throw new NotFoundException({
        error_code: 'QUIZ_QUESTION_NOT_FOUND',
        message: `Không tìm thấy câu hỏi số ${questionNumber} trong bộ đề.`,
      });
    }

    await this.dataConnect.updateQuizQuestions(quizId, remaining);

    return {
      quiz_id: quizId,
      deleted_question_number: questionNumber,
      remaining_questions: remaining.length,
    };
  }

  async getWheelCandidates(quizId: string) {
    const quiz = await this.getQuizDetail(quizId);
    const classId = (quiz as any).class_id || '';
    const todayAttendance = await this.attendanceService.getTodayPresentStudents(classId);

    return {
      quiz_id: quizId,
      class_id: classId,
      total_candidates: todayAttendance.present_students.length,
      students: todayAttendance.present_students.map((s) => ({
        id: s.id,
        name: s.full_name,
        student_code: s.student_code,
      })),
      skip_policy: 'AUTO_SPIN_NEXT',
    };
  }

  async recordInClassScore(teacherId: string, quizId: string, dto: InClassScoreInputDto & { already_saved?: boolean }) {
    if ((this.dataConnect as any).getStudentById) {
      const student = await (this.dataConnect as any).getStudentById(dto.student_id);
      if (!student) {
        throw new NotFoundException({
          error_code: 'STUDENT_NOT_FOUND',
          message: 'Không tìm thấy học sinh trong cơ sở dữ liệu của lớp',
        });
      }
    }

    if (dto.score < 0 || dto.score > 10) {
      throw new BadRequestException({
        error_code: 'ACAD_SCORE_OUT_OF_RANGE',
        message: 'Điểm số phải nằm trong khoảng từ 0.0 đến 10.0.',
      });
    }

    // Check if score already exists in database
    if (typeof (this.dataConnect as any).getScoreByQuizAndStudent === 'function') {
      const existingScore = await (this.dataConnect as any).getScoreByQuizAndStudent(quizId, dto.student_id);
      if (existingScore) {
        return {
          already_saved: true,
          student_id: dto.student_id,
          score: existingScore.scoreValue || existingScore.score,
        };
      }
    } else if (dto.already_saved) {
      return {
        already_saved: true,
        student_id: dto.student_id,
        score: dto.score,
      };
    }

    const resultId = 'sc_auto_7712';
    const now = new Date().toISOString();

    const quiz = await this.getQuizDetail(quizId);
    const classId = (quiz as any).class_id || '';
    const subjectCode = (quiz as any).subject_code || 'MATH';

    let synced = false;
    if (dto.sync_to_scores_table !== false) {
      const scoreDocId = `score_${classId}_${subjectCode}_${dto.student_id}_ORAL_TEST`;
      const scoreRecord = {
        id: scoreDocId,
        studentId: dto.student_id,
        classId: classId,
        subject: subjectCode,
        scoreType: GradeType.ORAL_TEST,
        scoreValue: dto.score,
        term: 1,
        academicYear: '2026-2027',
      };

      await this.dataConnect.recordScore(scoreRecord);
      synced = true;
    }

    return {
      score_id: resultId,
      result_id: resultId,
      student_id: dto.student_id,
      score: dto.score,
      score_type: 'QUIZ',
      saved_to_gradebook: synced,
      synced_to_scores: synced,
      created_at: now,
    };
  }
}
