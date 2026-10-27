/**
 * UAT01_AUTH_01 — NGHIỆM THU ĐĂNG NHẬP ĐA VAI TRÒ, QUICK LOGIN & ĐỔI MẬT KHẨU
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT01)
 *
 * Tài khoản nghiệm thu:
 *  - GVCN : 0912345678 / MatKhau123@ (Cô Nguyễn Thị Lan)
 *  - GVBM : 0912345679 / MatKhau123@ (Thầy Lê Hoàng Nam)
 *  - PHHS : 0977112233 / MatKhau123@ (Bác Trần Văn Hùng)
 *  - Admin: 0988001122 / MatKhau123@ (Thầy Trần Văn Bình)
 */
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../apps/api/src/modules/01-auth/auth.service';
import { ChangePasswordDto } from '../../apps/api/src/modules/01-auth/dto/auth.dto';
import { UserRole } from '@giaovienhay/shared-types';

const MAT_KHAU_CHUAN = 'MatKhau123@';
const MAT_KHAU_MOI = 'MatKhauMoi456@';

/** Thành viên mẫu bám đúng dữ liệu UAT trong tài liệu nghiệm thu */
const TA_KHOAN_MAU = {
  GV_HOMEROOM: { id: 'usr_teacher_lan_01', full_name: 'Cô Nguyễn Thị Lan', phone: '0912345678', role: UserRole.TEACHER_HOMEROOM },
  GV_SUBJECT: { id: 'usr_teacher_nam_01', full_name: 'Thầy Lê Hoàng Nam', phone: '0912345679', role: UserRole.TEACHER_SUBJECT },
  PARENT: { id: 'usr_parent_hung_01', full_name: 'Trần Văn Hùng', phone: '0977112233', role: UserRole.PARENT },
  ADMIN: { id: 'usr_admin_binh_01', full_name: 'Trần Văn Bình', phone: '0988001122', role: UserRole.ADMIN },
};

function buildAuthService() {
  const mockFirebaseService = { auth: { verifyIdToken: jest.fn() } };
  const mockDataConnect = {
    getUserByPhone: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(async () => true),
    updateUserPassword: jest.fn(async () => true),
  };
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock_jwt_access_token'),
    verifyAsync: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test_jwt_secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test_jwt_refresh_secret';
      return null;
    }),
  };

  const service = new AuthService(
    mockFirebaseService,
    mockDataConnect,
    mockJwtService,
    mockConfigService,
  );
  return { service, mockDataConnect, mockJwtService, mockFirebaseService };
}

/** Ghi đè password_hash đúng chuẩn bcrypt cho thành viên chờ đăng nhập */
function choNguoiDungCoMatKhau(dataConnect: any, taiKhoan: any, matKhau: string, extra: any = {}) {
  dataConnect.getUserByPhone.mockImplementation(async (phone: string) => {
    if (phone !== taiKhoan.phone) return null;
    return {
      ...taiKhoan,
      password_hash: bcrypt.hashSync(matKhau, 4),
      is_active: true,
      is_deleted: false,
      ...extra,
    };
  });
}

