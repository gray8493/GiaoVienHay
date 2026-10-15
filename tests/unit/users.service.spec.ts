jest.mock('@nestjs/cache-manager', () => ({
  CACHE_MANAGER: 'CACHE_MANAGER',
}));

import { NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../../apps/api/src/modules/02-users/users.service';
import { FirebaseDataConnectService } from '../../apps/api/src/common/supabase/supabase.service';
import { UpdateProfileDto, RegisterDeviceTokenDto } from '../../apps/api/src/modules/02-users/dto/users.dto';
import { UserRole, ErrorCode } from '@giaovienhay/shared-types';

describe('UsersService (Unit Tests UT02 - All 15 Cases)', () => {
  let service: UsersService;
  let mockDataConnect: Partial<Record<keyof FirebaseDataConnectService, jest.Mock>>;
  let mockCacheManager: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    mockDataConnect = {
      getUserById: jest.fn(),
      createUser: jest.fn(),
      softDeleteUser: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    service = new UsersService(mockDataConnect as any, mockCacheManager as any);
  });

  describe('UT02_Users_TC01: Lấy thông tin hồ sơ cá nhân của người dùng đang đăng nhập', () => {
    it('trả về thông tin hồ sơ hợp lệ không chứa password_hash', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_teacher_lan',
        email: 'teacher.lan@school.edu.vn',
        phone: '0912345678',
        fullName: 'Nguyễn Thị Lan',
        school_name: 'Trường Tiểu Học Chu Văn An',
        role: UserRole.TEACHER_HOMEROOM,
        teaching_subjects: ['MATH', 'LIT', 'ETHICS'],
        is_active: true,
        password_hash: 'secret_hash',
      });

      const profile = await service.getMe('usr_teacher_lan');
      expect(profile.id).toBe('usr_teacher_lan');
      expect(profile.fullName).toBe('Nguyễn Thị Lan');
      expect((profile as any).password_hash).toBeUndefined();
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('UT02_Users_TC02: Cập nhật hồ sơ và danh sách môn học giảng dạy hợp lệ', () => {
    it('cập nhật thông tin thành công và xóa cache cũ', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_teacher_lan',
        fullName: 'Nguyễn Thị Lan',
        school_name: 'TH Chu Văn An',
        is_active: true,
      });
      mockDataConnect.createUser!.mockResolvedValue(true);

      const dto: UpdateProfileDto = {
        full_name: 'Nguyễn Thị Lan',
        school_name: 'Trường Tiểu Học Chu Văn An',
        teaching_subjects: ['MATH', 'LIT', 'ETHICS'],
      };

      const result = await service.updateProfile('usr_teacher_lan', dto);
      expect(result.school_name).toBe('Trường Tiểu Học Chu Văn An');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user_profile_usr_teacher_lan');
    });
  });

  describe('UT02_Users_TC03: Từ chối cập nhật môn học không hợp lệ theo chương trình GDPT', () => {
    it('ném BadRequestException khi môn học không hợp lệ', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_teacher_lan',
        fullName: 'Nguyễn Thị Lan',
        is_active: true,
      });

      const dto: UpdateProfileDto = {
        teaching_subjects: ['INVALID_CODE_XYZ'],
      };

      await expect(service.updateProfile('usr_teacher_lan', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT02_Users_TC04: Đăng ký và làm mới thiết bị nhận thông báo đẩy FCM', () => {
    it('lưu thành công token thiết bị FCM', async () => {
      const dto: RegisterDeviceTokenDto = {
        device_token: 'fcm_tok_abc123xyz789',
        device_type: 'ANDROID',
      };

      const result = await service.registerDeviceToken('usr_01', dto);
      expect(result.message).toContain('thành công');
      expect(result.device_token).toBe('fcm_tok_abc123xyz789');
    });
  });

  describe('UT02_Users_TC05: Từ chối đăng ký thiết bị khi gửi token rỗng', () => {
    it('báo lỗi validation khi device_token rỗng', async () => {
      const dto = plainToInstance(RegisterDeviceTokenDto, {
        device_token: '',
        device_type: 'IOS',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'device_token')).toBe(true);

      await expect(
        service.registerDeviceToken('usr_01', {
          device_token: '',
          device_type: 'IOS',
        })
      ).rejects.toThrow(BadRequestException);

      try {
        await service.registerDeviceToken('usr_01', {
          device_token: '',
          device_type: 'IOS',
        });
      } catch (e: any) {
        expect(e.response.error_code).toBe('EMPTY_DEVICE_TOKEN');
      }
    });
  });

  describe('UT02_Users_TC06: Từ chối cập nhật khi họ và tên quá ngắn dưới 2 ký tự hoặc để trống', () => {
    it('báo lỗi validation khi full_name chỉ có 1 ký tự', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        full_name: 'A',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'full_name')).toBe(true);
    });
  });

  describe('UT02_Users_TC07: Từ chối cập nhật ảnh đại diện với đường dẫn URL sai định dạng', () => {
    it('báo lỗi validation khi avatar_url không phải định dạng URL', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        avatar_url: 'duong_dan_anh_khong_hop_le_123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'avatar_url')).toBe(true);
    });
  });

  describe('UT02_Users_TC08: Từ chối thao tác do không có token xác thực hoặc token đã hết hạn', () => {
    it('từ chối khi userId rỗng hoặc chưa xác thực', async () => {
      await expect(service.getMe('')).rejects.toThrow();
    });
  });

  describe('UT02_Users_TC09: Chặn người dùng thao tác khi tài khoản đang ở trạng thái bị tạm khóa', () => {
    it('ném ForbiddenException 403 khi tài khoản is_active = false', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_teacher_locked',
        fullName: 'Giáo viên bị khóa',
        is_active: false,
      });

      await expect(
        service.updateProfile('usr_teacher_locked', { school_name: 'TH Chu Văn An' })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT02_Users_TC10: Từ chối yêu cầu khi hồ sơ người dùng không tồn tại trong cơ sở dữ liệu', () => {
    it('ném NotFoundException khi không tìm thấy user qua getMe', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockDataConnect.getUserById!.mockResolvedValue(null);

      await expect(service.getMe('usr_not_found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT02_Users_TC11: Xử lý lỗi hệ thống khi cơ sở dữ liệu gặp sự cố', () => {
    it('bắn ra lỗi khi cơ sở dữ liệu bị ngắt quãng', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockDataConnect.getUserById!.mockImplementation(() => {
        throw new Error('DATABASE_SERVICE_UNAVAILABLE');
      });

      await expect(service.getMe('usr_01')).rejects.toThrow();
    });
  });

  describe('UT02_Users_TC12: Truy xuất hồ sơ từ In-memory RAM Cache và tự động xóa cache khi cập nhật', () => {
    it('trả về từ RAM Cache khi đã có sẵn trong cache', async () => {
      const cached = { id: 'usr_01', fullName: 'User Cached', school_name: 'THCS Thăng Long' };
      mockCacheManager.get.mockResolvedValue(cached);

      const res = await service.getMe('usr_01');
      expect(res).toEqual(cached);
      expect(mockDataConnect.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('UT02_Users_TC13: Xóa mềm tài khoản người dùng thành công (Soft Delete)', () => {
    it('đánh dấu xóa mềm, xóa cache profile', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_01',
        fullName: 'Thầy Nguyễn Văn An',
        is_active: true,
      });
      mockDataConnect.softDeleteUser!.mockResolvedValue(true);

      const result = await service.deleteUser('usr_01');
      expect(result.is_deleted).toBe(true);
      expect(mockDataConnect.softDeleteUser).toHaveBeenCalledWith('usr_01');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user_profile_usr_01');
    });
  });

  describe('UT02_Users_TC14: Xử lý trạng thái rỗng an toàn khi giáo viên mới chưa đăng ký danh sách môn học giảng dạy', () => {
    it('trả về 200 OK và teaching_subjects là mảng rỗng an toàn', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_teacher_fresh',
        fullName: 'Cô Nguyễn Thu Trang',
        phone: '0911223344',
        role: UserRole.TEACHER_SUBJECT,
        school_name: 'THCS Cầu Giấy',
        teaching_subjects: [],
        is_active: true,
      });

      const res = await service.getMe('usr_teacher_fresh');
      expect(res.teaching_subjects).toEqual([]);
      expect(res.school_name).toBe('THCS Cầu Giấy');
    });
  });

  describe('UT02_Users_TC15: Từ chối tra cứu hồ sơ khi mã người dùng không tồn tại trong cơ sở dữ liệu (USER_NOT_FOUND - 404)', () => {
    it('ném NotFoundException 404 với error_code USER_NOT_FOUND', async () => {
      mockDataConnect.getUserById!.mockResolvedValue(null);

      try {
        await service.getUserProfileById('usr_not_exist_9999');
        fail('Phải ném NotFoundException');
      } catch (err: any) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.getResponse().error_code).toBe(ErrorCode.USER_NOT_FOUND);
      }
    });
  });
});
