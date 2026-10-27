/**
 * UAT06_GVBM_01 — NGHIỆM THU TRỢ GIẢNG AI SINH CÂU HỎI TRẮC NGHIỆM BÀI CŨ
 *                THEO MÔN, KHỐI VÀ ĐỘ KHÓ TÙY CHỌN
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT06)
 */
import { BadRequestException, ForbiddenException, HttpException } from '@nestjs/common';
import { QuizzesService } from '../../apps/api/src/modules/07-quizzes/quizzes.service';
import { QuizzesController } from '../../apps/api/src/modules/07-quizzes/quizzes.controller';
import { ROLES_KEY } from '../../apps/api/src/common/decorators/roles.decorator';
import { DifficultyLevel, GameMode, UserRole } from '@giaovienhay/shared-types';

const GVBM_ID = 'usr_teacher_nam_01'; // Thầy Lê Hoàng Nam — GVBM>Toán/Tin
const PHHS_ID = 'usr_parent_hung_01';
const CLASS_1A_ID = 'cls_1a_chuvanan';

function buildQuizzesService(aiDelayMs = 10) {
  const quizzesDb = new Map<string, any>();
  const activities: any[] = [];
  const mockDataConnect = {
    getUserById: jest.fn(async (id: string) => {
      if (id === GVBM_ID) return { id, role: UserRole.TEACHER_SUBJECT, full_name: 'Thầy Lê Hoàng Nam' };
      if (id === 'usr_teacher_lan_01') return { id, role: UserRole.TEACHER_HOMEROOM };
      if (id === PHHS_ID) return { id, role: UserRole.PARENT };
      return null;
    }),
    checkDailyAiQuota: jest.fn(async () => true),
    syncAiUsageToday: jest.fn(async () => true),
    createQuiz: jest.fn(async (q: any) => {
      quizzesDb.set(q.id, JSON.parse(JSON.stringify(q)));
      return q;
    }),
    listQuizzesByTeacher: jest.fn(async () => Array.from(quizzesDb.values())),
    getQuizById: jest.fn(async (id: string) => {
      const q = quizzesDb.get(id);
      return q ? { ...q, id: q.quiz_id, subject: q.subject_code, classId: q.class_id, questionsJson: JSON.stringify(q.questions) } : null;
    }),
    updateQuizQuestions: jest.fn(async (id: string, questions: any[]) => {
      const q = quizzesDb.get(id);
      if (q) q.questions = questions;
      return true;
    }),
  };
  const mockNvidia = {
    generateQuestionsFromLesson: jest.fn().mockImplementation(
      async () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                source: 'nvidia_ai',
                questions: [
                  {
                    question_index: 1,
                    content: 'Phép cộng và trừ phân số: 1/2 + 1/3 bằng bao nhiêu?',
                    options: [
                      { text: '5/6', is_correct: true },
                      { text: '2/5', is_correct: false },
                      { text: '1/5', is_correct: false },
                      { text: '2/6', is_correct: false },
                    ],
                    correct_answer: 'A',
                    explanation: 'Quy đồng mẫu số chung là 6: 3/6 + 2/6 = 5/6.',
                    time_limit_seconds: 30,
                  },
                  {
                    question_index: 2,
                    content: 'Rút gọn 4/8 được phân số nào?',
                    options: [
                      { text: '1/4', is_correct: false },
                      { text: '1/2', is_correct: true },
                      { text: '2/4', is_correct: false },
                      { text: '4/2', is_correct: false },
                    ],
                    correct_answer: 'B',
                    explanation: 'Chia tử và mẫu cho 4: 4/8 = 1/2.',
                    time_limit_seconds: 30,
                  },
                ],
              }),
            aiDelayMs,
          ),
        ),
    ),
  };
  const mockAttendance = {} as any;
  const mockAdmin = {
    recordActivity: jest.fn(async (item: any) => {
      activities.push(item);
      return { id: 'ACT-01', ...item };
    }),
  };

  const service = new QuizzesService(
    mockDataConnect as any,
    mockNvidia as any,
    mockAttendance as any,
    mockAdmin as any,
  );
  return { service, mockDataConnect, mockNvidia, mockAdmin, activities, quizzesDb };
}

