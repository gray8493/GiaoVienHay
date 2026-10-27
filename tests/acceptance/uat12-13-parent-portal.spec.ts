/**
 * UAT12_PHHS_02 — NGHIỆM THU TÍNH KỊP THỜI CỦA THÔNG BÁO ĐẨY CẢNH BÁO VẮNG HỌC VÀ
 *                TRA CỨU LỊCH SỬ CHUYÊN CẦN CỦA CON
 * UAT13_PHHS_03 — NGHIỆM THU TRA CỨU SỔ ĐIỂM ĐIỆN TỬ ĐA MÔN HỌC, ĐỌC NHẬN XÉT CỦA
 *                GIÁO VIÊN VÀ PHẢN HỒI "XÁC NHẬN ĐÃ ĐỌC"
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT12, UAT13)
 *
 * Ghi chú phạm vi tự động hóa: deep-link từ FCM là giao diện — backend nghiệm thu là
 * (1) cảnh báo khẩn < 2.5s đã nghiệm thu ở UAT03 (event attendance.absent),
 * (2) tra cứu lịch sử chuyên cần nay kèm thống kê minh bạch, (3) sổ điểm đa cột trung thực,
 * (4) đọc nhận xét của cô + phản hồi "Xác nhận đã đọc" dưới 1 giây qua markAsRead,
 * (5) chống IDOR: phụ huynh khác SĐT chỉ được xem hồ sơ của con mình.
 */
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { StudentsService } from '../../apps/api/src/modules/04-students/students.service';
import { NotificationsService } from '../../apps/api/src/modules/11-notifications/notifications.service';
import { AttendanceStatus } from '@giaovienhay/shared-types';

const BA_HUNG_ID = 'usr_parent_hung_01';
const STD_BAO_NAM = 'std_baonam'; // Em Trần Bảo Nam — con của bác Hùng
const STD_KHOI = 'std_khoi';     // Em Lê Minh Khôi — con phụ huynh KHÁC
const THANG_HIEN_TAI = new Date().toISOString().slice(0, 7);
const HOM_NAY = new Date().toISOString().slice(0, 10);

/** Lịch sử chuyên cần đa dạng: đ/đ/v có phép/v không phép/trễ */
const LICH_SU_DIEM_DANH = [
  { date: `${THANG_HIEN_TAI}-01`, status: AttendanceStatus.PRESENT },
  { date: `${THANG_HIEN_TAI}-02`, status: AttendanceStatus.PRESENT },
  { date: `${THANG_HIEN_TAI}-03`, status: AttendanceStatus.ABSENT_EXCUSED, note: 'Ốm' },
  { date: `${THANG_HIEN_TAI}-04`, status: AttendanceStatus.ABSENT_UNEXCUSED, note: 'Tiết 1 - Đầu giờ' },
  { date: `${THANG_HIEN_TAI}-05`, status: AttendanceStatus.LATE },
];
/** Cột điểm Toán học của em Bảo Nam: miệng 10.0 + 15 phút 9.5 */
const DIEM_TOAN_BAO_NAM = [
  { subject: 'MATH', scoreType: 'ORAL_TEST', scoreValue: 10.0 },
  { subject: 'MATH', scoreType: 'TEST_15P', scoreValue: 9.5 },
];

function buildParentPortalStack() {
  const HS_DB: Record<string, any> = {
    [STD_BAO_NAM]: {
      id: STD_BAO_NAM,
      full_name: 'Trần Bảo Nam',
      student_code: 'HS003',
      class_id: 'cls_1a_chuvanan',
      class_name: 'Lớp 1A',
      parent_phone: '0977112233',
    },
    [STD_KHOI]: {
      id: STD_KHOI,
      full_name: 'Lê Minh Khôi',
      student_code: 'HS001',
      class_id: 'cls_1a_chuvanan',
      class_name: 'Lớp 1A',
      parent_phone: '0933445566',
    },
  };

  const notificationsDb: any[] = []; // hộp thư phụ huynh + trạng thái is_read
  notificationsDb.push({
    id: 'noti_remark_01',
    recipient_user_id: BA_HUNG_ID,
    title: 'Nhận xét mới - Em Trần Bảo Nam',
    body: 'Cô Nguyễn Thị Lan vừa gửi nhận xét môn Toán: "Em Bảo Nam tiến bộ vượt bậc tuần này".',
    is_read: false,
  });

  const mockDataConnect = {
    getStudentById: jest.fn(async (id: string) => HS_DB[id] || null),
    getAttendanceByStudent: jest.fn(async (id: string) => (id === STD_BAO_NAM ? LICH_SU_DIEM_DANH : [])),
    getScoresByStudent: jest.fn(async (id: string) => (id === STD_BAO_NAM ? DIEM_TOAN_BAO_NAM : [])),
    getRemarksByStudent: jest.fn(async (id: string) =>
      id === STD_BAO_NAM
        ? [
            {
              id: 'rmk_01',
              subject_code: 'MATH',
              teacher_name: 'Cô Nguyễn Thị Lan',
              content: 'Em Trần Bảo Nam học sinh lên lớp rất tốt điểm 10 được khen ngợi tinh thần học tập đầy đủ bài vở.',
              created_at: new Date().toISOString(),
            },
          ]
        : [],
    ),
    getNotificationById: jest.fn(async (id: string) => notificationsDb.find((n) => n.id === id) || null),
    markNotificationRead: jest.fn(async (id: string) => {
      const n = notificationsDb.find((x) => x.id === id);
      if (n) n.is_read = true;
    }),
    getNotificationsByRecipient: jest.fn(async (uid: string) => notificationsDb.filter((n) => n.recipient_user_id === uid)),
  };

  const studentsService = new StudentsService(mockDataConnect as any);
  const notificationsService = new NotificationsService(mockDataConnect as any, {
    isReady: () => false,
    sendMulticast: jest.fn(),
  } as any);
  return { studentsService, notificationsService, mockDataConnect, notificationsDb };
}

