/**
 * UAT10_GVBM_05 — NGHIỆM THU TẠO LỜI NHẮC LỊCH KIỂM TRA ĐỊNH KỲ PHÁT THÔNG BÁO ĐẨY
 *                BROADCAST TỚI TOÀN THỂ PHỤ HUYNH
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT10)
 */
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExamRemindersService } from '../../apps/api/src/modules/09-exam-reminders/exam-reminders.service';
import { CreateExamReminderDto } from '../../apps/api/src/modules/09-exam-reminders/dto/exam-reminders.dto';
import { NotificationType } from '@giaovienhay/shared-types';

const THAY_NAM_ANH_ID = 'usr_teacher_nam_01'; // Thầy bộ môn Tiếng Anh của lớp 1A
const CO_LAN_GVCN_ID = 'usr_teacher_lan_01';  // Cô Nguyễn Thị Lan — GVCN lớp 1A (không dạy Tiếng Anh)
const CLASS_1A_ID = 'cls_1a_chuvanan';
const NGAY_KIEM_TRA = '2026-10-28';
const LOI_DAN_DO =
  'Thứ Tư ngày 28/10 lớp có bài kiểm tra định kỳ Tiếng Anh. Bố mẹ nhắc con ôn kỹ từ vựng Unit 1, 2 và chuẩn bị bút chì.';

const HS_LOP_1A = [
  { id: 'std_khoi', full_name: 'Lê Minh Khôi' },
  { id: 'std_my', full_name: 'Nguyễn Hoàng My' },
  { id: 'std_baonam', full_name: 'Trần Bảo Nam' },
  { id: 'std_quynhanh', full_name: 'Phạm Quỳnh Anh' },
  { id: 'std_vanan', full_name: 'Nguyễn Văn An' },
];

function buildExamReminderStack() {
  const remindersDb: any[] = [];
  const sentNotifications: any[] = [];

  const mockDataConnect = {
    getClassById: jest.fn(async (id: string) =>
      id === CLASS_1A_ID
        ? {
            id,
            name: 'Lớp 1A',
            homeroom_teacher_id: CO_LAN_GVCN_ID,
            is_deleted: false,
            // Môn Tiếng Anh thuộc công việc của thầy Nam; Toán là môn của cô Lan (GVCN)
            subject_teachers: [
              { teacher_id: CO_LAN_GVCN_ID, subject_code: 'MATH' },
              { teacher_id: THAY_NAM_ANH_ID, subject_code: 'ENG' },
            ],
          }
        : null,
    ),
    listStudentsByClass: jest.fn(async () => HS_LOP_1A),
    createExamReminder: jest.fn(async (rec: any) => remindersDb.push(rec)),
    getUserById: jest.fn(async (id: string) => ({ id, full_name: 'Phạm Văn Nam', role: 'TEACHER_ENG' })),
  };

  const mockNotifications = {
    dispatchNotification: jest.fn(async (payload: any) => {
      sentNotifications.push(payload);
      return { saved: true, pushed: false };
    }),
    // Fan-out thật (logic của NotificationsService): mỗi HS ≥ 1 phụ huynh nhận 1 hộp thư
    dispatchToParentsOfStudent: jest.fn(async (student: any, payload: any) => ({
      sent: 1,
      failed: 0,
      parentUserIds: [`usr_parent_of_${student.id}`],
    })),
    dispatchToParentsOfClass: jest.fn(async (classId: string, build: any) => {
      const students = await mockDataConnect.listStudentsByClass(classId);
      let sent = 0;
      for (const stu of students) {
        const payload = build(stu);
        if (!payload) continue;
        for (const _ph of [1]) {
          sentNotifications.push({ ...payload, metadata: { ...payload.metadata, student_id: stu.id } });
          sent++;
        }
      }
      return { sent, failed: 0, students: students.length };
    }),
  };

  const service = new ExamRemindersService(mockDataConnect as any, mockNotifications as any);
  return { service, mockDataConnect, remindersDb, sentNotifications };
}

const DTO_HOP_LE: CreateExamReminderDto = {
  class_id: CLASS_1A_ID,
  subject_code: 'ENG',
  exam_type: 'TEST_1P' as any,
  exam_date: NGAY_KIEM_TRA,
  message: LOI_DAN_DO,
};

