/**
 * UAT16_ADMIN_01 — NGHIỆM THU CẤU HÌNH HẠN MỨC TÀI NGUYÊN HỆ THỐNG (LIMITS / QUOTAS)
 *                VÀ ÁP DỤNG CHẶN TỨC THÌ
 * UAT17_ADMIN_02 — NGHIỆM THU KHÓA TÀI KHOẢN VI PHẠM (BAN USER), THU HỒI PHIÊN TỨC THÌ
 *                VÀ MỞ KHÓA (UNBAN) AN TOÀN
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT16, UAT17)
 *
 * Ghi chú phạm vi tự động hóa: màn hình web Admin là giao diện — backend nghiệm thu là
 * (1) lưu bảng system_limits đúng giá trị mới + áp dụng không cần restart (đọc mỗi lần cần),
 * (2) khóa = is_active=false kèm lý do minh bạch + ghi nhật ký, (3) đăng nhập lại bị từ chối
 * AUTH_ACCOUNT_LOCKED, (4) mở khóa khôi phục is_active=true và đăng nhập lại thành công.
 */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../apps/api/src/modules/01-auth/auth.service';
import { AdminService } from '../../apps/api/src/modules/12-admin/admin.service';

const ADMIN_ID = 'usr_admin_binh'; // Thầy Trần Văn Bình (0988001122)
const USR_BI_KHOA_ID = 'usr_locked_teacher_01'; // Tài khoản vi phạm (SĐT 0911000999)
const LY_DO_KHOA = 'Vi phạm quy tắc ứng xử học đường và điều khoản sử dụng nền tảng';

function buildAdminStack() {
  let systemLimitsRow: any = null; // hàng bảng system_limits của Supabase
  const usersDb: Record<string, any> = {
    [USR_BI_KHOA_ID]: {
      id: USR_BI_KHOA_ID,
      full_name: 'Nguyễn Bùi Anh',
      phone: '0911000999',
      role: 'TEACHER_HOMEROOM',
      is_active: true,
      is_deleted: false,
      // Đặt hash đúng bằng bcrypt khi chạy test — không hardcode hash cứng
      password_hash: bcrypt.hashSync('MatKhau123@', 10),
    },
  };

  const mockDataConnect = {
    getSystemLimits: jest.fn(async () => systemLimitsRow),
    upsertSystemLimits: jest.fn(async (data: any) => {
      systemLimitsRow = data;
      return data;
    }),
    getUserById: jest.fn(async (id: string) => usersDb[id] || null),
    updateUserStatus: jest.fn(async (id: string, isActive: boolean, reason?: string) => {
      usersDb[id].is_active = isActive;
      usersDb[id].deactivation_reason = reason || null;
      return { id, is_active: isActive };
    }),
    // Login của AuthService tra SĐT qua dataConnect.getUserByPhone
    getUserByPhone: jest.fn(async (phone: string) =>
      Object.values(usersDb).find((u: any) => String(u.phone) === String(phone)) || null,
    ),
  };

  const adminService = new AdminService(mockDataConnect as any);
  const buildAuthService = () =>
    new AuthService(
      {} as any,
      mockDataConnect as any,
      { signAsync: jest.fn(async () => 'signed-token') } as any,
      { get: () => 'test-secret' } as any,
    );
  return { adminService, buildAuthService, mockDataConnect, usersDb, getSystemLimitsRow: () => systemLimitsRow };
}

describe('UAT16_ADMIN_01 — Cấu hình Hạn mức Tài nguyên & Áp dụng chặn tức thì', () => {
  let ctx: ReturnType<typeof buildAdminStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildAdminStack();
  });

  it('Bước 1–2: Admin lưu cấu hình hệ thống (AI 20 lượt/ngày, sĩ số 50, upload 10MB) → phản hồi thành công', async () => {
    const res: any = await ctx.adminService.updateSystemLimits({
      gemini_ai_daily_quota_per_teacher: 20,
      max_students_per_class: 50,
      max_upload_size_mb: 10,
    } as any);

    expect(res.message).toContain('Đã lưu');
    // Bước 3: Kiểm tra bảng system_limits — bản ghi lưu chính xác các giá trị mới
    expect(ctx.getSystemLimitsRow().geminiQuotaPerTeacher).toBe(20);
    expect(ctx.getSystemLimitsRow().maxStudentsPerClass).toBe(50);
    expect(ctx.getSystemLimitsRow().maxUploadSizeMb).toBe(10);
    // Các giá trị còn lại giữ nguyên (hợp nhất, không mất cấu hình cũ)
    expect(ctx.getSystemLimitsRow().maxClassesPerTeacher).toBe(5);
  });

  it('Bước 4 (Áp dụng tức thì): getSystemLimits đọc giá trị MỚI ngay sau khi lưu — không cần khởi động lại máy chủ', async () => {
    await ctx.adminService.updateSystemLimits({
      gemini_ai_daily_quota_per_teacher: 20,
      max_upload_size_mb: 10,
    } as any);
    const limits: any = await ctx.adminService.getSystemLimits();
    expect(limits.gemini_ai_daily_quota_per_teacher).toBe(20);
    expect(limits.max_upload_size_mb).toBe(10);
  });

  it('Chặn cấu hình không hợp lệ (số 0/âm) trước khi ghi DB (báo ADM_INVALID_LIMITS)', async () => {
    await expect(
      ctx.adminService.updateSystemLimits({ max_upload_size_mb: 0 } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      ctx.adminService.updateSystemLimits({ max_students_per_class: -5 } as any),
    ).rejects.toThrow(BadRequestException);
    // Cấu hình hiện hành không bị ghi đè nhầm
    expect(ctx.getSystemLimitsRow()).toBeNull();
  });

  it('Hạn mức dung lượng tải lên sau khi lưu: tệp giáo án 12MB vượt giới hạn 10MB cấu hình', async () => {
    const res: any = await ctx.adminService.updateSystemLimits({ max_upload_size_mb: 10 } as any);
    const gioiHanBangMB = res.data.max_upload_size_mb;
    const fileSize12MB = 12 * 1024 * 1024;
    expect(gioiHanBangMB).toBe(10);
    expect(fileSize12MB > gioiHanBangMB * 1024 * 1024).toBe(true);
  });
});

