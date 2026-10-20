import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ErrorCode } from '@giaovienhay/shared-types';
import {
  FirebaseDataConnectService,
  normalizeSubjectCodes,
  decodeSubjectsFromAssignedInfo,
} from '../../common/supabase/supabase.service';
import { UpdateProfileDto, RegisterDeviceTokenDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getMe(userId: string) {
    const cacheKey = `user_profile_${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException({
        error_code: ErrorCode.USER_NOT_FOUND,
        message: 'Không tìm thấy thông tin tài khoản',
      });
    }

    if (user.is_active === false || user.isActive === false) {
      throw new ForbiddenException({
        error_code: 'AUTH_FORBIDDEN',
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.',
      });
    }

    const safeUser = this.serializeUser(user);

    // Lưu vào RAM cache trong 5 phút (300 giây)
    await this.cacheManager.set(cacheKey, safeUser, 300 * 1000);
    return safeUser;
  }

  async getUserProfileById(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException({
        error_code: ErrorCode.USER_NOT_FOUND,
        message: 'Không tìm thấy hồ sơ người dùng trong hệ thống.',
        details: null,
      });
    }
    return this.serializeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException({
        error_code: ErrorCode.USER_NOT_FOUND,
        message: 'Không tìm thấy thông tin tài khoản',
      });
    }

    if (user.is_active === false || user.isActive === false) {
      throw new ForbiddenException({
        error_code: 'AUTH_FORBIDDEN',
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.',
      });
    }

    if (dto.teaching_subjects) {
      const { codes, invalid } = normalizeSubjectCodes(dto.teaching_subjects);
      if (invalid.length > 0) {
        throw new BadRequestException({
          error_code: 'INVALID_SUBJECT_CODE',
          message: `Mã môn học ${invalid.join(', ')} không nằm trong chương trình (các mã hợp lệ: MATH, LIT, ENG, CS, SCIENCE, HISTORY, GEOGRAPHY, ETHICS...)`,
        });
      }
      dto.teaching_subjects = codes;
    }

    const updatedData = {
      ...user,
      ...dto,
      updated_at: new Date().toISOString(),
    };

    // Cập nhật SQL Data Connect
    await this.dataConnect.createUser(updatedData);

    // Xóa cache cũ để dữ liệu mới được cập nhật tức thời
    await this.cacheManager.del(`user_profile_${userId}`);

    return this.serializeUser(updatedData);
  }

  private serializeUser(user: any): any {
    if (!user) return null;
    const uid = user.uid || user.id;
    const fullName = user.full_name || user.fullName;
    const assignedInfo = user.assigned_info || user.assignedInfo || null;
    const subjects =
      (Array.isArray(user.teaching_subjects) && user.teaching_subjects.length > 0
        ? user.teaching_subjects
        : null) ||
      (Array.isArray(user.teachingSubjects) && user.teachingSubjects.length > 0
        ? user.teachingSubjects
        : null) ||
      decodeSubjectsFromAssignedInfo(assignedInfo);
    return {
      uid,
      id: uid,
      email: user.email || null,
      phone: user.phone || null,
      full_name: fullName,
      fullName: fullName,
      school_name: user.school_name !== undefined ? user.school_name : (user.schoolName !== undefined ? user.schoolName : null),
      role: user.role || 'TEACHER_HOMEROOM',
      avatar_url: user.avatar_url || user.avatarUrl || null,
      teaching_subjects: subjects,
      is_active: user.is_active !== undefined ? Boolean(user.is_active) : (user.isActive !== undefined ? Boolean(user.isActive) : true),
      created_at: user.created_at || user.createdAt || new Date().toISOString(),
    };
  }

  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    const token = dto.device_token || dto.fcm_device_token;
    if (!token || token.trim() === '') {
      throw new BadRequestException({
        error_code: 'EMPTY_DEVICE_TOKEN',
        message: 'fcm_device_token không được để trống',
      });
    }
    return {
      message: 'Đăng ký thiết bị nhận thông báo thành công',
      device_token: token,
    };
  }

  /**
   * Xóa mềm tài khoản người dùng (is_deleted = 1/true)
   */
  async deleteUser(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException({
        error_code: ErrorCode.USER_NOT_FOUND,
        message: 'Không tìm thấy hồ sơ người dùng trong hệ thống',
        details: null,
      });
    }

    const now = new Date().toISOString();

    // Cập nhật SQL Data Connect
    await this.dataConnect.softDeleteUser(userId);

    // Xóa cache profile
    await this.cacheManager.del(`user_profile_${userId}`);

    return {
      message: 'Xóa mềm tài khoản người dùng thành công',
      user_id: userId,
      is_deleted: true,
      deleted_at: now,
    };
  }

  private async getUserById(userId: string): Promise<any | null> {
    try {
      const sqlUser = await this.dataConnect.getUserById(userId);
      if (sqlUser && !sqlUser.isDeleted && !sqlUser.is_deleted) {
        return sqlUser;
      }
    } catch (e) {}
    return null;
  }
}