/** Bộ 5 câu hỏi trắc nghiệm chuẩn từ AI (đáp án A, B, C, D + lời giải) */
const BON_CAU_HOI_MAU = [
  { question_index: 1, content: 'Câu 1', options: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }], correct_answer: 'A', explanation: 'Giải1' },
  { question_index: 2, content: 'Câu 2', options: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }], correct_answer: 'B', explanation: 'Giải2' },
  { question_index: 3, content: 'Câu 3', options: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }], correct_answer: 'C', explanation: 'Giải3' },
  { question_index: 4, content: 'Câu 4', options: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }], correct_answer: 'D', explanation: 'Giải4' },
];

describe('UAT06_GVBM_01 — Trợ giảng AI sinh câu hỏi trắc nghiệm', () => {
  let ctx: ReturnType<typeof buildQuizzesService>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildQuizzesService();
  });

  it('Bước 1–2: GVBM cấu hình môn, số lượng, độ khó — AI sinh bộ câu hỏi hoàn chỉnh trong vòng dưới 12 giây', async () => {
    const start = Date.now();
    const res: any = await ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
      title: 'Kiểm tra bài cũ: Phép cộng và trừ phân số',
      subject_code: 'MATH',
      class_id: CLASS_1A_ID,
      num_questions: 5,
      difficulty_level: DifficultyLevel.MEDIUM,
    } as any);
    const elapsed = Date.now() - start;

    // Tiêu chí nghiệm thu: AI xử lý < 12 giây
    expect(elapsed).toBeLessThan(12000);
    expect(res.subject_code).toBe('MATH');
    expect(res.class_id).toBe(CLASS_1A_ID);
    expect(res.difficulty_level).toBe(DifficultyLevel.MEDIUM);
    // Chẩn sư phạm: câu hỏi có nội dung + 4 phương án + đáp án + lời giải
    expect(res.questions.length).toBeGreaterThanOrEqual(2);
    expect(res.questions[0].content).toMatch(/Phân số/i);
    expect(res.questions[0].options).toHaveLength(4);
    expect(res.questions[0].correct_answer).toMatch(/^[ABCD]$/);
    // Lưu vào kho đề (bảng quizzes)
    expect(ctx.mockDataConnect.createQuiz).toHaveBeenCalledTimes(1);
    expect(res.available_modes).toContain(GameMode.STANDARD_QUIZ);
  });

  it('Bước 2b: Mặc định sinh 5 câu hỏi nếu GVBM không chỉ định số lượng', async () => {
    // Cho phép kiểm tra num_questions truyền sai định dạng
    const res: any = await ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
      title: 'Bài cũ ngẫu nhiên', subject_code: 'MATH', class_id: CLASS_1A_ID,
    } as any);
    expect(res.total_questions).toBeGreaterThan(0);
    // AI được gọi đủ tham số (độ khó mặc định vừa)
    expect(ctx.mockNvidia.generateQuestionsFromLesson).toHaveBeenCalledWith(
      expect.stringContaining('Bài giảng môn MATH'),
      'MATH',
      5,
      DifficultyLevel.MEDIUM,
    );
  });

  it('Bước 3: GVBM xem trước, biên tập câu hỏi, lưu thay đổi vào bộ câu hỏi ở kho đề', async () => {
    // Tiến trình: sinh bộ câu hỏi trước
    const quiz: any = await ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
      title: 'Bộ đề bài cũ', subject_code: 'MATH', class_id: CLASS_1A_ID,
    } as any);

    // Xem trước từng câu hỏi từ kho đề
    const detail = await ctx.service.getQuizDetail(quiz.quiz_id);
    expect(detail.subject_code).toBe('MATH');
    expect(detail.questions.length).toBeGreaterThan(0);

    // GVBM chỉnh sửa câu số 2 (sửa từ trong phương án A)
    const edited = await ctx.service.updateQuestion(quiz.quiz_id, 2, {
      content: 'Rút gọn 4/8 = ?',
      options: ['1/4', '1/2', '2/4', '4/2'].map((text) => ({ text })),
      correct_answer: 'B',
    }, GVBM_ID);
    expect(edited.content).toBe('Rút gọn 4/8 = ?');

    // Persist đến kho đề (bảng questions trong DB)
    const updatedQuiz = await ctx.service.getQuizDetail(quiz.quiz_id);
    expect(updatedQuiz.questions[1].content).toBe('Rút gọn 4/8 = ?');
  });

  it('Bước 3b: Từ chối cập nhật đáp án ngoài danh sách [A, B, C, D]', async () => {
    const quiz: any = await ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
      title: 'Bộ đề bài cũ', subject_code: 'MATH', class_id: CLASS_1A_ID,
    } as any);
    await expect(
      ctx.service.updateQuestion(quiz.quiz_id, 1, {
        content: 'Câu hỏi mới', correct_answer: 'E',
      }, GVBM_ID),
    ).rejects.toThrow(BadRequestException);
  });

  /**
   * Lớpowering quyền chỉnh sửa bộ đề được chặn ở tầng RolesGuard của controller
   * (@Roles('TEACHER_*','ADMIN') trên route PUT :id/questions/:questionNumber).
   */
  it('RBAC: route chỉnh sửa bộ đề chỉ mở cho TEACHER_* và ADMIN (RolesGuard)', async () => {
    const required = (Reflect.getMetadata(ROLES_KEY, QuizzesController.prototype.updateQuestion) as string[]) || [];
    expect(required).toEqual(expect.arrayContaining(['TEACHER_*', 'ADMIN']));
    // Phụ huynh & tài khoản lạ không có quyền biên tập bộ đề
    expect(required).not.toContain('PARENT');
  });

  it('Tài khoản PH không được phép gọi AI sinh đề (Forbidden)', async () => {
    await expect(
      ctx.service.generateQuizFromAi(PHHS_ID, undefined, {
        title: 'Bài cũ của con', subject_code: 'MATH', class_id: CLASS_1A_ID,
      } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Chặn AI sinh đề khi giáo viên đã dùng hết hạn ngạch gọi AI trong ngày (HTTP 429)', async () => {
    ctx.mockDataConnect.checkDailyAiQuota.mockResolvedValueOnce(false);
    await expect(
      ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
        title: 'Sinh đề vượt hạn mức', subject_code: 'MATH', class_id: CLASS_1A_ID,
      } as any),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ error_code: 'QUIZ_DAILY_QUOTA_EXCEEDED' }),
    });
  });

  it('Hang xử lý file: kích thước quá lớn (> 15MB) và định dạng .xlsx đều bị từ chối', async () => {
    await expect(
      ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
        title: 'Giáo án quá tải', subject_code: 'MATH', class_id: CLASS_1A_ID,
        file_size_bytes: 16 * 1024 * 1024,
      } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
        title: 'Bảng tính .xlsx', subject_code: 'MATH', class_id: CLASS_1A_ID,
        file_name: 'lesson.xlsx',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('Số lượng câu hỏi không hợp lệ bị từ chối', async () => {
    await expect(
      ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
        title: 'Nhập "nam_cau" chuỗi', subject_code: 'MATH', class_id: CLASS_1A_ID,
        num_questions: 'nam_cau' as any,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('AI bận → lỗi hệ thống tách rõ, không emitting hoạt động thành công ảo', async () => {
    ctx.mockNvidia.generateQuestionsFromLesson.mockRejectedValueOnce(new Error('NVIDIA_INTERNAL'));
    ctx.activities.length = 0;
    await expect(
      ctx.service.generateQuizFromAi(GVBM_ID, undefined, {
        title: 'Lỗi hệ thống', subject_code: 'MATH', class_id: CLASS_1A_ID,
      } as any),
    ).rejects.toThrow();
    expect(ctx.activities.every((a) => a.status === 'WARNING')).toBe(true);
  });
});