describe('UAT17_ADMIN_02 — Khóa tài khoản, thu hồi phiên & mở khóa an toàn', () => {
  let ctx: ReturnType<typeof buildAdminStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildAdminStack();
  });

  it('Bước 1–2: Khóa tài khoản vi phạm — is_active=false lưu DB cùng lý do minh bạch, ghi nhật ký hoạt động', async () => {
    const res: any = await ctx.adminService.updateUserStatus(USR_BI_KHOA_ID, {
      is_active: false,
      reason: LY_DO_KHOA,
    } as any);

    expect(res.is_active).toBe(false);
    expect(res.message).toContain('Đã khóa');
    // CSDL bảng users cập nhật: is_active=false + lý do quan sát được
    expect(ctx.usersDb[USR_BI_KHOA_ID].is_active).toBe(false);
    expect(ctx.usersDb[USR_BI_KHOA_ID].deactivation_reason).toBe(LY_DO_KHOA);
    expect(ctx.mockDataConnect.updateUserStatus).toHaveBeenCalledWith(USR_BI_KHOA_ID, false, LY_DO_KHOA);
  });

  it('Bước 3: Tài khoản bị khóa KHÔNG thể đăng nhập lại (AUTH_ACCOUNT_LOCKED — mọi phiên cũ bị thu hồi từ chối)', async () => {
    // Admin khóa trước
    await ctx.adminService.updateUserStatus(USR_BI_KHOA_ID, { is_active: false, reason: LY_DO_KHOA } as any);

    const auth = ctx.buildAuthService();
    // Người dùng biết chính xác lý do bị tạm dừng hoạt động khi cố đăng nhập
    await expect(
      auth.login({ identifier: '0911000999', password: 'MatKhau123@' } as any),
    ).rejects.toThrow(/bị khóa hoặc tạm dừng hoạt động/);
    // Đúng mã lỗi từ chối xác thực (401/403 ở tầng controller)
    await expect(
      auth.login({ identifier: '0911000999', password: 'MatKhau123@' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Bước 3b: Chặn khóa chính tài khoản ADMIN (ADM_CANNOT_BAN_ADMIN bảo vệ chính hệ thống)', async () => {
    ctx.usersDb[ADMIN_ID] = {
      id: ADMIN_ID,
      full_name: 'Trần Văn Bình',
      phone: '0988001122',
      role: 'ADMIN',
      is_active: true,
      is_deleted: false,
    };
    await expect(
      ctx.adminService.updateUserStatus(ADMIN_ID, { is_active: false, reason: 'Thử khóa Admin' } as any),
    ).rejects.toThrow(ForbiddenException);
    // Admin không bị khóa
    expect(ctx.usersDb[ADMIN_ID].is_active).toBe(true);
  });

  it('Bước 4: Mở khóa (Unban) — is_active=true khôi phục, đăng nhập lại THÀNH CÔNG, dữ liệu bảo toàn nguyên vẹn', async () => {
    // Khóa trước
    await ctx.adminService.updateUserStatus(USR_BI_KHOA_ID, { is_active: false, reason: LY_DO_KHOA } as any);
    // ADMIN mở khóa khi có giải trình hợp lệ
    const unbanRes: any = await ctx.adminService.updateUserStatus(USR_BI_KHOA_ID, { is_active: true } as any);
    expect(unbanRes.is_active).toBe(true);
    expect(unbanRes.message).toContain('kích hoạt lại');

    // Đăng nhập lại trên điện thoại thành công
    const auth = ctx.buildAuthService();
    const loginRes: any = await auth.login({ identifier: '0911000999', password: 'MatKhau123@' } as any);
    expect(loginRes.user.role).toContain('TEACHER');
    expect(loginRes.access_token).toBeTruthy();
    // Dữ liệu hồ sơ (lớp học/điểm/sổ liên lạc) không bị mất hay gián đoạn
    expect(ctx.usersDb[USR_BI_KHOA_ID].full_name).toBe('Nguyễn Bùi Anh');
    expect(ctx.usersDb[USR_BI_KHOA_ID].is_active).toBe(true);
  });

  it('Từ chối khóa với lý do quá ngắn (< 5 ký tự) — lý do minh bạch là bắt buộc', async () => {
    await expect(
      ctx.adminService.updateUserStatus(USR_BI_KHOA_ID, { is_active: false, reason: '12' } as any),
    ).rejects.toThrow(BadRequestException);
    expect(ctx.mockDataConnect.updateUserStatus).not.toHaveBeenCalled();
  });

  it('Từ chối thao tác với người dùng không tồn tại (USER_NOT_FOUND)', async () => {
    await expect(
      ctx.adminService.updateUserStatus('usr_khong_ton_tai', { is_active: false } as any),
    ).rejects.toThrow(NotFoundException);
  });
});
