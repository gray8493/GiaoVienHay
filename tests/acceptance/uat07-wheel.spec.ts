/**
 * UAT07_GVBM_02 — NGHIỆM THU VÒNG QUAY MAY MẮN (LỌC HS CÓ MẶT TỪ CACHE), NÚT SKIP
 *                VÀ CHẤM ĐIỂM MIỆNG ĐỒNG BỘ THẲNG VÀO SỔ ĐIỂM
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT07)
 *
 * Ghi chú phạm vi tự động hóa: đồ họa 3D nan quạt là phần giao diện — phần backend
 * nghiệm thu ở đây là (1) danh sách ứng viên lọc đúng theo chuyên cần, (2) chính
 * sách Skip/AUTO_SPIN_NEXT, (3) chấm điểm miệng đồng bộ thẳng bảng scores (ORAL_TEST).
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuizzesService } from '../../apps/api/src/modules/07-quizzes/quizzes.service';
import { AttendanceService } from '../../apps/api/src/modules/05-attendance/attendance.service';
import { AttendanceStatus } from '@giaovienhay/shared-types';

const GVBM_ID = 'usr_teacher_nam_01';
const GVCN_ID = 'usr_teacher_lan_01';
const CLASS_1A_ID = 'cls_1a_chuvanan';
const QUIZ_ID = 'qz_lucky_wheel_baicu';
const HOM_NAY = new Date().toISOString().slice(0, 10);

/** Toàn bộ học sinh Lớp 1A — 2 em vắng (Trần Bảo Nam, Nguyễn Hoàng My) phải bị loại khỏi vòng quay */
const HS_LOP_1A = [
  { id: 'std_khoi', full_name: 'Lê Minh Khôi', student_code: 'HS001' },
  { id: 'std_my', full_name: 'Nguyễn Hoàng My', student_code: 'HS002' },      // vắng có phép
  { id: 'std_baonam', full_name: 'Trần Bảo Nam', student_code: 'HS003' },     // vắng không phép
  { id: 'std_quynhanh', full_name: 'Phạm Quỳnh Anh', student_code: 'HS004' },
  { id: 'std_vanan', full_name: 'Nguyễn Văn An', student_code: 'HS005' },
];

function buildWheelStack() {
  const cacheStore = new Map<string, any>();
  const mockCache = {
    get: jest.fn(async (k: string) => cacheStore.get(k)),
    set: jest.fn(async (k: string, v: any, _ttl?: number) => cacheStore.set(k, v)),
    del: jest.fn(async (k: string) => cacheStore.delete(k)),
  };
  const mockEvents = { emit: jest.fn() };
  const mockNotifications = {
    dispatchNotification: jest.fn(async () => ({ sent: 1, failed: 0, parentUserIds: [] })),
    dispatchToParentsOfStudent: jest.fn(async () => ({ sent: 1, failed: 0, parentUserIds: [] })),
    dispatchToParentsOfClass: jest.fn(async () => ({ sent: 1, failed: 0, students: 1 })),
  };
  const attendanceRecords: any[] = [];
  const scoresDb: any[] = [];

  const mockDataConnect = {
    getClassById: jest.fn(async (id: string) =>
      id === CLASS_1A_ID ? { id, name: 'Lớp 1A', homeroom_teacher_id: GVCN_ID, is_deleted: false } : null,
    ),
    listStudentsByClass: jest.fn(async () => HS_LOP_1A),
    getAttendanceByClassDate: jest.fn(async (classId: string, date: string) =>
      attendanceRecords.filter((r) => r.class_id === classId && r.date === date),
    ),
    recordAttendance: jest.fn(async (rec: any) => attendanceRecords.push(rec)),
    getQuizById: jest.fn(async (id: string) =>
      id === QUIZ_ID
        ? {
            id: QUIZ_ID, title: 'Kiểm tra bài cũ: Phân số', subject: 'MATH', classId: CLASS_1A_ID,
            questionsJson: JSON.stringify([
              { question_index: 1, content: '1/2 + 1/3 = ?', correct_answer: 'A' },
              { question_index: 2, content: '4/8 rút gọn = ?', correct_answer: 'B' },
            ]),
          }
        : null,
    ),
    recordScore: jest.fn(async (score: any) => scoresDb.push(score)),
    getStudentById: jest.fn(async (id: string) => HS_LOP_1A.find((s) => s.id === id) || null),
    checkDailyAiQuota: jest.fn(async () => true),
    syncAiUsageToday: jest.fn(async () => true),
  };

  const attendanceService = new AttendanceService(
    mockDataConnect as any, mockCache as any, mockEvents as any, mockNotifications as any,
  );
  const quizzesService = new QuizzesService(
    mockDataConnect as any, { generateQuestionsFromLesson: jest.fn() } as any, attendanceService, undefined,
  );

  return { attendanceService, quizzesService, mockDataConnect, mockCache, scoresDb, attendanceRecords };
}

/** Lưu điểm danh đầu giờ: Em My vắng có phép, em Bảo Nam vắng không phép */
async function diemDanhDauGio(ctx: ReturnType<typeof buildWheelStack>) {
  await ctx.attendanceService.submitAttendance(GVCN_ID, {
    class_id: CLASS_1A_ID,
    attendance_date: HOM_NAY,
    period: 1,
    records: HS_LOP_1A.map((s) => ({
      student_id: s.id,
      status:
        s.id === 'std_my' ? AttendanceStatus.ABSENT_EXCUSED
        : s.id === 'std_baonam' ? AttendanceStatus.ABSENT_UNEXCUSED
        : AttendanceStatus.PRESENT,
    })),
  } as any);
}

