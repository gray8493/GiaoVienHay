/**
 * UAT14_PHHS_04 — NGHIỆM THU TRA CỨU TÌNH TRẠNG NỘP HỌC PHÍ & BHYT (KÈM NGÀY NỘP)
 *                VÀ XEM LỜI NHẮC LỊCH KIỂM TRA SẮP TỚI
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT14)
 *
 * Ghi chú phạm vi tự động hóa: việc quét mã VietQR (Napas247) thực hiện hoàn toàn trên
 * app ngân hàng — backend nghiệm thu ở đây là (1) trạng thái BHYT "ĐÃ HOÀN THÀNH" kèm
 * ngày nộp 25/10/2026, (2) trạng thái quỹ/bán trú "CHƯA NỘP" để phụ huynh bấm thanh toán,
 * (3) tab "Lịch kiểm tra sắp tới" hiển thị đúng môn/ngày/dặn dò từ bảng exam_reminders.
 */
import { ForbiddenException } from '@nestjs/common';
import { StudentsService } from '../../apps/api/src/modules/04-students/students.service';

const STD_BAO_NAM = 'std_baonam';
const PH_BA_HUNG_PHONE = '0977112233';
const CLASS_1A_ID = 'cls_1a_chuvanan';

const FEES_BAO_NAM = [
  {
    fee_type: 'INSURANCE',
    title: 'Bảo hiểm Y tế HK1 2026-2027',
    is_paid: true,
    paid_at: '2026-10-25T00:00:00.000Z',
    amount: 750000,
  },
  {
    fee_type: 'TUITION',
    title: 'Quỹ lớp / Bán trú HK1 2026-2027',
    is_paid: false,
    due_date: '2026-11-05',
    amount: 1100000,
  },
];

function buildFeesPortalStack() {
  const bhytStudent = {
    id: STD_BAO_NAM,
    full_name: 'Trần Bảo Nam',
    student_code: 'HS003',
    class_id: CLASS_1A_ID,
    parent_phone: PH_BA_HUNG_PHONE,
  };

  const mockDataConnect = {
    getStudentById: jest.fn(async (id: string) => (id === STD_BAO_NAM ? bhytStudent : null)),
    getFeesByStudent: jest.fn(async (id: string) => (id === STD_BAO_NAM ? FEES_BAO_NAM : [])),
    getClassById: jest.fn(async () => ({ id: CLASS_1A_ID, name: 'Lớp 1A', academic_year: '2026-2027' })),
    // Bảng exam_reminders đã tạo ở UAT10 (thầy bộ môn Tiếng Anh)
    getExamRemindersByClass: jest.fn(async () => [
      {
        id: 'exm_test123',
        reminder_id: 'exm_test123',
        subject: 'Tiếng Anh',
        exam_type: 'TEST_1P',
        exam_date: '2026-10-28',
        title: 'Kiểm tra 1 tiết (45 phút) - Môn Tiếng Anh',
        instructions: '',
        content_scope: 'Bố mẹ nhắc con ôn kỹ từ vựng Unit 1, 2 và chuẩn bị bút chì.',
        created_at: '2026-10-26T09:00:00.000Z',
      },
    ]),
  };

  const service = new StudentsService(mockDataConnect as any);
  return { service, mockDataConnect };
}

describe('UAT14_PHHS_04 — Học phí & BHYT minh bạch + Lời nhắc kiểm tra sắp tới', () => {
  let ctx: ReturnType<typeof buildFeesPortalStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildFeesPortalStack();
  });

  it('Bước 1: Mục "Học phí & BHYT" — BHYT huy hiệu xanh "ĐÃ HOÀN THÀNH" kèm ngày nộp 25/10/2026, quỹ bán trú "CHƯA NỘP"', async () => {
    const res: any = await ctx.service.getFeesInsuranceStatus(STD_BAO_NAM, PH_BA_HUNG_PHONE);

    expect(res.student_id).toBe(STD_BAO_NAM);
    expect(res.has_fee_records).toBe(true);

    // Bảo hiểm Y tế: đã hoàn thành, kèm ngày nộp cụ thể mang lại sự an tâm
    expect(res.is_paid_insurance).toBe(true);
    expect(res.insurance.status_label).toBe('ĐÃ HOÀN THÀNH');
    expect(res.insurance.paid_date).toContain('2026-10-25');
    expect(res.insurance.amount).toBe(750000);

    // Quỹ lớp / Bán trú: chưa hoàn thành → phụ huynh còn phải thanh toán
    expect(res.is_paid_tuition).toBe(false);
    expect(res.tuition.status_label).toBe('CHƯA NỘP');
    expect(res.tuition.due_date).toBe('2026-11-05');
    expect(res.academic_year).toBe('2026-2027');
  });

  it('Bước 3: Tab "Lịch kiểm tra sắp tới" — thẻ thông báo rõ môn Tiếng Anh, 28/10/2026 và lời dặn đôn đốc con học bài', async () => {
    const reminders: any[] = await ctx.service.getExamReminders(STD_BAO_NAM, PH_BA_HUNG_PHONE);

    expect(reminders).toHaveLength(1);
    const thongBao = reminders[0];
    expect(thongBao.subject_name).toBe('Tiếng Anh');
    expect(thongBao.exam_date).toBe('2026-10-28');
    expect(thongBao.exam_type).toBe('TEST_1P');
    expect(thongBao.content_scope).toContain('Unit 1, 2');
    expect(thongBao.content_scope).toContain('bút chì');
  });

  it('Chống IDOR: phụ huynh khác SĐT không xem được trạng thái học phí của em Bảo Nam', async () => {
    await expect(
      ctx.service.getFeesInsuranceStatus(STD_BAO_NAM, '0966888999'),
    ).rejects.toThrow(ForbiddenException);
    expect(ctx.mockDataConnect.getFeesByStudent).not.toHaveBeenCalled();
  });
});
