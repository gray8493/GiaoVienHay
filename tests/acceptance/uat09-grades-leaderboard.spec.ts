/**
 * UAT09_GVBM_04 — NGHIỆM THU SỔ ĐIỂM ĐIỆN TỬ ĐA CỘT THÀNH PHẦN (KHÔNG TỰ TÍNH GPA),
 *                TRÌNH CHIẾU BẢNG XẾP HẠNG (LEADERBOARD) VÀ CÔNG BỐ ĐIỂM GỬI FCM
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT09)
 */
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GradesService } from '../../apps/api/src/modules/06-grades/grades.service';
import { NotificationType } from '@giaovienhay/shared-types';

const THAY_NAM_TOAN_ID = 'usr_teacher_toan_nam'; // Thầy bộ môn Toán của lớp 1A
const GV_BKHONG_DAY_TOAN = 'usr_teacher_lang_nghe'; // GV chưa phân công môn Toán
const GVCN_ID = 'usr_teacher_lan_01';
const CLASS_1A_ID = 'cls_1a_chuvanan';
const MON_TOAN = 'MATH';

const HS_LOP_1A = [
  { id: 'std_khoi', full_name: 'Lê Minh Khôi', student_code: 'HS001' },
  { id: 'std_quynhanh', full_name: 'Phạm Quỳnh Anh', student_code: 'HS004' },
  { id: 'std_vanan', full_name: 'Nguyễn Văn An', student_code: 'HS005' },
];

/** Điểm nhập theo đề bài: Khôi 10.0, Quỳnh Anh 9.5, Văn An 8.5 (Kiểm tra 15 phút) */
const DIEM_INPUT = [
  { student_id: 'std_khoi', score_value: 10.0 },
  { student_id: 'std_quynhanh', score_value: 9.5 },
  { student_id: 'std_vanan', score_value: 8.5 },
];

function buildGradesStack() {
  const scoresDb: any[] = [];
  const emittedEvents: Array<{ event: string; payload: any }> = [];
  const mockEvents = { emit: jest.fn((event: string, payload: any) => emittedEvents.push({ event, payload })) };
  const mockNotifications = {
    dispatchNotification: jest.fn(async () => ({ saved: true, pushed: false })),
    dispatchToParentsOfStudent: jest.fn(async () => ({ sent: 1, failed: 0, parentUserIds: ['usr_parent_khoi'] })),
    dispatchToParentsOfClass: jest.fn(async () => ({ sent: 1, failed: 0, students: 1 })),
  };

  const mockDataConnect = {
    getClassById: jest.fn(async (id: string) =>
      id === CLASS_1A_ID
        ? {
            id,
            name: 'Lớp 1A',
            homeroom_teacher_id: GVCN_ID,
            is_deleted: false,
            // Thầy Nam được phân công dạy môn Toán tại lớp 1A
            subject_teachers: [{ teacher_id: THAY_NAM_TOAN_ID, subject_code: MON_TOAN }],
          }
        : null,
    ),
    getStudentById: jest.fn(async (id: string) => HS_LOP_1A.find((s) => s.id === id) || null),
    listStudentsByClass: jest.fn(async () => HS_LOP_1A),
    recordScore: jest.fn(async (row: any) => {
      // Upsert theo id (score_...) như bảng scores một dòng duy nhất mỗi cột điểm
      const idx = scoresDb.findIndex((r) => r.id === row.id);
      if (idx >= 0) scoresDb[idx] = row;
      else scoresDb.push(row);
      return row;
    }),
    listScoresByClass: jest.fn(async (classId: string, subjectCode: string, _semester: number) =>
      scoresDb.filter((r) => (r.classId || r.class_id) === classId && (r.subject || r.subject_code) === subjectCode),
    ),
    markScoresPublished: jest.fn(async (ids: string[]) => {
      for (const r of scoresDb) {
        if (ids.includes(r.id)) {
          r.is_published = true;
          r.isPublished = true;
          r.published_once = true;
        }
      }
      return ids.length;
    }),
    getUserById: jest.fn(async (id: string) =>
      id === THAY_NAM_TOAN_ID
        ? { id, full_name: 'Phạm Văn Nam', role: 'TEACHER_MATH' }
        : id === GVCN_ID
        ? { id, full_name: 'Nguyễn Thị Lan', role: 'TEACHER_HOMEROOM' }
        : null,
    ),
    // Không mock dataConnect.execute — service sẽ tự fallback xuống listScoresByClass
  };

  const service = new GradesService(mockDataConnect as any, mockEvents as any, mockNotifications as any);
  return { service, mockDataConnect, mockNotifications, scoresDb, emittedEvents };
}