describe('UAT07_GVBM_02 — Vòng quay may mắn & chấm điểm miệng trực tiếp', () => {
  let ctx: ReturnType<typeof buildWheelStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildWheelStack();
  });

  it('Bước 1: Vòng quay chỉ nạp học sinh CÓ MẶT hôm nay — loại trừ hết HS vắng (lọc từ cache chuyên cần)', async () => {
    await diemDanhDauGio(ctx);
    const candidates: any = await ctx.quizzesService.getWheelCandidates(QUIZ_ID);

    expect(candidates.quiz_id).toBe(QUIZ_ID);
    expect(candidates.class_id).toBe(CLASS_1A_ID);
    expect(candidates.total_candidates).toBe(3);
    expect(candidates.students.map((s: any) => s.name).sort()).toEqual(
      ['Lê Minh Khôi', 'Nguyễn Văn An', 'Phạm Quỳnh Anh'].sort(),
    );
    // Trần Bảo Nam & Nguyễn Hoàng My vắng sáng nay KHÔNG xuất hiện trên vòng quay
    const names = candidates.students.map((s: any) => s.name);
    expect(names).not.toContain('Trần Bảo Nam');
    expect(names).not.toContain('Nguyễn Hoàng My');
  });

  it('Bước 3: Chính sách nút Bỏ qua (Skip) — quay tiếp ngay lượt mới (AUTO_SPIN_NEXT), không treo', async () => {
    await diemDanhDauGio(ctx);
    const candidates: any = await ctx.quizzesService.getWheelCandidates(QUIZ_ID);
    expect(candidates.skip_policy).toBe('AUTO_SPIN_NEXT');
    // Lượt quay kế tiếp lấy lại danh sách ứng viên tức thì (không đợiack trên thiết bị)
    const start = Date.now();
    const next: any = await ctx.quizzesService.getWheelCandidates(QUIZ_ID);
    expect(Date.now() - start).toBeLessThan(2000);
    expect(next.total_candidates).toBe(candidates.total_candidates);
  });

  it('Bước 4–5: Học sinh trả lời xuất sắc (điểm 10.0) — chấm điểm miệng lần đầu đồng bộ thẳng bảng scores', async () => {
    await diemDanhDauGio(ctx);
    const res: any = await ctx.quizzesService.recordInClassScore(GVBM_ID, QUIZ_ID, {
      student_id: 'std_quynhanh',
      score: 10.0,
      sync_to_scores_table: true,
    } as any);

    expect(res.student_id).toBe('std_quynhanh');
    expect(res.score).toBe(10);
    expect(res.synced_to_scores).toBe(true);
    expect(res.saved_to_gradebook).toBe(true);

    // Điểm miệng được lưu vào CSDL với đúng cột ORAL_TEST — không ghi chép thủ công
    expect(ctx.mockDataConnect.recordScore).toHaveBeenCalledTimes(1);
    const savedScore = ctx.mockDataConnect.recordScore.mock.calls[0][0];
    expect(savedScore.scoreType).toBe('ORAL_TEST');
    expect(savedScore.scoreValue).toBe(10);
    expect(savedScore.classId).toBe(CLASS_1A_ID);
    expect(savedScore.subject).toBe('MATH');
  });

  it('Bước 5b: Chấm trùng học sinh đãcó điểm → không ghi đè, báo already_saved (bảo vệ tính công bằng)', async () => {
    await diemDanhDauGio(ctx);
    // Lần 1 chấm 10 điểm
    await ctx.quizzesService.recordInClassScore(GVBM_ID, QUIZ_ID, {
      student_id: 'std_quynhanh', score: 10,
    } as any);
    // Lần 2 quét sẽ nhận diện đã lưu rồi
    ctx.mockDataConnect.getScoreByQuizAndStudent = jest.fn(async () => ({
      scoreValue: 10,
    }));
    const res: any = await ctx.quizzesService.recordInClassScore(GVBM_ID, QUIZ_ID, {
      student_id: 'std_quynhanh', score: 10,
    } as any);
    expect(res.already_saved).toBe(true);
    // Không gọi recordScore lần nữa
    expect(ctx.mockDataConnect.recordScore).toHaveBeenCalledTimes(1);
  });

  it('Từ chối chấm điểm ngoài thang [0, 10] (báo đỏ kicks)', async () => {
    await diemDanhDauGio(ctx);
    await expect(
      ctx.quizzesService.recordInClassScore(GVBM_ID, QUIZ_ID, {
        student_id: 'std_quynhanh', score: 10.5,
      } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      ctx.quizzesService.recordInClassScore(GVBM_ID, QUIZ_ID, {
        student_id: 'std_quynhanh', score: -1,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('Từ chối chấm điểm cho học sinh không nằm trong danh sách lớp', async () => {
    await diemDanhDauGio(ctx);
    await expect(
      ctx.quizzesService.recordInClassScore(GVBM_ID, QUIZ_ID, {
        student_id: 'std_la', score: 8,
      } as any),
    ).rejects.toThrow(NotFoundException);
  });
});
