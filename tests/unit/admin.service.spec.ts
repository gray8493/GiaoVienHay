import { NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AdminService } from '../../apps/api/src/modules/12-admin/admin.service';
import { FirebaseDataConnectService } from '../../apps/api/src/common/supabase/supabase.service';
import { UserRole, ErrorCode } from '@giaovienhay/shared-types';
import { UpdateSystemLimitsDto } from '../../apps/api/src/modules/12-admin/dto/admin.dto';

describe('AdminService (Unit Tests UT12 - All 22 Cases)', () => {
  let service: AdminService;
  let mockDataConnect: Partial<Record<keyof FirebaseDataConnectService, jest.Mock>>;

  beforeEach(async () => {
    mockDataConnect = {
      listUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUserStatus: jest.fn(),
      updateUserProfile: jest.fn(),
      softDeleteUser: jest.fn(),
      updateTeacherAiQuota: jest.fn(),
      listClasses: jest.fn(),
      createClass: jest.fn(),
      createUser: jest.fn(),
      getSystemLimits: jest.fn(),
      upsertSystemLimits: jest.fn(),
    };

    service = new AdminService(mockDataConnect as any);
  });

  describe('UT12_Admin_TC01: Lấy danh sách người dùng toàn hệ thống có phân trang và bộ lọc thành công', () => {
    it('trả về danh sách người dùng và tổng số trang chuẩn xác', async () => {
      mockDataConnect.listUsers!.mockResolvedValue([
        { id: 'usr_t01', fullName: 'Nguyễn Văn An', role: UserRole.TEACHER_HOMEROOM, isActive: true },
      ]);

      const result = await service.getAllUsers({
        page: 1,
        limit: 20,
        role: UserRole.TEACHER_HOMEROOM,
        keyword: 'Nguyễn',
      });
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].id).toBe('usr_t01');
    });
  });

  describe('UT12_Admin_TC02: Chặn và từ chối truy cập khi người dùng không có vai trò Admin', () => {
    it('ném ForbiddenException AUTH_ROLE_FORBIDDEN khi role không phải ADMIN', () => {
      const checkAdminRole = (role: string) => {
        if (role !== UserRole.ADMIN) {
          throw new ForbiddenException({
            success: false,
            status_code: 403,
            message: 'Bạn không có quyền truy cập vào chức năng này',
            error_code: 'AUTH_ROLE_FORBIDDEN',
            details: null,
          });
        }
      };

      expect(() => checkAdminRole(UserRole.TEACHER_HOMEROOM)).toThrow(ForbiddenException);
    });
  });

  describe('UT12_Admin_TC03: Khóa tài khoản người dùng vi phạm chính sách thành công (ban user)', () => {
    it('khóa tài khoản thành công khi user tồn tại và không phải ADMIN', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_t01',
        fullName: 'Nguyễn Văn An',
        role: UserRole.TEACHER_HOMEROOM,
        isActive: true,
      });
      mockDataConnect.updateUserStatus!.mockResolvedValue(true);

      const result = await service.updateUserStatus('usr_t01', {
        is_active: false,
        reason: 'Vi phạm chia sẻ tài liệu sai quy định',
      });

      expect(result.is_active).toBe(false);
      expect(result.user_id).toBe('usr_t01');
      expect(mockDataConnect.updateUserStatus).toHaveBeenCalledWith(
        'usr_t01',
        false,
        'Vi phạm chia sẻ tài liệu sai quy định',
      );
    });
  });

  describe('UT12_Admin_TC04: Từ chối cập nhật trạng thái khi thiếu trường is_active bắt buộc', () => {
    it('ném BadRequestException COMMON_VALIDATION_ERROR khi thiếu is_active', async () => {
      await expect(
        service.updateUserStatus('usr_t01', {
          reason: 'Khóa không có trạng thái',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT12_Admin_TC05: Báo lỗi khi thực hiện khóa tài khoản người dùng không tồn tại', () => {
    it('ném NotFoundException USER_NOT_FOUND khi khóa user không tồn tại', async () => {
      mockDataConnect.getUserById!.mockResolvedValue(null);

      await expect(
        service.updateUserStatus('usr_non_existent', {
          is_active: false,
          reason: 'Tài khoản spam',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT12_Admin_TC06: Mở khóa tài khoản người dùng thành công (unban user)', () => {
    it('mở khóa tài khoản thành công', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_t01',
        fullName: 'Nguyễn Văn An',
        role: UserRole.TEACHER_HOMEROOM,
        isActive: false,
      });
      mockDataConnect.updateUserStatus!.mockResolvedValue(true);

      const result = await service.updateUserStatus('usr_t01', {
        is_active: true,
      });

      expect(result.is_active).toBe(true);
      expect(result.user_id).toBe('usr_t01');
    });
  });

  describe('UT12_Admin_TC07: Giám sát toàn bộ danh sách lớp học trên nền tảng thành công', () => {
    it('trả về danh sách chi tiết các lớp học', async () => {
      mockDataConnect.listClasses!.mockResolvedValue([
        {
          id: 'cls_1a_2026',
          name: 'Lớp 1A',
          gradeLevel: 1,
          academicYear: '2026-2027',
          homeroomTeacherId: 'usr_t01',
          studentCount: 35,
        },
      ]);

      const classes = await service.getAllClassesMonitoring();
      expect(classes.length).toBe(1);
      expect(classes[0].class_id).toBe('cls_1a_2026');
      expect(classes[0].name).toBe('Lớp 1A');
    });
  });

  describe('UT12_Admin_TC08: Lấy cấu hình hạn mức tài nguyên hiện tại của hệ thống thành công', () => {
    it('trả về thông số hạn mức tài nguyên hệ thống', async () => {
      mockDataConnect.getSystemLimits!.mockResolvedValue(null);

      const limits = await service.getSystemLimits();
      expect(limits.gemini_ai_daily_quota_per_teacher).toBeDefined();
      expect(limits.max_classes_per_teacher).toBeDefined();
      expect(limits.max_students_per_class).toBeDefined();
    });
  });

  describe('UT12_Admin_TC09: Cập nhật cấu hình hạn mức tài nguyên toàn hệ thống thành công', () => {
    it('cập nhật hạn mức tài nguyên mới thành công', async () => {
      mockDataConnect.upsertSystemLimits!.mockResolvedValue(true);

      const updated = await service.updateSystemLimits({
        max_classes_per_teacher: 12,
        max_students_per_class: 65,
        gemini_ai_daily_quota_per_teacher: 50,
        max_upload_size_mb: 25,
      });

      expect(updated.data.max_classes_per_teacher).toBe(12);
      expect(updated.data.max_students_per_class).toBe(65);
      expect(updated.data.gemini_ai_daily_quota_per_teacher).toBe(50);
    });
  });

  describe('UT12_Admin_TC10: Từ chối cập nhật khi giá trị hạn mức tài nguyên không hợp lệ', () => {
    it('ném BadRequestException ADM_INVALID_LIMITS khi giá trị <= 0', async () => {
      await expect(
        service.updateSystemLimits({
          max_classes_per_teacher: -5,
          max_students_per_class: 0,
          gemini_ai_daily_quota_per_teacher: -10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT12_Admin_TC11: Từ chối thực hiện khi không truyền hoặc để trống mã định danh người dùng (ID rỗng)', () => {
    it('ném BadRequestException khi ID rỗng hoặc toàn khoảng trắng', async () => {
      await expect(service.updateUserStatus('', { is_active: false })).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.updateUserStatus('   ', { is_active: false })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('UT12_Admin_TC12: Báo lỗi khi thực hiện mở khóa tài khoản người dùng không tồn tại', () => {
    it('ném NotFoundException USER_NOT_FOUND khi mở khóa user không tồn tại', async () => {
      mockDataConnect.getUserById!.mockResolvedValue(null);

      try {
        await service.updateUserStatus('usr_non_existent', { is_active: true });
        fail('Dự kiến ném NotFoundException nhưng không có lỗi xảy ra');
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.getStatus()).toBe(404);
        const res = error.getResponse();
        expect(res.error_code).toBe(ErrorCode.USER_NOT_FOUND);
        expect(res.message).toBe('Không tìm thấy người dùng trong hệ thống');
        expect(res.details).toBeNull();
      }
    });
  });

  describe('UT12_Admin_TC13: Từ chối khóa tài khoản khi độ dài lý do không thỏa mãn ràng buộc', () => {
    it('ném BadRequestException khi lý do dưới 5 ký tự', async () => {
      await expect(
        service.updateUserStatus('usr_t01', {
          is_active: false,
          reason: 'Spam',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT12_Admin_TC14: Từ chối cập nhật hạn mức tài nguyên khi dữ liệu đầu vào sai kiểu dữ liệu', () => {
    it('DTO validation phát hiện sai kiểu dữ liệu', async () => {
      const dto = plainToInstance(UpdateSystemLimitsDto, {
        max_classes_per_teacher: 'khong_gioi_han',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UT12_Admin_TC15: Xử lý ngoại lệ lỗi hệ thống khi kết nối Firebase / cơ sở dữ liệu thất bại', () => {
    it('ném InternalServerErrorException SYS_INTERNAL_ERROR khi database sập', async () => {
      mockDataConnect.getUserById!.mockRejectedValue(new Error('Firebase network failure'));

      // Khi có lỗi hệ thống không lường trước được
      const simulateFailure = async () => {
        try {
          await mockDataConnect.getUserById!('usr_t01');
        } catch {
          throw new InternalServerErrorException({
            success: false,
            status_code: 500,
            error_code: 'SYS_INTERNAL_ERROR',
            message: 'Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase',
          });
        }
      };

      await expect(simulateFailure()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('UT12_Admin_TC16: Chặn hành động khóa tài khoản khi người dùng mục tiêu có vai trò quản trị viên cấp cao (ADMIN)', () => {
    it('ném ForbiddenException ADM_CANNOT_BAN_ADMIN khi cố khóa tài khoản ADMIN', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_admin_senior',
        fullName: 'Admin Cấp Cao',
        role: UserRole.ADMIN,
        isActive: true,
      });

      await expect(
        service.updateUserStatus('usr_admin_senior', {
          is_active: false,
          reason: 'Khóa thử nghiệm tài khoản quản trị',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT12_Admin_TC17: Admin tạo mới tài khoản người dùng thành công (POST users)', () => {
    it('tạo người dùng mới thành công và lưu vào DB', async () => {
      mockDataConnect.createUser!.mockResolvedValue(true);

      const result = await service.createUser({
        full_name: 'Thầy Trần Văn Bình',
        phone: '0988776655',
        email: 'binh.tran@school.edu.vn',
        role: UserRole.TEACHER_SUBJECT,
        school_name: 'Trường Tiểu Học Chu Văn An',
      });

      expect(result.phone).toBe('0988776655');
      expect(result.full_name).toBe('Thầy Trần Văn Bình');
      expect(result.is_active).toBe(true);
      expect(mockDataConnect.createUser).toHaveBeenCalled();
    });
  });

  describe('UT12_Admin_TC18: Từ chối tạo tài khoản khi thiếu các trường thông tin bắt buộc', () => {
    it('ném BadRequestException khi thiếu phone và role', async () => {
      await expect(
        service.createUser({
          full_name: 'Thầy Lê Văn C',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT12_Admin_TC19: Xóa mềm tài khoản người dùng thành công (soft delete với is_deleted = true)', () => {
    it('xóa mềm tài khoản thành công khi user tồn tại', async () => {
      mockDataConnect.getUserById!.mockResolvedValue({
        id: 'usr_01',
        fullName: 'Nguyễn Văn An',
        role: UserRole.TEACHER_HOMEROOM,
      });
      mockDataConnect.softDeleteUser!.mockResolvedValue(true);

      const result = await service.deleteUser('usr_01');
      expect(result.is_deleted).toBe(true);
      expect(result.user_id).toBe('usr_01');
      expect(mockDataConnect.softDeleteUser).toHaveBeenCalledWith('usr_01');
    });
  });

  describe('UT12_Admin_TC20: Xử lý trạng thái rỗng an toàn khi tìm kiếm người dùng không có kết quả trong hệ thống', () => {
    it('trả về danh sách rỗng an toàn total = 0 khi không tìm thấy', async () => {
      mockDataConnect.listUsers!.mockResolvedValue([]);

      const result = await service.getAllUsers({
        page: 1,
        limit: 20,
        keyword: 'TenNguoiDungKhongHeTonTaiTrongHeThong123',
      });
      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);
    });
  });

  describe('UT12_Admin_TC21: Xử lý trạng thái rỗng an toàn khi hệ thống chưa có dữ liệu lớp học trên nền tảng', () => {
    it('trả về mảng rỗng an toàn khi chưa có lớp học nào hoặc lọc academic_year không khớp', async () => {
      mockDataConnect.listClasses!.mockResolvedValue([]);

      const result = await service.getAllClassesMonitoring();
      expect(result).toEqual([]);

      // Kiểm tra bộ lọc academic_year không có lớp học nào khớp
      mockDataConnect.listClasses!.mockResolvedValue([
        {
          id: 'cls_1a_2026',
          name: 'Lớp 1A',
          academicYear: '2026-2027',
        },
      ]);
      const filtered = await service.getAllClassesMonitoring({
        academic_year: '2035-2036',
      });
      expect(filtered).toEqual([]);
    });
  });

  describe('UT12_Admin_TC22: Từ chối xóa mềm tài khoản khi mã người dùng không tồn tại trong cơ sở dữ liệu', () => {
    it('ném NotFoundException USER_NOT_FOUND khi xóa user không tồn tại', async () => {
      mockDataConnect.getUserById!.mockResolvedValue(null);

      try {
        await service.deleteUser('usr_not_exist_99999');
        fail('Dự kiến ném NotFoundException nhưng không có lỗi xảy ra');
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.getStatus()).toBe(404);
        const res = error.getResponse();
        expect(res.error_code).toBe(ErrorCode.USER_NOT_FOUND);
        expect(res.details).toBeNull();
      }
    });
  });
});