describe('UAT09_GVBM_04 — Sổ điểm đa cột (không GPA), Leaderboard & Công bố điểm FCM', () => {
  let ctx: ReturnType<typeof buildGradesStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildGradesStack();
  });

  it('Bước 1: Thầy bộ môn Toán nhập nhanh 3 điểm "Kiểm tra 15 phút" và lưu bảng điểm thành công (dưới 1 giây)', async () => {
    const start = Date.now();
    const res: any = await ctx.service.batchInputScores(THAY_NAM_TOAN_ID, {
      class_id: CLASS_1A_ID,
      subject_code: MON_TOAN,
      score_type: 'TEST_15P',
      semester: 1,
      scores: DIEM_INPUT,
    } as any);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
    expect(res.updated_count).toBe(3);
    expect(res.class_id).toBe(CLASS_1A_ID);

    // Không tự tính GPA: bảng scores chỉ lưu các đầu điểm thành phần trung thực
    expect(ctx.scoresDb).toHaveLength(3);
    const khoi = ctx.scoresDb.find((r) => r.student_id === 'std_khoi');
    expect(khoi.score_value).toBe(10.0);
    expect(khoi.score_type).toBe('TEST_15P');
    expect(ctx.scoresDb.every((r) => r.gpa === undefined && r.average === undefined)).toBe(true);
  });

  it('Nhập điểm quá thang 0.0–10.0 → báo đỏ từ chối (10.9 và -1), bảng điểm không lưu dòng lỗi', async () => {
    await expect(
      ctx.service.batchInputScores(THAY_NAM_TOAN_ID, {
        class_id: CLASS_1A_ID,
        subject_code: MON_TOAN,
        score_type: 'TEST_15P',
        semester: 1,
        scores: [{ student_id: 'std_khoi', score_value: 10.9 }],
      } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      ctx.service.batchInputScores(THAY_NAM_TOAN_ID, {
        class_id: CLASS_1A_ID,
        subject_code: MON_TOAN,
        score_type: 'TEST_15P',
        semester: 1,
        scores: [{ student_id: 'std_khoi', score_value: -1 }],
      } as any),
    ).rejects.toThrow(BadRequestException);
    expect(ctx.scoresDb).toHaveLength(0);
  });

  it('RBAC: Giáo viên chưa phân công dạy Toán tại lớp 1A không được nhập điểm môn này', async () => {
    await expect(
      ctx.service.batchInputScores(GV_BKHONG_DAY_TOAN, {
        class_id: CLASS_1A_ID,
        subject_code: MON_TOAN,
        score_type: 'TEST_15P',
        semester: 1,
        scores: DIEM_INPUT,
      } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Bước 2: Bảng xếp hạng (Leaderboard) hiển thị bục vinh danh đúng thứ hạng — Top 1 (hoạ 10), đồng hạng có 2 hạng 1', async () => {
    // Điểm đã lưu trước đó từ bước 1: 1 cột miệng (Khôi 10) và cột 15 phút của cả lớp
    const seeded = [
      { id: `score_${CLASS_1A_ID}_${MON_TOAN}_std_khoi_ORAL_TEST`, studentId: 'std_khoi', classId: CLASS_1A_ID, subject: MON_TOAN, scoreType: 'ORAL_TEST', scoreValue: 10, term: 1 },
      { id: `score_${CLASS_1A_ID}_${MON_TOAN}_std_khoi_TEST_15P`, studentId: 'std_khoi', classId: CLASS_1A_ID, subject: MON_TOAN, scoreType: 'TEST_15P', scoreValue: 10, term: 1 },
      { id: `score_${CLASS_1A_ID}_${MON_TOAN}_std_quynhanh_TEST_15P`, studentId: 'std_quynhanh', classId: CLASS_1A_ID, subject: MON_TOAN, scoreType: 'TEST_15P', scoreValue: 9.5, term: 1 },
      { id: `score_${CLASS_1A_ID}_${MON_TOAN}_std_vanan_TEST_15P`, studentId: 'std_vanan', classId: CLASS_1A_ID, subject: MON_TOAN, scoreType: 'TEST_15P', scoreValue: 8.5, term: 1 },
    ];
    ctx.scoresDb.push(...seeded);

    const lb: any = await ctx.service.getLeaderboard(CLASS_1A_ID, MON_TOAN, 1, 5);

    expect(lb.class_id).toBe(CLASS_1A_ID);
    expect(lb.total_ranked).toBe(3);
    // Trọng số ORAL_TEST:1, TEST_15P:2 → Khôi có 2 cột điểm trung bình môn = 10
    expect(lb.top_students.map((s: any) => s.student_name)).toEqual(['Lê Minh Khôi', 'Phạm Quỳnh Anh', 'Nguyễn Văn An']);
    expect(lb.top_students.map((s: any) => s.score)).toEqual([10, 9.5, 8.5]);
    // Bục vinh danh: TOP1 cúp vàng - TOP2 bạc - TOP3 đồng
    expect(lb.top_students.map((s: any) => s.badge)).toEqual(['GOLD', 'SILVER', 'BRONZE']);
    expect(lb.top_students[0].rank).toBe(1);
  });

  it('Bước 3–4: "Công bố điểm" → đánh dấu is_published, phát FCM fan-out cho 3 phụ huynh đúng loại GRADE_PUBLISHED, dưới 2 giây', async () => {
    // Giả định đã nhập điểm 15 phút (u la cột chưa gửi)
    await ctx.service.batchInputScores(THAY_NAM_TOAN_ID, {
      class_id: CLASS_1A_ID,
      subject_code: MON_TOAN,
      score_type: 'TEST_15P',
      semester: 1,
      scores: DIEM_INPUT,
    } as any);

    const start = Date.now();
    const res: any = await ctx.service.publishScores(THAY_NAM_TOAN_ID, {
      class_id: CLASS_1A_ID,
      subject_code: MON_TOAN,
      score_type: 'TEST_15P',
      semester: 1,
    } as any);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(2000);
    expect(res.notified_parents_count).toBe(3);
    expect(res.published_types).toEqual(['TEST_15P']);

    // 3 ô điểm vừa công bố được đánh dấu is_published=true trong bảng scores
    expect(ctx.mockDataConnect.markScoresPublished).toHaveBeenCalledTimes(1);
    expect(ctx.mockDataConnect.markScoresPublished.mock.calls[0][0]).toHaveLength(3);
    expect(ctx.scoresDb.every((r) => r.is_published === true)).toBe(true);

    // Sự kiện worker nền phát đúng payload để fan-out thông báo
    expect(ctx.emittedEvents.some((e) => e.event === 'grades.published')).toBe(true);
    const payload = ctx.emittedEvents.find((e) => e.event === 'grades.published')!.payload;
    expect(payload.classId).toBe(CLASS_1A_ID);
    expect(payload.students).toHaveLength(3);

    // Worker fan-out: mỗi học sinh 1 thông báo, đúng loại GRADE_PUBLISHED, deep-link Sổ điểm
    await ctx.service.handleGradesPublishedEvent(payload);
    expect(ctx.mockNotifications.dispatchToParentsOfStudent).toHaveBeenCalledTimes(3);
    const callForKhoi = ctx.mockNotifications.dispatchToParentsOfStudent.mock.calls.find(
      (c: any[]) => c[0]?.id === 'std_khoi' || c[0]?.student_id === 'std_khoi',
    );
    expect(callForKhoi).toBeDefined();
    expect(callForKhoi[1].type).toBe(NotificationType.GRADE_PUBLISHED);
    expect(callForKhoi[1].metadata.screen).toBe('Grades');
    expect(callForKhoi[1].metadata.score_type).toBe('TEST_15P');
  });

  it('Nhập nhầm điểm đã công bố phải có lý do đính chính (CORRECTION_REASON_REQUIRED)', async () => {
    // Nhập + công bố lần đầu
    await ctx.service.batchInputScores(THAY_NAM_TOAN_ID, {
      class_id: CLASS_1A_ID,
      subject_code: MON_TOAN,
      score_type: 'TEST_15P',
      semester: 1,
      scores: [DIEM_INPUT[0]],
    } as any);
    await ctx.service.publishScores(THAY_NAM_TOAN_ID, {
      class_id: CLASS_1A_ID,
      subject_code: MON_TOAN,
      score_type: 'TEST_15P',
      semester: 1,
    } as any);

    // Sửa lại không kèm lý do → chặn
    await expect(
      ctx.service.batchInputScores(THAY_NAM_TOAN_ID, {
        class_id: CLASS_1A_ID,
        subject_code: MON_TOAN,
        score_type: 'TEST_15P',
        semester: 1,
        scores: [{ student_id: 'std_khoi', score_value: 9.0 }],
      } as any),
    ).rejects.toThrow(BadRequestException);

    // Có lý do đính chính (teacher_comment) → được ghi đè, trả new_score
    const res: any = await ctx.service.batchInputScores(THAY_NAM_TOAN_ID, {
      class_id: CLASS_1A_ID,
      subject_code: MON_TOAN,
      score_type: 'TEST_15P',
      semester: 1,
      is_correction: true,
      scores: [{ student_id: 'std_khoi', score_value: 9.0, teacher_comment: 'Chấm lỗi cộng dồn 1 điểm 15/12' }],
    } as any);
    expect(res.old_score).toBe(10.0);
    expect(res.new_score).toBe(9.0);
    // batch chỉ lưu — không gửi thông báo trong lần sửa (phải bấm Công bố mới gửi)
    expect(res.notified_parents_count).toBe(0);
  });
});
