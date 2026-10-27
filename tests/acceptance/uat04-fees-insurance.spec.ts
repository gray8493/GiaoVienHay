/**
 * UAT04_GVCN_03 — NGHIỆM THU QUẢN LÝ HỌC PHÍ & BHYT (TÍCH CHỌN NGÀY NỘP THỰC TẾ),
 *                LỌC DANH SÁCH CHƯA NỘP VÀ GỬI THÔNG BÁO NHẮC NỘP ĐÚNG ĐỐI TƯỢNG
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT04)
 */
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FeesInsuranceService } from '../../apps/api/src/modules/10-fees-insurance/fees-insurance.service';
import { ToggleFeeDto, RemindFeesDto } from '../../apps/api/src/modules/10-fees-insurance/dto/fees-insurance.dto';
import { FeeType } from '@giaovienhay/shared-types';

const GVCN_ID = 'usr_teacher_lan_01'; // Cô Nguyễn Thị Lan
const GVBM_ID = 'usr_teacher_nam_01'; // GVBM — không được thu phí lớp không chủ nhiệm
const CLASS_1A_ID = 'cls_1a_chuvanan';

const HOM_NAY = new Date().toISOString().slice(0, 10);
/** Danh sách khoản thu Lớp 1A: Em Lê Minh Khôi đã nộp BHYT; các em Vũ Đức Trọng & Nguyễn Văn An chưa nộp */
const FEES_LOP_1A = [
  {
    record_id: 'fee_std_khoi_01', student_id: 'std_khoi', student_name: 'Lê Minh Khôi',
    insurance: { is_paid: true, paid_date: '2026-10-25', amount: 850000 },
    tuition: { is_paid: true, paid_date: '2026-10-21', amount: 1200000 },
  },
  {
    record_id: 'fee_std_trong_01', student_id: 'std_trong', student_name: 'Vũ Đức Trọng',
    insurance: { is_paid: false, amount: 850000 },
    tuition: { is_paid: false, amount: 1200000 },
  },
  {
    record_id: 'fee_std_vanan_01', student_id: 'std_vanan', student_name: 'Nguyễn Văn An',
    insurance: { is_paid: false, amount: 850000 },
    tuition: { is_paid: true, amount: 1200000 },
  },
];

function buildFeesService() {
  const feeRecords = new Map<string, any>(FEES_LOP_1A.map((r) => [r.record_id, JSON.parse(JSON.stringify(r))]));
  const mockNotifications = {
    dispatchNotification: jest.fn(async () => ({ sent: 1, failed: 0, parentUserIds: ['usr_parent_hung_01'] })),
    dispatchToParentsOfStudent: jest.fn(async () => ({ sent: 1, failed: 0, parentUserIds: ['usr_parent_hung_01'] })),
    dispatchToParentsOfClass: jest.fn(async () => ({ sent: 1, failed: 0, students: 3 })),
  };
  const mockDataConnect = {
    getClassById: jest.fn(async (id: string) =>
      id === CLASS_1A_ID
        ? { id: id, name: 'Lớp 1A', homeroom_teacher_id: GVCN_ID, is_deleted: false }
        : { id: id, name: 'Lớp 6A', homeroom_teacher_id: 'usr_teacher_khac', is_deleted: false },
    ),
    getFeesByClass: jest.fn(async (classId: string) =>
      classId === CLASS_1A_ID ? Array.from(feeRecords.values()) : [],
    ),
    getFeeById: jest.fn(async (recordId: string) => feeRecords.get(recordId) || null),
    getStudentById: jest.fn(async (id: string) => {
      const found = Array.from(feeRecords.values()).find((r) => r.student_id === id);
      return found ? { id, full_name: found.student_name, class_id: CLASS_1A_ID, parent_phone: '0977112233' } : null;
    }),
    getUserById: jest.fn(async (id: string) =>
      id === GVCN_ID ? { id, full_name: 'Cô Nguyễn Thị Lan' } : null,
    ),
    updateFeeRecord: jest.fn(async (recordId: string, _feeType: string, isPaid: boolean, paidDate: string | null, _note?: string) => {
      const rec = feeRecords.get(recordId);
      if (!rec) throw new Error('record_not_found');
      return { ...rec, updated: { isPaid, paidDate } };
    }),
  };
  const service = new FeesInsuranceService(mockDataConnect as any, mockNotifications as any);
  return { service, mockDataConnect, mockNotifications, feeRecords };
}