describe('UAT10_GVBM_05 — Tạo lời nhắc lịch kiểm tra broadcast tới toàn thể phụ huynh', () => {
  let ctx: ReturnType<typeof buildExamReminderStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildExamReminderStack();
  });

  it('Bước 1–3: Thầy bộ môn Tiếng Anh tạo lời nhắc kiểm tra 1 tiết lưu bảng exam_reminders + fan-out 5 hộp thư phụ huynh dưới 3 giây', async () => {
    const start = Date.now();
    const res: any = await ctx.service.createReminder(THAY_NAM_ANH_ID, DTO_HOP_LE, { assignedSubjects: ['ENG'] });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(3000);
    expect(res.reminder_id).toBeTruthy();
    expect(res.class_id).toBe(CLASS_1A_ID);
    expect(res.notified_parents).toBe(5);

    // Lưu trữ dữ liệu chuẩn: bản ghi đầy đủ môn, ngày thi và lời dặn dò trong bảng exam_reminders
    expect(ctx.remindersDb).toHaveLength(1);
    const record = ctx.remindersDb[0];
    expect(record.subject_code).toBe('ENG');
    expect(record.exam_type).toBe('TEST_1P');
    expect(record.exam_date).toBe(NGAY_KIEM_TRA);
    expect(record.message).toBe(LOI_DAN_DO);
    expect(record.created_by).toBe(THAY_NAM_ANH_ID);
    expect(record.is_deleted).toBe(false);
  });

  it('Bước 4: Broadcast FCM đồng loạt — 5 phụ huynh nhận đúng loại EXAM_REMINDER, tiêu đề môn + lời dặn dò trọn vẹn', async () => {
    await ctx.service.createReminder(THAY_NAM_ANH_ID, DTO_HOP_LE, { assignedSubjects: ['ENG'] });

    expect(ctx.sentNotifications).toHaveLength(5);
    expect(ctx.sentNotifications.every((n) => n.type === NotificationType.EXAM_REMINDER)).toBe(true);
    // Nội dung rõ ràng: tiêu đề môn thi + ngày + lời dặn đôn đốc con học bài
    const baoNam = ctx.sentNotifications.find((n) => n.metadata.student_id === 'std_baonam');
    expect(baoNam).toBeDefined();
    expect(baoNam.metadata.exam_date).toBe(NGAY_KIEM_TRA);
    expect(baoNam.title).toContain('Tiếng Anh');
    expect(baoNam.body).toContain('Trần Bảo Nam');
    expect(baoNam.body).toContain('Unit 1, 2');
    expect(baoNam.metadata.screen).toBe('ExamReminders');
    // Deep-link metadata đầy đủ để phụ huynh chạm vào là mở chi tiết trọn vẹn
    expect(baoNam.metadata.reminder_id).toBe(ctx.remindersDb[0].id);
  });

  it('Từ chối ngày kiểm tra đã trôi qua trong quá khứ (báo EXAM_DATE_INVALID)', async () => {
    await expect(
      ctx.service.createReminder(THAY_NAM_ANH_ID, { ...DTO_HOP_LE, exam_date: '2026-09-01' } as any, {
        assignedSubjects: ['ENG'],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(ctx.mockDataConnect.createExamReminder).not.toHaveBeenCalled();
  });

  it('Từ chối loại bài kiểm tra ngoài danh mục chuẩn (báo EXAM_TYPE_INVALID)', async () => {
    await expect(
      ctx.service.createReminder(THAY_NAM_ANH_ID, { ...DTO_HOP_LE, exam_type: 'WEEKLY_QUIZ' } as any, {
        assignedSubjects: ['ENG'],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('Từ chối lời dặn dò quá ngắn (< 10 ký tự) — phụ huynh phải nhận đủ thông tin ôn thi', async () => {
    await expect(
      ctx.service.createReminder(THAY_NAM_ANH_ID, { ...DTO_HOP_LE, message: 'học bài' } as any, {
        assignedSubjects: ['ENG'],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('Từ chối lớp không tồn tại (báo CLASS_NOT_FOUND)', async () => {
    await expect(
      ctx.service.createReminder(THAY_NAM_ANH_ID, { ...DTO_HOP_LE, class_id: 'cls_khong_co' } as any, {
        assignedSubjects: ['ENG'],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('RBAC: GVCN lớp 1A không được tạo lời nhắc môn Tiếng Anh (không phải công việc của GVCN)', async () => {
    await expect(
      ctx.service.createReminder(CO_LAN_GVCN_ID, DTO_HOP_LE, { assignedSubjects: ['MATH'] }),
    ).rejects.toThrow(ForbiddenException);
    expect(ctx.mockDataConnect.createExamReminder).not.toHaveBeenCalled();
  });
});
