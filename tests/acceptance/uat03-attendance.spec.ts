/**
 * UAT03_GVCN_02 — NGHIỆM THU ĐIỂM DANH 1-CHẠM BẤT ĐỒNG BỘ, PHÁT THÔNG BÁO FCM VẮNG HỌC
 *                VÀ ĐỒNG BỘ IN-MEMORY CACHE CHO VÒNG QUAY BÀI CŨ
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT03)
 */
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from '../../apps/api/src/modules/05-attendance/attendance.service';
import { SubmitAttendanceDto } from '../../apps/api/src/modules/05-attendance/dto/attendance.dto';
import { AttendanceStatus } from '@giaovienhay/shared-types';

const GVCN_ID = 'usr_teacher_lan_01'; // Cô Nguyễn Thị Lan
const GVCN_LOP_KHAC_ID = 'usr_teacher_khac';
const CLASS_1A_ID = 'cls_1a_chuvanan';
const HOM_NAY = new Date().toISOString().slice(0, 10);

const CA_LOP_1A = [
  { student_id: 'std_khoi', status: AttendanceStatus.PRESENT },
  { student_id: 'std_my', status: AttendanceStatus.ABSENT_EXCUSED },   // Em Nguyễn Hoàng My — vắng có phép
  { student_id: 'std_baonam', status: AttendanceStatus.ABSENT_UNEXCUSED }, // Em Trần Bảo Nam — vắng không phép
  { student_id: 'std_quynhanh', status: AttendanceStatus.PRESENT },
  { student_id: 'std_vanan', status: AttendanceStatus.LATE },
];

function buildAttendanceService() {
  const emittedEvents: Array<{ event: string; payload: any }> = [];
  const cacheStore = new Map<string, any>();
  const mockCacheManager = {
    get: jest.fn(async (k: string) => cacheStore.get(k)),
    set: jest.fn(async (k: string, v: any, _ttl?: number) => cacheStore.set(k, v)),
    del: jest.fn(async (k: string) => cacheStore.delete(k)),
  };
  const mockEvents = { emit: jest.fn((event: string, payload: any) => { emittedEvents.push({ event, payload }); }) };
  const mockNotifications = {
    dispatchNotification: jest.fn(async () => ({ sent: 1, failed: 0, parentUserIds: ['usr_parent_hung_01'] })),
    dispatchToParentsOfStudent: jest.fn(async () => ({ sent: 1, failed: 0, parentUserIds: ['usr_parent_hung_01'] })),
    dispatchToParentsOfClass: jest.fn(async () => ({ sent: 1, failed: 0, students: 1 })),
  };
  const attendanceRecords: any[] = [];
  const mockDataConnect = {
    getClassById: jest.fn(async (id: string) =>
      id === CLASS_1A_ID
        ? { id: id, name: 'Lớp 1A', homeroom_teacher_id: GVCN_ID, is_deleted: false }
        : null,
    ),
    getAttendanceByClassDate: jest.fn(async (_classId: string, date: string) =>
      attendanceRecords.filter((r) => r.date === date),
    ),
    recordAttendance: jest.fn(async (rec: any) => attendanceRecords.push(rec)),
    listStudentsByClass: jest.fn(async (classId: string) =>
      classId === CLASS_1A_ID
        ? [
            { id: 'std_khoi', full_name: 'Lê Minh Khôi', student_code: 'HS001' },
            { id: 'std_my', full_name: 'Nguyễn Hoàng My', student_code: 'HS002' },
            { id: 'std_baonam', full_name: 'Trần Bảo Nam', student_code: 'HS003' },
            { id: 'std_quynhanh', full_name: 'Phạm Quỳnh Anh', student_code: 'HS004' },
            { id: 'std_vanan', full_name: 'Nguyễn Văn An', student_code: 'HS005' },
          ]
        : [],
    ),
    getStudentById: jest.fn(async (id: string) => {
      const names: Record<string, string> = {
        std_khoi: 'Lê Minh Khôi', std_my: 'Nguyễn Hoàng My', std_baonam: 'Trần Bảo Nam',
        std_quynhanh: 'Phạm Quỳnh Anh', std_vanan: 'Nguyễn Văn An',
      };
      return names[id] ? { id, full_name: names[id], parent_phone: id === 'std_baonam' ? '0977112233' : null } : null;
    }),
    getUserByPhone: jest.fn(async (phone: string) =>
      phone === '0977112233' ? { id: 'usr_parent_hung_01', role: 'PARENT' } : null,
    ),
  };

  const service = new AttendanceService(
    mockDataConnect as any,
    mockCacheManager as any,
    mockEvents as any,
    mockNotifications as any,
  );
  return { service, mockCacheManager, mockDataConnect, mockEvents, mockNotifications, emittedEvents, attendanceRecords };
}