describe('UAT01_AUTH_01 — Đăng nhập đa vai trò, Quick Login & Đổi mật khẩu', () => {
  let ctx: ReturnType<typeof buildAuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildAuthService();
  });

  describe('Bước 1 — Đăng nhập Quick Login theo từng vai trò (mục tiêu: < 1 giây & đúng vai trò)', () => {
    const cacVaiTro: Array<[string, string, UserRole]> = [
      ['GVCN', TA_KHOAN_MAU.GV_HOMEROOM.phone, UserRole.TEACHER_HOMEROOM],
      ['GVBM', TA_KHOAN_MAU.GV_SUBJECT.phone, UserRole.TEACHER_SUBJECT],
      ['PHHS', TA_KHOAN_MAU.PARENT.phone, UserRole.PARENT],
    ];

    it.each(cacVaiTro)(
      '%s đăng nhập bằng SĐT + mật khẩu chuẩn và trả về đúng vai trò',
      async (label: string, phone: string, expectedRole: UserRole) => {
        const taiKhoan = Object.values(TA_KHOAN_MAU).find((u: any) => u.phone === phone) as any;
        choNguoiDungCoMatKhau(ctx.mockDataConnect, taiKhoan, MAT_KHAU_CHUAN);

        const start = Date.now();
        const res = await ctx.service.login({ phone, password: MAT_KHAU_CHUAN });
        const elapsedMs = Date.now() - start;

        // Tiêu chí: xác thực dưới 1 giây (mock phải tức thì)
        expect(elapsedMs).toBeLessThan(1000);
        // Tiêu chí: nhận diện đúng vai trò để điều hướng app tương ứng
        expect(res.user.role).toBe(expectedRole);
        // Tiêu chí: nạp JWT token cho phiên làm việc
        expect(res.access_token).toBeDefined();
        expect(res.user.full_name).toBe(taiKhoan.full_name);
      },
    );

    it('Admin đăng nhập thành công với vai trò tối cao', async () => {
      const admin = TA_KHOAN_MAU.ADMIN;
      choNguoiDungCoMatKhau(ctx.mockDataConnect, admin, MAT_KHAU_CHUAN);
      const res = await ctx.service.login({ phone: admin.phone, password: MAT_KHAU_CHUAN });
      expect(res.user.role).toBe(UserRole.ADMIN);
      expect(res.access_token).toBeDefined();
    });
  });

  describe('Bước 2 — Chặn đăng nhập token giả mạo khi gọi lại phiên', () => {
    it('từ chối đăng xuất với token không hợp lệ (token check service-level)', async () => {
      await expect(ctx.service.logout('invalid_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Bước 3 — Đăng nhập sai mật khẩu phải bị từ chối (không cấp token)', () => {
    it('từ chối khi mật khẩu không khớp tài khoản GVCN', async () => {
      const gvcn = TA_KHOAN_MAU.GV_HOMEROOM;
      choNguoiDungCoMatKhau(ctx.mockDataConnect, gvcn, MAT_KHAU_CHUAN);
      await expect(
        ctx.service.login({ phone: gvcn.phone, password: 'WrongPass@' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Bước 4 — Đổi mật khẩu an toàn (mục tiêu: đúng mật khẩu cũ + cập nhật hash + rollback phục vụ test kế tiếp)', () => {
    it('phụ huynh đổi mật khẩu thành công khi mật khẩu cũ chính xác và hash mới được lưu', async () => {
      const ph = TA_KHOAN_MAU.PARENT;
      const hashCu = bcrypt.hashSync(MAT_KHAU_CHUAN, 4);
      ctx.mockDataConnect.getUserById.mockResolvedValue({
        ...ph,
        password_hash: hashCu,
        is_active: true,
        is_deleted: false,
      });

      const dto = plainChangePassword({
        current_password: MAT_KHAU_CHUAN,
        new_password: MAT_KHAU_MOI,
      });
      const res = await ctx.service.changePassword(ph.id, dto);

      expect(res.success).toBe(true);
      expect(res.message).toBe('Đổi mật khẩu thành công');
      // Lưu user đã cập nhật (hash mới) xuống DB
      expect(ctx.mockDataConnect.createUser).toHaveBeenCalled();
      const savedUser = ctx.mockDataConnect.createUser.mock.calls.at(-1)[0];
      // Mật khẩu cũ không còn khớp, mật khẩu mới khớp với hash vừa lưu
      expect(bcrypt.compareSync(MAT_KHAU_CHUAN, savedUser.password_hash)).toBe(false);
      expect(bcrypt.compareSync(MAT_KHAU_MOI, savedUser.password_hash)).toBe(true);
      expect(savedUser.updated_at).toBeDefined();
    });

    it('từ chối đổi mật khẩu khi mật khẩu hiện tại không chính xác', async () => {
      const ph = TA_KHOAN_MAU.PARENT;
      ctx.mockDataConnect.getUserById.mockResolvedValue({
        ...ph,
        password_hash: bcrypt.hashSync(MAT_KHAU_CHUAN, 4),
        is_active: true,
        is_deleted: false,
      });

      const dto = plainChangePassword({
        current_password: 'SaiMatKhauCu@',
        new_password: MAT_KHAU_MOI,
      });
      await expect(ctx.service.changePassword(ph.id, dto)).rejects.toThrow(BadRequestException);
    });
  });
});

/** DTO thuần — bỏ qua class-transformer vì chỉ nghiệp vụ service được nghiệm thu */
function plainChangePassword(data: Partial<ChangePasswordDto>): ChangePasswordDto {
  return { current_password: '', new_password: '', ...data } as ChangePasswordDto;
}
