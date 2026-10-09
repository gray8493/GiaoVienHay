jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
}));
jest.mock('../../apps/api/src/common/firebase/firebase.service', () => ({
  FirebaseService: jest.fn().mockImplementation(() => ({
    auth: { verifyIdToken: jest.fn() },
    messaging: { sendEachForMulticast: jest.fn() },
  })),
}));

import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../../apps/api/src/modules/01-auth/auth.service';
import { RegisterDto, LoginDto, FirebaseVerifyDto, RefreshTokenDto } from '../../apps/api/src/modules/01-auth/dto/auth.dto';
import { UserRole } from '@giaovienhay/shared-types';
import * as bcrypt from 'bcryptjs';

describe('AuthService (Unit Tests UT01 - All 27 Cases)', () => {
  let service: AuthService;
  let mockFirebaseService: any;
  let mockDataConnect: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockFirebaseService = {
      auth: { verifyIdToken: jest.fn() },
    };
    mockDataConnect = {
      getUserByPhone: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUserPassword: jest.fn(),
    };
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_access_token'),
      verifyAsync: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'test_jwt_secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test_jwt_refresh_secret';
        return null;
      }),
    };

    service = new AuthService(
      mockFirebaseService,
      mockDataConnect,
      mockJwtService,
      mockConfigService,
    );
  });

  // PHẦN 1: DTO Validation Cases (TC01 -> TC09)
  describe('UT01_Auth_TC01: Thiếu họ tên khi đăng ký', () => {
    it('báo lỗi validation khi để trống full_name', async () => {
      const dto = plainToInstance(RegisterDto, { full_name: '', phone: '0912345678', password: 'Password123@', role: UserRole.PARENT });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'full_name')).toBe(true);
    });
  });

  describe('UT01_Auth_TC02: Thiếu số điện thoại khi đăng ký', () => {
    it('báo lỗi validation khi thiếu phone', async () => {
      const dto = plainToInstance(RegisterDto, { full_name: 'Nguyễn Văn An', phone: '', password: 'Password123@', role: UserRole.PARENT });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'phone')).toBe(true);
    });
  });

  describe('UT01_Auth_TC03: Thiếu mật khẩu khi đăng ký', () => {
    it('báo lỗi validation khi để trống password', async () => {
      const dto = plainToInstance(RegisterDto, { full_name: 'Nguyễn Văn An', phone: '0912345678', password: '', role: UserRole.PARENT });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'password')).toBe(true);
    });
  });

  describe('UT01_Auth_TC04: Giáo viên thiếu tên trường hoặc môn giảng dạy', () => {
    it('báo lỗi validation khi role là TEACHER_HOMEROOM mà thiếu school_name', async () => {
      const dto = plainToInstance(RegisterDto, {
        full_name: 'Cô Lan',
        phone: '0912345678',
        password: 'Password123@',
        role: UserRole.TEACHER_HOMEROOM,
        school_name: '',
        teaching_subjects: ['MATH'],
      });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'school_name')).toBe(true);
    });
  });

  describe('UT01_Auth_TC05: Để trống thông tin khi đăng nhập', () => {
    it('báo lỗi validation khi thiếu phone hoặc password trong LoginDto', async () => {
      const dto = plainToInstance(LoginDto, { phone: '', password: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('UT01_Auth_TC06: Để trống id_token khi xác thực Firebase', () => {
    it('báo lỗi validation khi id_token rỗng', async () => {
      const dto = plainToInstance(FirebaseVerifyDto, { id_token: '' });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'id_token')).toBe(true);
    });
  });

  describe('UT01_Auth_TC07: Để trống refresh_token khi làm mới phiên', () => {
    it('báo lỗi validation khi refresh_token rỗng', async () => {
      const dto = plainToInstance(RefreshTokenDto, { refresh_token: '' });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'refresh_token')).toBe(true);
    });
  });

  describe('UT01_Auth_TC08: Mật khẩu không đủ độ dài tối thiểu', () => {
    it('báo lỗi validation khi mật khẩu dưới 6 ký tự', async () => {
      const dto = plainToInstance(RegisterDto, { full_name: 'Nguyễn Văn An', phone: '0912345678', password: '123', role: UserRole.PARENT });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'password')).toBe(true);
    });
  });

  describe('UT01_Auth_TC09: Vai trò người dùng không hợp lệ', () => {
    it('báo lỗi validation khi role không thuộc enum UserRole', async () => {
      const dto = plainToInstance(RegisterDto, { full_name: 'Nguyễn Văn An', phone: '0912345678', password: 'Password123@', role: 'INVALID_ROLE' as any });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'role')).toBe(true);
    });
  });

  // PHẦN 2: Service Error Handling (TC10 -> TC16)
  describe('UT01_Auth_TC10: Đăng ký khi số điện thoại đã tồn tại', () => {
    it('ném ConflictException với mã USER_PHONE_EXISTS', async () => {
      mockDataConnect.getUserByPhone.mockResolvedValue({ id: 'usr_01', phone: '0988776655' });
      await expect(service.register({ full_name: 'Trùng SĐT', phone: '0988776655', password: 'Password123@', role: UserRole.PARENT })).rejects.toThrow(ConflictException);
    });
  });

  describe('UT01_Auth_TC11: Đăng nhập sai mật khẩu', () => {
    it('ném UnauthorizedException AUTH_INVALID_CREDENTIALS', async () => {
      const hash = await bcrypt.hash('CorrectPass', 10);
      mockDataConnect.getUserByPhone.mockResolvedValue({ id: 'usr_01', phone: '0988776655', password_hash: hash, is_active: true, is_deleted: false });
      await expect(service.login({ phone: '0988776655', password: 'WrongPass' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT01_Auth_TC12: Chặn đăng nhập khi tài khoản bị khóa', () => {
    it('ném UnauthorizedException AUTH_ACCOUNT_LOCKED', async () => {
      mockDataConnect.getUserByPhone.mockResolvedValue({ id: 'usr_01', phone: '0988776655', is_active: false });
      await expect(service.login({ phone: '0988776655', password: 'AnyPassword' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT01_Auth_TC13: Xác thực Firebase Token không hợp lệ', () => {
    it('xử lý từ chối hoặc báo lỗi khi token không hợp lệ', async () => {
      mockFirebaseService.auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));
      await expect(service.firebaseVerify({ id_token: 'invalid_token' })).rejects.toThrow();
    });
  });

  describe('UT01_Auth_TC14: Refresh Token đã hết hạn', () => {
    it('ném UnauthorizedException khi refresh token hết hạn', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('TokenExpiredError'));
      await expect(service.refreshToken({ refresh_token: 'expired_token' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT01_Auth_TC15: Đăng xuất từ chối khi access token không hợp lệ', () => {
    it('ném UnauthorizedException khi token không hợp lệ', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid'));
      await expect(service.logout('invalid_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT01_Auth_TC16: Xử lý ngoại lệ lỗi hệ thống', () => {
    it('ném lỗi an toàn khi cơ sở dữ liệu gặp sự cố', async () => {
      mockDataConnect.getUserByPhone.mockRejectedValue(new Error('Database Connection Error'));
      await expect(service.login({ phone: '0988776655', password: 'Password123@' })).rejects.toThrow();
    });
  });

  // PHẦN 3: Thành công & Các trường hợp nâng cao (TC17 -> TC27)
  describe('UT01_Auth_TC17: Đăng ký tài khoản giáo viên thành công', () => {
    it('tạo tài khoản giáo viên và cấp token', async () => {
      mockDataConnect.getUserByPhone.mockResolvedValue(null);
      mockDataConnect.createUser.mockResolvedValue(true);
      const res = await service.register({ full_name: 'Cô Nguyễn Lan', phone: '0912345678', password: 'Password123@', role: UserRole.TEACHER_HOMEROOM, school_name: 'TH Chu Văn An', teaching_subjects: ['MATH'] });
      expect(res.user.phone).toBe('0912345678');
      expect(res.access_token).toBeDefined();
    });
  });

  describe('UT01_Auth_TC18: Đăng ký tài khoản phụ huynh thành công', () => {
    it('tạo tài khoản phụ huynh thành công', async () => {
      mockDataConnect.getUserByPhone.mockResolvedValue(null);
      mockDataConnect.createUser.mockResolvedValue(true);
      const res = await service.register({ full_name: 'Bác Trần Văn Nam', phone: '0933445566', password: 'Password123@', role: UserRole.PARENT });
      expect(res.user.role).toBe(UserRole.PARENT);
    });
  });

  describe('UT01_Auth_TC19: Đăng nhập Giáo viên chủ nhiệm thành công', () => {
    it('đăng nhập giáo viên thành công và trả về access token cùng thông tin', async () => {
      const hash = await bcrypt.hash('CorrectPass@123', 10);
      mockDataConnect.getUserByPhone.mockResolvedValue({ id: 'usr_01', phone: '0988776655', password_hash: hash, is_active: true, is_deleted: false, role: UserRole.TEACHER_HOMEROOM });
      const res = await service.login({ phone: '0988776655', password: 'CorrectPass@123' });
      expect(res.access_token).toBe('mock_jwt_access_token');
      expect(res.user.role).toBe(UserRole.TEACHER_HOMEROOM);
    });
  });

  describe('UT01_Auth_TC20: Đăng nhập Phụ huynh học sinh thành công', () => {
    it('đăng nhập phụ huynh thành công và trả về access token', async () => {
      const hash = await bcrypt.hash('ParentPass@123', 10);
      mockDataConnect.getUserByPhone.mockResolvedValue({ id: 'usr_parent', phone: '0933445566', password_hash: hash, is_active: true, is_deleted: false, role: UserRole.PARENT });
      const res = await service.login({ phone: '0933445566', password: 'ParentPass@123' });
      expect(res.access_token).toBe('mock_jwt_access_token');
      expect(res.user.role).toBe(UserRole.PARENT);
    });
  });

  describe('UT01_Auth_TC21: Xác thực Firebase ID Token thành công', () => {
    it('giải mã token và trả về thông tin đăng nhập', async () => {
      mockFirebaseService.auth.verifyIdToken.mockResolvedValue({ uid: 'fb_123', phone_number: '+84912345678' });
      mockDataConnect.getUserByPhone.mockResolvedValue({ id: 'usr_fb', phone: '0912345678', is_active: true, role: UserRole.PARENT });
      const res = await service.firebaseVerify({ id_token: 'valid_fb_token' });
      expect(res.user.phone).toBe('0912345678');
    });
  });

  describe('UT01_Auth_TC22: Làm mới phiên làm việc bằng Refresh Token', () => {
    it('cấp mới access_token thành công', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'usr_01', phone: '0988776655', role: UserRole.TEACHER_HOMEROOM });
      mockDataConnect.getUserById.mockResolvedValue({ id: 'usr_01', phone: '0988776655', is_active: true, is_deleted: false });
      const res = await service.refreshToken({ refresh_token: 'valid_refresh_token' });
      expect(res.access_token).toBeDefined();
    });
  });

  describe('UT01_Auth_TC23: Đăng xuất khỏi hệ thống thành công', () => {
    it('thu hồi phiên làm việc và trả về thông báo thành công', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'usr_01' });
      const res = await service.logout('valid_token');
      expect(res.message).toBe('Đăng xuất tài khoản thành công');
    });
  });

  describe('UT01_Auth_TC24: Chặn đăng nhập khi tài khoản đã bị xóa mềm', () => {
    it('từ chối đăng nhập khi is_deleted = true', async () => {
      mockDataConnect.getUserByPhone.mockResolvedValue({ id: 'usr_deleted', phone: '0988776655', is_deleted: true, is_active: true });
      await expect(service.login({ phone: '0988776655', password: 'Password123@' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT01_Auth_TC25: Đăng nhập khi tài khoản không tồn tại', () => {
    it('ném UnauthorizedException 401 khi tài khoản hoàn toàn không có trong DB', async () => {
      mockDataConnect.getUserByPhone.mockResolvedValue(null);
      await expect(service.login({ phone: '0999999999', password: 'Password123@' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT01_Auth_TC26: Firebase verify tự động tạo tài khoản khi chưa có trong DB', () => {
    it('tự tạo hồ sơ phụ huynh mới khi SĐT chưa có trong DB', async () => {
      mockFirebaseService.auth.verifyIdToken.mockResolvedValue({ uid: 'fb_new', phone_number: '+84977889900' });
      mockDataConnect.getUserByPhone.mockResolvedValue(null);
      mockDataConnect.createUser.mockResolvedValue(true);
      const res = await service.firebaseVerify({ id_token: 'valid_new_token' });
      expect(res.user.phone).toBe('0977889900');
    });
  });

  describe('UT01_Auth_TC27: Refresh Token không tồn tại user trong hệ thống', () => {
    it('ném UnauthorizedException khi user của token không tồn tại', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'usr_ghost', phone: '0988776655' });
      mockDataConnect.getUserById.mockResolvedValue(null);
      await expect(service.refreshToken({ refresh_token: 'ghost_refresh_token' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