describe('UAT03_GVCN_02 — Điểm danh 1-chạm, FCM vắng học & In-Memory Cache', () => {
  let ctx: ReturnType<typeof buildAttendanceService>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildAttendanceService();
  });

  it('Bước 1–3: GVCN lưu điểm danh 1-chạm thành công (< 1s), đếm đúng có mặt/vắng theo từng trạng thái', async () => {
    const dto: SubmitAttendanceDto = {
      class_id: CLASS_1A_ID,
      attendance_date: HOM_NAY,
      period: 1,
      records: CA_LOP_1A,
    } as any;

    const start = Date.now();
    const res: any = await ctx.service.submitAttendance(GVCN_ID, dto);
    const elapsed = Date.now() - start;

    // Lưu tức thì, không đơ màn hình
    expect(elapsed).toBeLessThan(1000);
    expect(res.attendance_date).toBe(HOM_NAY);
    expect(res.total_students).toBe(5);
    // 2 có mặt (Khôi, Quỳnh Anh) — 3 vắng/trễ (My có phép, Bảo Nam không phép, Văn An trễ)
    expect(res.present_count).toBe(2);
    expect(res.absent_count).toBe(3);
    // Không lần chỉnh sửa nào trước đó
    expect(res.is_update).toBe(false);
  });

  it('Bước 4: Phát sự kiện ngầm FCM cho học sinh chuyển trạng thái (vắng/không phép/trễ) — thông báo đẩy dưới 2.5s', async () => {
    const dto: SubmitAttendanceDto = {
      class_id: CLASS_1A_ID,
      attendance_date: HOM_NAY,
      period: 1,
      records: CA_LOP_1A,
    } as any;
    const res = await ctx.service.submitAttendance(GVCN_ID, dto);

    // Queue thông báo ngầm: chỉ học sinh có sự thay đổi mới nhận thông báo — PH có mặt KHÔNG bị làm phiền
    expect(res.notified_parents_queued).toBe(3);
    expect(ctx.emittedEvents.filter((e) => e.event === 'attendance.absent')).toHaveLength(1);
    const absentEvent = ctx.emittedEvents.find((e) => e.event === 'attendance.absent');
    expect(absentEvent.payload.classId).toBe(CLASS_1A_ID);
    const studentMap: Record<string, string> = {
      std_my: 'Nguyễn Hoàng My',
      std_baonam: 'Trần Bảo Nam',
      std_vanan: 'Nguyễn Văn An',
    };
    const absentNames = absentEvent.payload.absentStudents
      .map((s: any) => studentMap[s.studentId])
      .sort();
    expect(absentNames).toEqual(['Nguyễn Hoàng My', 'Nguyễn Văn An', 'Trần Bảo Nam']);

    // Worker nền phát sớm thông báo cho PH em Trần Bảo Nam (< 2.5s)
    const start = Date.now();
    await ctx.service.handleAbsentNotificationEvent(absentEvent.payload);
    expect(Date.now() - start).toBeLessThan(2500);
    // Đích danh phụ huynh của em Bảo Nam (SĐT 0977112233) — không spam ai khác
    expect(ctx.mockNotifications.dispatchNotification).toHaveBeenCalled();
    const callForBaoNam = ctx.mockNotifications.dispatchNotification.mock.calls.find(
      (c: any[]) => c[0].metadata?.student_id === 'std_baonam',
    );
    expect(callForBaoNam).toBeDefined();
    expect(callForBaoNam[0].metadata.status).toBe(AttendanceStatus.ABSENT_UNEXCUSED);
    expect(callForBaoNam[0].recipientUserId).toBe('usr_parent_hung_01');
  });

  it('Bước 4 (Cache): Danh sách học sinh có mặt nạp RAM cache phục vụ vòng quay bài cũ', async () => {
    // Bước 3: Lưu điểm danh (Khôi + Quỳnh Anh có mặt)
    const dto: SubmitAttendanceDto = {
      class_id: CLASS_1A_ID,
      attendance_date: HOM_NAY,
      period: 1,
      records: CA_LOP_1A,
    } as any;
    await ctx.service.submitAttendance(GVCN_ID, dto);

    // Cache đã bị xóa sau khi lưu → gọi đầu tiên sẽ nạp và cache lại
    const start = Date.now();
    const first: any = await ctx.service.getTodayPresentStudents(CLASS_1A_ID);
    const elapsed = Date.now() - start;

    expect(first.is_attended_today).toBe(true);
    expect(first.total_present).toBe(2);
    expect(first.present_students.map((s: any) => s.full_name)).toEqual(['Lê Minh Khôi', 'Phạm Quỳnh Anh']);
    // Cache được set để Vòng quay lần sau truy xuất < 5ms
    expect(ctx.mockCacheManager.set).toHaveBeenCalledWith(
      expect.stringContaining(`att_present_${CLASS_1A_ID}`), expect.anything(), 900000,
    );

    // Truy xuất lần 2 phải đọc từ RAM cache (không gọi DB lại)
    ctx.mockDataConnect.getAttendanceByClassDate.mockClear();
    const second = await ctx.service.getTodayPresentStudents(CLASS_1A_ID);
    expect(second).toEqual(first);
    expect(ctx.mockCacheManager.get).toHaveBeenCalledWith(
      expect.stringContaining(`att_present_${CLASS_1A_ID}`),
    );
    expect(ctx.mockDataConnect.getAttendanceByClassDate).not.toHaveBeenCalled();
  });

  it('RBAC: Giáo viên không phải GVCN lớp này không được lưu điểm danh lớp 1A', async () => {
    ctx = buildAttendanceService();
    const dto: SubmitAttendanceDto = {
      class_id: CLASS_1A_ID,
      attendance_date: HOM_NAY,
      period: 1,
      records: CA_LOP_1A,
    } as any;
    await expect(
      ctx.service.submitAttendance(GVCN_LOP_KHAC_ID, dto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Từ chối điểm danh ngày trong tương lai (chỉ được điểm danh tới hiện tại)', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dto: SubmitAttendanceDto = {
      class_id: CLASS_1A_ID,
      attendance_date: tomorrow.toISOString().slice(0, 10),
      period: 1,
      records: CA_LOP_1A,
    } as any;
    await expect(ctx.service.submitAttendance(GVCN_ID, dto)).rejects.toThrow(BadRequestException);
  });

  it('Từ chối danh sách records rỗng (tối thiểu 1 học sinh)', async () => {
    const dto: SubmitAttendanceDto = {
      class_id: CLASS_1A_ID,
      attendance_date: HOM_NAY,
      period: 1,
      records: [],
    } as any;
    await expect(ctx.service.submitAttendance(GVCN_ID, dto)).rejects.toThrow(BadRequestException);
  });

  it('Bước 4b: Chỉnh sửa từ vắng -> có mặt (upsert) và thông báo cập nhật điểm danh', async () => {
    // Lần 1: điểm danh ban đầu
    await ctx.service.submitAttendance(GVCN_ID, {
      class_id: CLASS_1A_ID,
      attendance_date: HOM_NAY,
      period: 1,
      records: CA_LOP_1A,
    } as any);

    // Lần 2: Em Bảo Nam đến muộn — cô sửa trạng thái
    const res: any = await ctx.service.submitAttendance(GVCN_ID, {
      class_id: CLASS_1A_ID,
      attendance_date: HOM_NAY,
      period: 1,
      records: [
        { student_id: 'std_khoi', status: AttendanceStatus.PRESENT },
        { student_id: 'std_baonam', status: AttendanceStatus.PRESENT }, // 1 em được báo sẽ có mặt
      ],
    } as any);
    expect(res.is_update).toBe(true);
    // Phát sự kiện updated cho HS vừa chuyển vắng → có mặt
    expect(ctx.emittedEvents.some((e) => e.event === 'attendance.updated')).toBe(true);
  });
});