describe('UAT04_GVCN_03 — Học phí & BHYT: tích chọn ngày nộp thực tế, lọc chưa nộp, gửi nhắc đúng đối tượng', () => {
  let ctx: ReturnType<typeof buildFeesService>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildFeesService();
  });

  it('Bước 1: GVCN mở danh sách thu phí BHYT lớp 1A, hiển thị tổng học sinh & số chưa nộp từng khoản', async () => {
    const res: any = await ctx.service.getClassFeesList(GVCN_ID, CLASS_1A_ID);
    expect(res.class_id).toBe(CLASS_1A_ID);
    expect(res.total_students).toBe(3);
    expect(res.unpaid_insurance_count).toBe(2); // Vũ Đức Trọng, Nguyễn Văn An
    expect(res.unpaid_tuition_count).toBe(1);   // chỉ Vũ Đức Trọng
    expect(res.records).toHaveLength(3);
  });

  it('Bước 2: Tích chọn đã nộp BHYT — bắt buộc ghi ngày nộp thực tế & lưu vào DB', async () => {
    const dto: ToggleFeeDto = {
      record_id: 'fee_std_khoi_01',
      fee_type: FeeType.INSURANCE,
      is_paid: true,
      paid_date: HOM_NAY,
    } as any;
    const res: any = await ctx.service.toggleFeeStatus(GVCN_ID, dto);

    expect(res.is_paid).toBe(true);
    expect(res.paid_date).toBe(HOM_NAY);
    expect(ctx.mockDataConnect.updateFeeRecord).toHaveBeenCalledWith(
      'fee_std_khoi_01', FeeType.INSURANCE, true, HOM_NAY, undefined,
    );
    // Trả thông báo PH đồng thời mã giữ nguyên record_id
    expect(res.notified_parent_count).toBe(1);
    expect(ctx.mockNotifications.dispatchToParentsOfStudent).toHaveBeenCalledTimes(1);
  });

  it('Bước 2b: Chấp nhận ngày nộp nhập kiểu DD/MM/YYYY và tự chuẩn hóa về YYYY-MM-DD', async () => {
    const dto: ToggleFeeDto = {
      record_id: 'fee_std_trong_01',
      fee_type: FeeType.INSURANCE,
      is_paid: true,
      paid_date: '27/10/2026',
    } as any;
    const res: any = await ctx.service.toggleFeeStatus(GVCN_ID, dto);
    expect(res.paid_date).toBe('2026-10-27');
  });

  it('Bước 2c: Từ chối khi đánh dấu đã nộp nhưng thiếu ngày nộp (minh bạch tài chính)', async () => {
    const dto: ToggleFeeDto = {
      record_id: 'fee_std_trong_01',
      fee_type: FeeType.INSURANCE,
      is_paid: true,
      // thiếu paid_date
    } as any;
    await expect(ctx.service.toggleFeeStatus(GVCN_ID, dto)).rejects.toThrow(BadRequestException);
  });

  it('Bước 2d: Từ chối ngày nộp ở tương lai', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dto: ToggleFeeDto = {
      record_id: 'fee_std_trong_01',
      fee_type: FeeType.INSURANCE,
      is_paid: true,
      paid_date: tomorrow.toISOString().slice(0, 10),
    } as any;
    await expect(ctx.service.toggleFeeStatus(GVCN_ID, dto)).rejects.toThrow(BadRequestException);
  });

  it('Bước 2e: Từ chối fee_type ngoài danh mục TUITION/INSURANCE', async () => {
    const dto: ToggleFeeDto = {
      record_id: 'fee_std_trong_01',
      fee_type: 'KHONG_HOP_LE' as any,
      is_paid: true,
      paid_date: HOM_NAY,
    } as any;
    await expect(ctx.service.toggleFeeStatus(GVCN_ID, dto)).rejects.toThrow(BadRequestException);
  });

  it('Bước 3: RBAC — GVBM không phải GVCN không được thu nộp & chỉnh sửa khoản phí', async () => {
    const dto: ToggleFeeDto = {
      record_id: 'fee_std_khoi_01',
      fee_type: FeeType.INSURANCE,
      is_paid: true,
      paid_date: HOM_NAY,
    } as any;
    // Controller resolve quyền chủ nhiệm trước rồi bắn cờ isHomeroom vào service —
    // GVBM không phải GVCN → bị chặn ngay.
    await expect(ctx.service.toggleFeeStatus(GVBM_ID, dto, { isHomeroom: false })).rejects.toThrow(ForbiddenException);
    await expect(ctx.service.getClassFeesList(GVBM_ID, CLASS_1A_ID)).rejects.toThrow(ForbiddenException);
  });

  it('Bước 4: Lọc tab "Chưa hoàn thành" — chỉ hiện học sinh chưa nộp BHYT', async () => {
    const res: any = await ctx.service.getClassFeesList(GVCN_ID, CLASS_1A_ID, {
      fee_type: FeeType.INSURANCE,
      unpaid_only: true,
    });
    const names = res.records.map((r: any) => r.student_name).sort();
    expect(names).toEqual(['Nguyễn Văn An', 'Vũ Đức Trọng']);
  });

  it('Bước 4b: Gửi nhắc nộp BHYT — chỉ gửi đến phụ huynh chưa nộp, không làm phiền hộ đã hoàn thành', async () => {
    const dto: RemindFeesDto = {
      class_id: CLASS_1A_ID,
      fee_type: FeeType.INSURANCE,
      custom_message: 'Thầy trò cô nhắc phụ huynh nộp BHYT sớm nhé!',
    } as any;
    const res: any = await ctx.service.sendFeeReminder(GVCN_ID, dto);

    // 2 hộ chưa nộp (Vũ Đức Trọng + Nguyễn Văn An) — KHÔNG gửi đến hộ Lê Minh Khôi đã nộp
    expect(res.notified_parents_count).toBe(2);
    expect(res.failed_parent_inboxes).toBe(0);
    const calls = ctx.mockNotifications.dispatchToParentsOfStudent.mock.calls;
    const notifiedStudentIds = calls.map((c: any[]) => c[0].id);
    expect(new Set(notifiedStudentIds)).toEqual(new Set(['std_trong', 'std_vanan']));
    // Type được đánh dấu nhắc phí đúng
    expect(calls.every((c: any[]) => c[1].type === 'FEE_REMINDER')).toBe(true);
  });

  it('Bước 4c: Nếu cả lớp đã hoàn thành thì thông báo không có gì cần nhắc, không phát thông báo ảo', async () => {
    // Tìm dao dịch: tất cả BHYT đều đã nộp
    ctx.feeRecords.forEach((r: any) => {
      if (r.insurance) r.insurance.is_paid = true;
    });
    const res: any = await ctx.service.sendFeeReminder(GVCN_ID, {
      class_id: CLASS_1A_ID,
      fee_type: FeeType.INSURANCE,
    } as any);
    expect(res.notified_parents_count).toBe(0);
    expect(ctx.mockNotifications.dispatchToParentsOfStudent).not.toHaveBeenCalled();
  });

  it('Bảo vệ đánh dấu đã nộp nhưng DB ghi lỗi → trả lỗi rõ ràng, không báo thành công ảo', async () => {
    ctx.mockDataConnect.updateFeeRecord.mockRejectedValueOnce(new Error('DB Down'));
    const dto: ToggleFeeDto = {
      record_id: 'fee_std_trong_01',
      fee_type: FeeType.INSURANCE,
      is_paid: true,
      paid_date: HOM_NAY,
    } as any;
    await expect(ctx.service.toggleFeeStatus(GVCN_ID, dto)).rejects.toThrow(InternalServerErrorException);
  });

  it('Từ chối thao tác khi chưa xác thực (teacherId rỗng)', async () => {
    await expect(
      ctx.service.getClassFeesList('', CLASS_1A_ID),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      ctx.service.sendFeeReminder('', { class_id: CLASS_1A_ID, fee_type: FeeType.INSURANCE } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Từ chối nhắc nộp với record không tồn tại (giữ dữ liệu chuẩn mực)', async () => {
    await expect(
      ctx.service.toggleFeeStatus(GVCN_ID, {
        record_id: 'fee_khong_ton_tai',
        fee_type: FeeType.INSURANCE,
        is_paid: true,
        paid_date: HOM_NAY,
      } as any),
    ).rejects.toThrow(NotFoundException);
  });
});
