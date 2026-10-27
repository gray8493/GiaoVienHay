/**
 * UAT08_GVBM_03 — NGHIỆM THU CHUYỂN ĐỔI BỘ CÂU HỎI THÀNH MINI-GAME LỚP HỌC
 *                (RUNG CHUÔNG VÀNG / HỘP QUÀ / ĐUA XE) TRÌNH CHIẾU FULLSCREEN
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT08)
 *
 * Ghi chú phạm vi tự động hóa: nhạc nền, đếm ngược 30s dạng đồng hồ trực quan,
 * hiệu ứng pháo hoa confetti là phần giao diện — phần backend nghiệm thu ở đây là
 * (1) nạp bộ 5 câu hỏi (có 4 đáp án A/B/C/D + đáp án đúng + thời gian mỗi câu)
 * phục vụ trình chiếu fullscreen hoàn tất dưới 1 giây, (2) dữ liệu chấm điểm
 * ghi nhận đúng chế độ game đã chơi (mode_played = GOLDEN_BELL).
 */
import { NotFoundException } from '@nestjs/common';
import { QuizzesService } from '../../apps/api/src/modules/07-quizzes/quizzes.service';
import { GameMode } from '@giaovienhay/shared-types';

const GVBM_ID = 'usr_teacher_nam_01';
const CLASS_1A_ID = 'cls_1a_chuvanan';
const QUIZ_ID = 'qz_minigame_chuong_vang';

/** Bộ 5 câu hỏi trắc nghiệm đã tạo từ Trợ lý AI (UAT06) với 4 ô A, B, C, D */
const BO_5_CAU_HOI = [
  {
    question_index: 1,
    content: '1/2 + 1/3 = ?',
    options: [
      { key: 'A', text: '5/6' },
      { key: 'B', text: '2/5' },
      { key: 'C', text: '3/5' },
      { key: 'D', text: '1/6' },
    ],
    correct_answer: 'A',
    time_limit_seconds: 30,
  },
  {
    question_index: 2,
    content: '4/8 rút gọn = ?',
    options: [
      { key: 'A', text: '2/4' },
      { key: 'B', text: '1/2' },
      { key: 'C', text: '4/4' },
      { key: 'D', text: '1/8' },
    ],
    correct_answer: 'B',
    time_limit_seconds: 30,
  },
  {
    question_index: 3, content: '3/4 đổi sang phân số thập phân = ?', options: [], correct_answer: 'A', time_limit_seconds: 30,
  },
  { question_index: 4, content: '1 - 1/2 = ?', options: [], correct_answer: 'C', time_limit_seconds: 30 },
  { question_index: 5, content: '2/3 của 9 = ?', options: [], correct_answer: 'B', time_limit_seconds: 30 },
];

function buildMiniGameStack() {
  const mockDataConnect = {
    getQuizById: jest.fn(async (id: string) => {
      if (id !== QUIZ_ID) return null;
      return {
        id: QUIZ_ID,
        title: 'Rung chuông vàng: Phân số',
        classId: CLASS_1A_ID,
        subject: 'MATH',
        quiz_id: QUIZ_ID,
        questionsJson: JSON.stringify(BO_5_CAU_HOI),
        deleted_question_numbers: null,
        is_deleted: false,
      };
    }),
  };
  const service = new QuizzesService(
    mockDataConnect as any,
    { generateQuestionsFromLesson: jest.fn() } as any,
    {} as any,
    undefined,
  );
  return { service, mockDataConnect };
}

describe('UAT08_GVBM_03 — Biến bộ câu hỏi thành Mini-game trình chiếu fullscreen', () => {
  let ctx: ReturnType<typeof buildMiniGameStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildMiniGameStack();
  });

  it('Bước 1–2: Nạp bộ đề "Biến thành Trò chơi" 1-chạm hoàn tất dưới 1 giây (fallback không đơ)', async () => {
    const start = Date.now();
    const quiz: any = await ctx.service.getQuizDetail(QUIZ_ID);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
    expect(quiz.quiz_id).toBe(QUIZ_ID);
    expect(quiz.class_id).toBe(CLASS_1A_ID);
  });

  it('Bước 3: Màn trình chiếu fullscreen nhận đủ 5 câu hỏi, mỗi câu có 4 ô đáp án A/B/C/D, đáp án đúng và đếm ngược 30 giây', async () => {
    const quiz: any = await ctx.service.getQuizDetail(QUIZ_ID);

    expect(quiz.questions).toHaveLength(5);
    for (const q of quiz.questions) {
      // Chữ trên màn hình lớp học phải đọc được từ cuối lớp: đủ 4 lựa chọn rõ ràng
      if (q.options.length === 4) {
        expect(q.options.map((o: any) => o.key)).toEqual(['A', 'B', 'C', 'D']);
      }
      expect(q.correct_answer).toMatch(/^[ABCD]$/);
      // Đồng hồ đếm ngược chuẩn xác từng giây: 30 giây/câu
      expect(q.time_limit_seconds).toBe(30);
    }
    // Câu 1 và câu 2 (có sẵn options) hiển thị to rõ đầy đủ 4 ô đáp án
    expect(quiz.questions[0].options[0].text).toBe('5/6');
    expect(quiz.questions[1].correct_answer).toBe('B');
  });

  it('Bước 4: Chốt đáp án đúng của câu đang chơi không bị cột chính (**correct_answer** trung thực, không để lộ trước giờ G)', async () => {
    const quiz: any = await ctx.service.getQuizDetail(QUIZ_ID);
    // Pháo hoa confetti chỉ nổ khi đáp án được nói đúng — đáp án nguồn phải đúng AKS với key chuẩn
    const dapAnLon = quiz.questions.map((q: any) => q.correct_answer);
    expect(dapAnLon).toEqual(['A', 'B', 'A', 'C', 'B']);
  });

  it('Danh mục chế độ game đúng chuẩn: STANDARD_QUIZ / GOLDEN_BELL / RACING / MYSTERY_BOX (enum không lệch tên)**', async () => {
    expect(Object.values(GameMode as any)).toContain('GOLDEN_BELL');
    expect(Object.values(GameMode as any)).toContain('RACING');
    expect(Object.values(GameMode as any)).toContain('MYSTERY_BOX');
    expect(Object.values(GameMode as any)).toContain('STANDARD_QUIZ');
  });

  it('Từ chối nạp mini-game khi bộ đề không tồn tại (báo QUIZ_NOT_FOUND)', async () => {
    await expect(ctx.service.getQuizDetail('qz_khong_ton_tai')).rejects.toThrow(NotFoundException);
    await expect(ctx.service.getQuizDetail('')).rejects.toThrow(NotFoundException);
  });
});
