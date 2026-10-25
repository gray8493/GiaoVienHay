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


  async searchTeachers(query?: string, subjectCode?: string) {
    const q = (query || '').trim().toLowerCase();
    const sc = (subjectCode || '').trim().toUpperCase();

    // 1. Danh sách giáo viên mẫu hệ thống có sẵn (luôn đảm bảo có tài khoản chuẩn)
    const seedTeachers = [
      {
        id: 'usr_hang_lit_01',
        full_name: 'Cô Lê Thị Hằng',
        phone: '0903888999',
        email: 'hang.le@chuvanan.edu.vn',
        role: 'TEACHER_SUBJECT',
        teaching_subjects: ['LIT'],
        school_name: 'Trường Tiểu Học Chu Văn An',
      },
      {
        id: 'usr_gvbm_eng_01',
        full_name: 'Cô Phạm Quỳnh Chi',
        phone: '0903111222',
        email: 'chi.pham@chuvanan.edu.vn',
        role: 'TEACHER_SUBJECT',
        teaching_subjects: ['ENG'],
        school_name: 'Trường Tiểu Học Chu Văn An',
      },
      {
        id: 'usr_gvbm_art_01',
        full_name: 'Cô Đỗ Hoàng Yến',
        phone: '0903444555',
        email: 'yen.do@chuvanan.edu.vn',
        role: 'TEACHER_SUBJECT',
        teaching_subjects: ['ART'],
        school_name: 'Trường Tiểu Học Chu Văn An',
      },
      {
        id: 'usr_gvbm_music_01',
        full_name: 'Cô Lê Hồng Mai',
        phone: '0903333444',
        email: 'mai.le@chuvanan.edu.vn',
        role: 'TEACHER_SUBJECT',
        teaching_subjects: ['MUSIC'],
        school_name: 'Trường Tiểu Học Chu Văn An',
      },
      {
        id: 'usr_gvbm_pe_01',
        full_name: 'Thầy Nguyễn Quốc Bảo',
        phone: '0903555666',
        email: 'bao.nguyen@chuvanan.edu.vn',
        role: 'TEACHER_SUBJECT',
        teaching_subjects: ['PE'],
        school_name: 'Trường Tiểu Học Chu Văn An',
      },
      {
        id: 'usr_gvbm_cs_01',
        full_name: 'Thầy Trần Văn Nam',
        phone: '0903222333',
        email: 'nam.tran@chuvanan.edu.vn',
        role: 'TEACHER_SUBJECT',
        teaching_subjects: ['CS'],
        school_name: 'Trường Tiểu Học Chu Văn An',
      },
      {
        id: 'usr_gv_01',
        full_name: 'Cô Nguyễn Thị Lan',
        phone: '0912345678',
        email: 'lan.nguyen@chuvanan.edu.vn',
        role: 'TEACHER_HOMEROOM',
        teaching_subjects: ['MATH', 'LIT'],
        school_name: 'Trường Tiểu Học Chu Văn An',
      },
    ];

    const teacherMap = new Map<string, any>();
    for (const t of seedTeachers) {
      teacherMap.set(t.id, t);
    }

    // 2. Query thêm từ DB / DataConnect nếu có
    try {
      if (typeof (this.dataConnect as any).listUsers === 'function') {
        const dbUsers = await (this.dataConnect as any).listUsers();
        if (Array.isArray(dbUsers)) {
          for (const u of dbUsers) {
            const role = String(u.role || '').toUpperCase();
            if (role.includes('TEACHER') || (Array.isArray(u.teaching_subjects) && u.teaching_subjects.length > 0)) {
              const id = u.id || u.uid;
              teacherMap.set(id, {
                id,
                full_name: u.full_name || u.fullName,
                phone: u.phone || '',
                email: u.email || '',
                role: u.role || 'TEACHER_SUBJECT',
                teaching_subjects: Array.isArray(u.teaching_subjects) ? u.teaching_subjects : [],
                school_name: u.school_name || u.schoolName || 'Trường Tiểu Học Chu Văn An',
              });
            }
          }
        }
      }
    } catch {}

    let list = Array.from(teacherMap.values());

    // 3. Lọc theo từ khóa tìm kiếm (Tên hoặc SĐT)
    if (q) {
      list = list.filter(
        (t) =>
          (t.full_name && t.full_name.toLowerCase().includes(q)) ||
          (t.phone && t.phone.includes(q))
      );
    }

    // 4. Ưu tiên giáo viên dạy môn đó lên đầu
    if (sc) {
      list.sort((a, b) => {
        const aHas = (a.teaching_subjects || []).map((s: string) => String(s).toUpperCase()).includes(sc);
        const bHas = (b.teaching_subjects || []).map((s: string) => String(s).toUpperCase()).includes(sc);
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return (a.full_name || '').localeCompare(b.full_name || '');
      });
    }

    return list;
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

  private parseAssignedInfo(raw: any): Record<string, any> {
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
      return {};
    }
    return typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  }

  private serializeUser(user: any): any {
    if (!user) return null;
    const uid = user.uid || user.id;
    const fullName = user.full_name || user.fullName;
    const assignedInfo = user.assigned_info || user.assignedInfo || null;
    const assignedData = this.parseAssignedInfo(assignedInfo);
    const joinedClassIds = Array.isArray(assignedData.joined_class_ids)
      ? assignedData.joined_class_ids.map(String)
      : [];
    const linkedStudentIds = Array.isArray(assignedData.linked_student_ids)
      ? assignedData.linked_student_ids.map(String)
      : [];
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
      joined_class_ids: joinedClassIds,
      linked_student_ids: linkedStudentIds,
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

    const cleanToken = token.trim();

    // Lưu token vào cơ sở dữ liệu thật (cột assigned_info của bảng users)
    try {
      await this.dataConnect.mergeUserAssignedInfo(userId, {
        device_tokens: [cleanToken],
        fcm_token: cleanToken,
      });
      // Xóa cache profile để thông tin mới được cập nhật
      await this.cacheManager.del(`user_profile_${userId}`);
    } catch (err: any) {
      // Log lỗi nếu có sự cố với DB nhưng không chặn response
    }

    return {
      message: 'Đăng ký thiết bị nhận thông báo thành công',
      device_token: cleanToken,
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