describe('UAT12_PHHS_02 — Cảnh báo vắng học kịp thời & tra cứu chuyên cần của con', () => {
  let ctx: ReturnType<typeof buildParentPortalStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildParentPortalStack();
  });

  it('Bước 3: Parent mở Chuyên cần của con — lịch tháng minh bạch đủ chấm tròn, thống kê số buổi có mặt/vắng', async () => {
    const start = Date.now();
    const res: any = await ctx.studentsService.getAttendanceHistory(STD_BAO_NAM, THANG_HIEN_TAI, '0977112233');
    expect(Date.now() - start).toBeLessThan(2500);

    expect(res.student_id).toBe(STD_BAO_NAM);
    expect(res.full_name).toBe('Trần Bảo Nam');
    // Rõ ràng phân định vắng CÓ PHÉP (màu vàng) và KHÔNG PHÉP (màu đỏ)
    expect(res.total_absent_excused).toBe(1);
    expect(res.total_absent_unexcused).toBe(1);
    expect(res.late_days).toBe(1);
    expect(res.total_present).toBe(2);
    // Tỷ lệ chuyên cần 2/5 = 40%
    expect(res.attendance_rate).toBe(40);
    // Chi tiết vắng kèm ngày + lý do(ghi chú)
    expect(res.absent_details).toContainEqual({ date: `${THANG_HIEN_TAI}-04`, status: 'UNEXCUSED', reason: 'Tiết 1 - Đầu giờ' });
  });

  it('Từ chối tham số tháng sai định dạng (không phải YYYY-MM)', async () => {
    await expect(
      ctx.studentsService.getAttendanceHistory(STD_BAO_NAM, '2026/10', '0977112233'),
    ).rejects.toThrow(BadRequestException);
  });

  it('Chống IDOR: phụ huynh bác Hùng KHÔNG xem được lịch chuyên cần học sinh khác trong lớp', async () => {
    await expect(
      ctx.studentsService.getAttendanceHistory(STD_KHOI, THANG_HIEN_TAI, '0977112233'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Hồ sơ học sinh không tồn tại báo STUDENT_NOT_FOUND (không rò rỉ dữ liệu)', async () => {
    await expect(
      ctx.studentsService.getAttendanceHistory('std_khong_co', THANG_HIEN_TAI, '0977112233'),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('UAT13_PHHS_03 — Sổ điểm đa môn & nhận xét giáo viên', () => {
  let ctx: ReturnType<typeof buildParentPortalStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildParentPortalStack();
  });

  it('Bước 1–2: Kết quả học tập — Toán học hiện đúng cột thành phần (miệng 10.0, 15 phút 9.5) theo dữ liệu giáo viên công bố', async () => {
    const res: any = await ctx.studentsService.getAcademicRecord(STD_BAO_NAM, 1, '0977112233');

    expect(res.full_name).toBe('Trần Bảo Nam');
    expect(res.subjects).toHaveLength(1);
    const toan = res.subjects.find((s: any) => s.subject_code === 'MATH');
    expect(toan.subject_name).toBe('Toán học');
    expect(toan.scores).toContainEqual(expect.objectContaining({ type: 'ORAL_TEST', value: 10.0 }));
    expect(toan.scores).toContainEqual(expect.objectContaining({ type: 'TEST_15P', value: 9.5 }));
  });

  it('Chống IDOR (bảo mật dữ liệu điểm): phụ huynh khác chỉ nhìn thấy đúng hồ sơ con em mình', async () => {
    await expect(
      ctx.studentsService.getAcademicRecord(STD_KHOI, 1, '0977112233'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Bước 3: Tab "Nhận xét của thầy cô" — đọc trọn vẹn lời nhận xét của Cô Nguyễn Thị Lan', async () => {
    const remarks = await ctx.studentsService.getRemarks(STD_BAO_NAM, '0977112233');

    expect(remarks).toHaveLength(1);
    const rmk = (remarks as any[])[0];
    expect(rmk.teacher_name).toBe('Cô Nguyễn Thị Lan');
    expect(rmk.subject_name).toBe('Toán');
    expect(rmk.content).toContain('Trần Bảo Nam');
    expect((rmk as any).content.length).toBeGreaterThan(10);
  });

  it('Bước 4: Bấm "Xác nhận đã đọc" — phản hồi cập nhật trạng thái is_read ngay dưới 1 giây', async () => {
    const start = Date.now();
    const res: any = await ctx.notificationsService.markAsRead(BA_HUNG_ID, 'noti_remark_01');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
    expect(res.success).toBe(true);
    // Lưu trạng thái phản hồi tức thì trong CSDL
    const updated = ctx.notificationsDb.find((n) => n.id === 'noti_remark_01');
    expect(updated.is_read).toBe(true);
    expect(ctx.mockDataConnect.markNotificationRead).toHaveBeenCalledWith('noti_remark_01');
  });

  it('Bảo mật hộp thư: PH không thể đánh dấu đã đọc thông báo của tài khoản khác (không rò rỉ)', async () => {
    await expect(
      ctx.notificationsService.markAsRead('usr_parent_khac', 'noti_remark_01'),
    ).rejects.toThrow(NotFoundException);
    // Hộp thư của bác Hùng không bị ảnh hưởng
    const updated = ctx.notificationsDb.find((n) => n.id === 'noti_remark_01');
    expect(updated.is_read).toBe(false);
  });
});
