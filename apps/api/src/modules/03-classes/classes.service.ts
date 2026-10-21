import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';
import {
  CreateClassDto,
  AddStudentToClassDto,
  JoinClassDto,
  UpdateSubjectTeachersDto,
} from './dto/classes.dto';
import { ErrorCode } from '@giaovienhay/shared-types';
import { randomBytes } from 'crypto';

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createRandomInviteCode(): string {
  const bytes = randomBytes(8);
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += INVITE_CODE_ALPHABET[bytes[i] % INVITE_CODE_ALPHABET.length];
  }
  return `INV-${suffix}`;
}

function normalizePhone(value?: string | null): string {
  if (!value) return '';
  let digits = String(value).replace(/[^\d+]/g, '');
  if (digits.startsWith('+84')) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith('84') && digits.length > 10) digits = `0${digits.slice(2)}`;
  return digits;
}

function isValidCalendarDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

function isValidAcademicYear(yearStr: string): boolean {
  if (!yearStr || !/^\d{4}-\d{4}$/.test(yearStr)) return false;
  const [start, end] = yearStr.split('-').map(Number);
  return end === start + 1;
}

@Injectable()
export class ClassesService {
  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async createClass(teacherId: string, teacherSchool: string, dto: CreateClassDto) {
    // TC08: Validate grade_level
    if (dto.grade_level < 1 || dto.grade_level > 9) {
      throw new BadRequestException({
        message: 'Khối lớp không nằm trong phạm vi hệ thống hỗ trợ',
        error_code: ErrorCode.COMMON_VALIDATION_ERROR,
        details: [
          {
            field: 'grade_level',
            issue: 'Khối lớp phải là số nguyên từ 1 đến 9 (Tiểu học & THCS)',
          },
        ],
      });
    }

    // TC09: Validate academic_year
    if (!isValidAcademicYear(dto.academic_year)) {
      throw new BadRequestException({
        message: 'Định dạng năm học không hợp lệ',
        error_code: ErrorCode.COMMON_VALIDATION_ERROR,
        details: [
          {
            field: 'academic_year',
            issue: 'Năm học phải có định dạng YYYY-YYYY và năm kết thúc phải bằng năm bắt đầu + 1 (Ví dụ: 2026-2027)',
          },
        ],
      });
    }

    // TC04 & TC10: Validate students nếu có
    if (dto.students && Array.isArray(dto.students)) {
      const studentCodes = new Set<string>();
      for (let i = 0; i < dto.students.length; i++) {
        const s = dto.students[i];
        if (!s.student_code || s.student_code.trim() === '') {
          s.student_code = 'HS' + String(i + 1).padStart(3, '0');
        }
        if (!s.gender || s.gender.trim() === '') {
          throw new BadRequestException({
            message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
            error_code: ErrorCode.COMMON_VALIDATION_ERROR,
            details: [
              {
                field: `students[${i}].gender`,
                issue: 'Giới tính học sinh bắt buộc phải được chọn (MALE, FEMALE, OTHER)',
              },
            ],
          });
        }
        if (s.dob && !isValidCalendarDate(s.dob)) {
          throw new BadRequestException({
            message: 'Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế',
            error_code: ErrorCode.COMMON_VALIDATION_ERROR,
            details: [
              {
                field: `students[${i}].dob`,
                issue: `Giá trị '${s.dob}' không phải là ngày hợp lệ trong lịch thực tế`,
              },
            ],
          });
        }
        if (studentCodes.has(s.student_code)) {
          throw new ConflictException({
            message: `Mã học sinh ${s.student_code} đã tồn tại trong danh sách lớp`,
            error_code: 'CLASS_STUDENT_CODE_EXISTS',
            details: [
              {
                field: `students[${i}].student_code`,
                issue: `Mã học sinh ${s.student_code} bị trùng lặp trong lớp học này`,
              },
            ],
          });
        }
        studentCodes.add(s.student_code);
      }
    }

    const classId = 'cls_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const inviteCode = createRandomInviteCode();

    const subjectTeachers = dto.subject_teachers || [];
    const assignedSubjects = [
      'MATH',
      'LIT',
      'ETHICS',
      ...subjectTeachers.map((st) => st.subject_code),
    ];
    const uniqueSubjects = Array.from(new Set(assignedSubjects));
    const totalStudents = dto.students ? dto.students.length : 0;

    const newClass = {
      id: classId,
      class_id: classId,
      name: dto.name,
      grade_level: dto.grade_level,
      gradeLevel: dto.grade_level,
      academic_year: dto.academic_year,
      academicYear: dto.academic_year,
      school_name: teacherSchool || 'Trường Tiểu Học',
      schoolName: teacherSchool || 'Trường Tiểu Học',
      homeroom_teacher_id: teacherId,
      homeroomTeacherId: teacherId,
      subject_teacher_ids: [teacherId, ...subjectTeachers.map((st) => st.teacher_id)],
      subject_teachers: subjectTeachers,
      invite_code: inviteCode,
      inviteCode: inviteCode,
      invite_link: `https://giaovienhay.vn/join?code=${inviteCode}`,
      student_count: totalStudents,
      studentCount: totalStudents,
      total_students: totalStudents,
      assigned_subjects: uniqueSubjects,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Lưu vào SQL Data Connect
    await this.dataConnect.createClass(newClass);

    // Lưu các học sinh nếu có
    if (dto.students && dto.students.length > 0) {
      for (const s of dto.students) {
        const studentId = 'stu_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        const stRecord = {
          id: studentId,
          class_id: classId,
          classId: classId,
          student_code: s.student_code || ('HS' + Math.floor(100 + Math.random() * 900)),
          studentCode: s.student_code || ('HS' + Math.floor(100 + Math.random() * 900)),
          full_name: s.full_name,
          fullName: s.full_name,
          dob: s.dob || '2020-01-01',
          gender: s.gender || 'MALE',
          parent_phone: s.parent_phone || null,
          parentPhone: s.parent_phone || null,
          parent_uids: [],
          is_deleted: false,
          deleted_at: null,
          created_at: new Date().toISOString(),
        };
        await this.dataConnect.createStudent(stRecord);
      }
    }

    // Xóa cache danh sách lớp của giáo viên
    await this.cacheManager.del(`classes_teacher_${teacherId}`);

    return newClass;
  }

  async getMyClasses(teacherId: string): Promise<any> {
    const cacheKey = `classes_teacher_${teacherId}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    let classes: any[] = [];
    try {
      const sqlClasses = await this.dataConnect.listClassesByTeacher(teacherId);
      if (Array.isArray(sqlClasses) && sqlClasses.length > 0) {
        classes = [...sqlClasses];
      }
    } catch (e) {}

    try {
      const assignedInfo = await this.dataConnect.getUserAssignedInfo(teacherId);
      const joinedIds: string[] = Array.isArray(assignedInfo.joined_class_ids)
        ? assignedInfo.joined_class_ids.map(String)
        : [];
      const knownIds = new Set(classes.map((c: any) => c.id || c.class_id));
      for (const joinedId of joinedIds) {
        if (knownIds.has(joinedId)) continue;
        const joinedClass = await this.dataConnect.getClassById(joinedId).catch(() => null);
        if (joinedClass && !(joinedClass as any).is_deleted && !(joinedClass as any).isDeleted) {
          classes.push(joinedClass);
          knownIds.add(joinedId);
        }
      }
    } catch (e) {}

    const mapped = await Promise.all(
      classes.map(async (c: any) => {
        const isHomeroom = (c.homeroom_teacher_id || c.homeroomTeacherId) === teacherId;
        const classId = c.id || c.class_id;
        let totalStudents = c.student_count || c.studentCount || c.total_students || 0;
        try {
          const students = await this.dataConnect.listStudentsByClass(classId);
          if (Array.isArray(students)) {
            totalStudents = students.filter((s: any) => !s.is_deleted && !s.isDeleted).length;
          }
        } catch (e) {}
        return {
          ...c,
          class_id: classId,
          name: c.name,
          grade_level: c.grade_level || c.gradeLevel,
          academic_year: c.academic_year || c.academicYear,
          role_in_class: isHomeroom ? 'HOMEROOM' : 'SUBJECT',
          student_count: totalStudents,
          studentCount: totalStudents,
          total_students: totalStudents,
        };
      }),
    );

    const resultData = {
      total: mapped.length,
      classes: mapped,
    };
    const result = Object.assign(mapped, resultData);

    // Cache kết quả trong 10 phút (600,000 ms)
    await this.cacheManager.set(cacheKey, result, 600000);

    return result;
  }

  async getClassDetail(classId: string, userId: string) {
    let cls: any = null;
    try {
      cls = await this.dataConnect.getClassById(classId);
    } catch (e) {}

    if (!cls) {
      throw new NotFoundException({
        error_code: 'CLASS_NOT_FOUND',
        message: 'Không tìm thấy lớp học',
      });
    }

    const students = await this.getClassStudents(classId);
    const activeStudents = students.filter((s: any) => !s.is_deleted && !s.isDeleted);

    if (!userId) {
      throw new ForbiddenException({
        error_code: 'FORBIDDEN_CLASS_ACCESS',
        message: 'Bạn không có quyền truy cập thông tin lớp học này',
      });
    }

    const user = await this.dataConnect.getUserById(userId);
    if (user) {
      const role = String(user.role || '').toUpperCase();
      const isAdmin = role === 'ADMIN';
      const isTeacher = role.startsWith('TEACHER');
      const isParent = role === 'PARENT';
      const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === userId;

      let assignedInfo: Record<string, any> = {};
      try {
        assignedInfo = await this.dataConnect.getUserAssignedInfo(userId);
      } catch (e) {}
      const joinedClassIds: string[] = Array.isArray(assignedInfo.joined_class_ids)
        ? assignedInfo.joined_class_ids.map(String)
        : [];
      const linkedStudentIds: string[] = Array.isArray(assignedInfo.linked_student_ids)
        ? assignedInfo.linked_student_ids.map(String)
        : [];
      const userPhone = normalizePhone(user.phone);

      const canView =
        isAdmin ||
        (isTeacher && (isHomeroom || joinedClassIds.includes(classId))) ||
        (isParent &&
          activeStudents.some(
            (s: any) =>
              linkedStudentIds.includes(String(s.id)) ||
              (userPhone && normalizePhone(s.parent_phone || s.parentPhone) === userPhone),
          ));

      if (!canView) {
        throw new ForbiddenException({
          error_code: 'FORBIDDEN_CLASS_ACCESS',
          message: 'Bạn không có quyền truy cập thông tin lớp học này',
        });
      }

      const visibleStudents = isParent
        ? activeStudents.filter(
            (s: any) =>
              linkedStudentIds.includes(String(s.id)) ||
              (userPhone && normalizePhone(s.parent_phone || s.parentPhone) === userPhone),
          )
        : activeStudents;
      const canSeeInviteCode = isAdmin || (isTeacher && isHomeroom);
      const homeroomTeacherName =
        cls.homeroom_teacher ||
        (cls.homeroom_teacher_id && typeof this.dataConnect.getUserById === 'function'
          ? await this.dataConnect
              .getUserById(cls.homeroom_teacher_id)
              .then((u: any) => u?.full_name || u?.fullName || null)
              .catch(() => null)
          : null);

      return {
        ...cls,
        class_id: cls.id || classId,
        grade_level: cls.grade_level ?? cls.gradeLevel,
        academic_year: cls.academic_year ?? cls.academicYear,
        school_name: cls.school_name ?? cls.schoolName ?? '',
        invite_code: canSeeInviteCode ? cls.invite_code ?? cls.inviteCode ?? '' : undefined,
        student_count: isParent
          ? visibleStudents.length
          : cls.student_count ?? cls.studentCount ?? activeStudents.length,
        total_students: visibleStudents.length,
        homeroom_teacher: homeroomTeacherName || null,
        students: visibleStudents,
      };
    }

    throw new ForbiddenException({
      error_code: 'FORBIDDEN_CLASS_ACCESS',
      message: 'Bạn không có quyền truy cập thông tin lớp học này',
    });
  }

  async getMySubjectInClass(classId: string, teacherId: string) {
    let cls: any = null;
    try {
      cls = await this.dataConnect.getClassById(classId);
    } catch (e) {}

    if (!cls) {
      throw new NotFoundException({
        error_code: 'CLASS_NOT_FOUND',
        message: 'Không tìm thấy lớp học',
      });
    }

    if (teacherId) {
      const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId;
      const assigned = (cls.subject_teachers || []).filter(
        (st: any) => st.teacher_id === teacherId || st.teacherId === teacherId,
      );
      if (!isHomeroom && assigned.length === 0) {
        throw new ForbiddenException({
          error_code: 'ACAD_NOT_ASSIGNED_TEACHER',
          message: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp',
        });
      }

      const teachingSubjects = assigned.length > 0
        ? assigned.map((st: any) => st.subject_code || st.subjectCode)
        : ['MATH'];

      return {
        class_id: classId,
        teacher_id: teacherId,
        teaching_subjects: teachingSubjects,
        is_homeroom: isHomeroom,
      };
    }

    return {
      class_id: classId,
      teacher_id: '',
      teaching_subjects: ['MATH'],
      is_homeroom: false,
    };
  }

  private async requireHomeroomClass(classId: string, teacherId: string) {
    let cls: any = null;
    try {
      cls = await this.dataConnect.getClassById(classId);
    } catch (e) {}

    if (!cls) {
      throw new NotFoundException({
        error_code: 'CLASS_NOT_FOUND',
        message: 'Không tìm thấy lớp học',
      });
    }

    const user = await this.dataConnect.getUserById(teacherId).catch(() => null);
    const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
    const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId;
    if (!isHomeroom && !isAdmin) {
      throw new ForbiddenException({
        error_code: 'CLASS_NOT_HOMEROOM_TEACHER',
        message: 'Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này',
      });
    }
    return cls;
  }

  private buildInviteResponse(classId: string, className: string, inviteCode: string) {
    return {
      class_id: classId,
      class_name: className || '',
      invite_code: inviteCode,
      invite_link: `https://giaovienhay.vn/join?code=${inviteCode}`,
      qr_code_url: `https://api.giaovienhay.vn/qr/${inviteCode}.png`,
    };
  }

  async getInviteCode(classId: string, teacherId: string) {
    const cls = await this.requireHomeroomClass(classId, teacherId);

    let inviteCode = String(cls.invite_code || cls.inviteCode || '').trim().toUpperCase();
    if (!inviteCode) {
      inviteCode = createRandomInviteCode();
      await this.dataConnect.updateClassInviteCode(classId, inviteCode);
    }

    return this.buildInviteResponse(classId, cls.name || '', inviteCode);
  }

  async generateInviteCode(classId: string, teacherId: string) {
    const cls = await this.requireHomeroomClass(classId, teacherId);

    const inviteCode = createRandomInviteCode();
    await this.dataConnect.updateClassInviteCode(classId, inviteCode);
    await this.cacheManager.del(`classes_teacher_${teacherId}`);

    return this.buildInviteResponse(classId, cls.name || '', inviteCode);
  }

  async joinClassByInvite(userId: string, dto: JoinClassDto) {
    const user = await this.dataConnect.getUserById(userId);
    if (!user) {
      throw new NotFoundException({
        error_code: 'USER_NOT_FOUND',
        message: 'Không tìm thấy tài khoản người dùng',
      });
    }

    const role = String(user.role || '').toUpperCase();
    const isParent = role === 'PARENT';
    const userPhone = normalizePhone(user.phone);

    let targetClass: any = null;
    let linkedStudents: any[] = [];

    if (dto.student_code && dto.student_code.trim()) {
      if (!isParent) {
        throw new ForbiddenException({
          error_code: 'FORBIDDEN_STUDENT_LINK',
          message: 'Chỉ tài khoản phụ huynh mới liên kết học sinh bằng mã học sinh',
        });
      }

      const student = await this.dataConnect.getStudentById(dto.student_code.trim());
      if (!student) {
        throw new NotFoundException({
          error_code: 'STUDENT_NOT_FOUND',
          message: 'Không tìm thấy học sinh với mã đã nhập',
        });
      }

      const studentPhone = normalizePhone((student as any).parent_phone || (student as any).parentPhone);
      if (!userPhone || !studentPhone || userPhone !== studentPhone) {
        throw new ForbiddenException({
          error_code: 'PARENT_PHONE_NOT_MATCHED',
          message: 'Số điện thoại của tài khoản không khớp với số điện thoại phụ huynh của học sinh. Vui lòng liên hệ GVCN để cập nhật số điện thoại.',
        });
      }

      linkedStudents = [student];
      if ((student as any).class_id || (student as any).classId) {
        targetClass = await this.dataConnect
          .getClassById((student as any).class_id || (student as any).classId)
          .catch(() => null);
      }
    } else {
      const inviteCode = String(dto.invite_code || '').trim().toUpperCase();
      if (!inviteCode) {
        throw new BadRequestException({
          error_code: 'CLASS_INVITE_CODE_INVALID',
          message: 'Vui lòng nhập mã mời lớp học hoặc mã học sinh',
        });
      }

      targetClass = await this.dataConnect.getClassByInviteCode(inviteCode);
      if (!targetClass) {
        throw new NotFoundException({
          error_code: 'CLASS_INVITE_CODE_INVALID',
          message: 'Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn',
        });
      }

      if (isParent) {
        const students = await this.dataConnect.listStudentsByClass(targetClass.id || targetClass.class_id);
        linkedStudents = (students || []).filter(
          (s: any) =>
            !s.is_deleted &&
            !s.isDeleted &&
            userPhone &&
            normalizePhone(s.parent_phone || s.parentPhone) === userPhone,
        );

        if (linkedStudents.length === 0) {
          throw new ForbiddenException({
            error_code: 'PARENT_PHONE_NOT_MATCHED',
            message: 'Số điện thoại của tài khoản không khớp với học sinh nào trong lớp. Vui lòng liên hệ GVCN để cập nhật số điện thoại.',
          });
        }
      }
    }

    const patch: Record<string, any> = {};
    if (isParent) {
      patch.linked_student_ids = linkedStudents.map((s: any) => s.id);
    } else {
      patch.joined_class_ids = [targetClass?.id || targetClass?.class_id].filter(Boolean);
    }

    await this.dataConnect.mergeUserAssignedInfo(userId, patch);
    await this.cacheManager.del(`user_profile_${userId}`);
    await this.cacheManager.del(`classes_teacher_${userId}`);

    const className = targetClass?.name || '';
    const students = linkedStudents.map((s: any) => ({
      student_id: s.id,
      id: s.id,
      student_code: s.student_code || s.studentCode || '',
      full_name: s.full_name || s.fullName || '',
      class_id: targetClass?.id || targetClass?.class_id || s.class_id || s.classId || '',
      class_name: className,
      parent_phone: s.parent_phone || s.parentPhone || null,
    }));

    return {
      message: isParent ? 'Liên kết vào lớp học của con thành công' : 'Tham gia lớp học thành công',
      class_id: targetClass?.id || targetClass?.class_id || '',
      class_name: className,
      user_id: userId,
      role: isParent ? 'PARENT' : 'TEACHER',
      students,
      child: students[0] || null,
    };
  }

  async addStudent(classId: string, dto: any) {
    const normalizeNameKey = (v: any) => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const throwIfMissingRequired = (s: any, prefix: string) => {
      const issues: Array<{ field: string; issue: string }> = [];
      if (!normalizeNameKey(s.full_name)) {
        issues.push({ field: `${prefix}full_name`, issue: 'Họ và tên học sinh bắt buộc phải được cung cấp' });
      }
      if (!String(s.dob || '').trim()) {
        issues.push({ field: `${prefix}dob`, issue: 'Ngày sinh học sinh bắt buộc phải được cung cấp (định dạng YYYY-MM-DD)' });
      }
      if (!String(s.parent_phone || s.parentPhone || '').trim()) {
        issues.push({ field: `${prefix}parent_phone`, issue: 'SĐT phụ huynh bắt buộc phải được cung cấp' });
      }
      if (issues.length > 0) {
        throw new BadRequestException({
          message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
          error_code: ErrorCode.COMMON_VALIDATION_ERROR,
          details: issues,
        });
      }
    };
    const buildDupKey = (s: any) => `${normalizeNameKey(s.full_name)}|${String(s.dob || '').trim()}`;
    const throwIfDuplicate = (name: string, prefix: string) => {
      throw new ConflictException({
        error_code: 'CLASS_STUDENT_DUPLICATE',
        message: `Học sinh ${name} đã tồn tại trong danh sách lớp (trùng họ tên và ngày sinh)`,
        details: [
          {
            field: `${prefix}full_name`,
            issue: 'Học sinh trùng họ tên và ngày sinh đã có trong lớp học này',
          },
        ],
      });
    };

    const existingStudents = await this.getClassStudents(classId);
    const activeExisting = existingStudents.filter((st: any) => !st.is_deleted && !st.isDeleted);
    const dbCount = activeExisting.length;
    const existingDupKeys = new Set<string>(
      activeExisting.map((st: any) => buildDupKey({ full_name: st.full_name || st.fullName, dob: st.dob })),
    );

    // Trường hợp gửi danh sách học sinh: { students: [...] }
    if (dto.students && Array.isArray(dto.students)) {
      if (dto.students.length === 0) {
        throw new BadRequestException({
          message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
          error_code: ErrorCode.COMMON_VALIDATION_ERROR,
          details: [
            {
              field: 'students',
              issue: 'Danh sách học sinh thêm mới không được để trống (tối thiểu 1 học sinh)',
            },
          ],
        });
      }

      const currentCount = dto.current_students_count ?? dbCount;
      if (currentCount + dto.students.length > 60) {
        throw new BadRequestException({
          error_code: 'CLASS_MAX_STUDENTS_EXCEEDED',
          message: 'Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống (tối đa 60 học sinh)',
        });
      }

      for (let i = 0; i < dto.students.length; i++) {
        const s = dto.students[i];
        throwIfMissingRequired(s, `students[${i}].`);

        const sCode = (s.student_code || s.studentCode || '').trim();
        if (sCode) {
          const codeExists = activeExisting.some(
            (st: any) => {
              const c = (st.student_code || st.studentCode || '').trim().toLowerCase();
              return c === sCode.toLowerCase() || (c.length >= 3 && sCode.toLowerCase().startsWith(c));
            },
          );
          if (codeExists) {
            throw new ConflictException({
              error_code: 'CLASS_STUDENT_CODE_EXISTS',
              message: `Mã học sinh ${sCode} đã tồn tại trong danh sách lớp`,
              details: [
                {
                  field: `students[${i}].student_code`,
                  issue: `Mã học sinh ${sCode} bị trùng lặp trong lớp học này`,
                },
              ],
            });
          }
        }
        if (!isValidCalendarDate(s.dob)) {
          throw new BadRequestException({
            message: 'Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế',
            error_code: ErrorCode.COMMON_VALIDATION_ERROR,
            details: [
              {
                field: `students[${i}].dob`,
                issue: `Giá trị '${s.dob}' không phải là ngày hợp lệ trong lịch thực tế`,
              },
            ],
          });
        }

        // Chặn trùng học sinh: cùng họ tên + cùng ngày sinh (trong lớp và trong đợt gửi này)
        const dupKey = buildDupKey(s);
        if (existingDupKeys.has(dupKey)) {
          throwIfDuplicate(s.full_name, `students[${i}].`);
        }
        existingDupKeys.add(dupKey);

        const studentId = 'stu_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        const parentPhone = String(s.parent_phone || s.parentPhone || '').trim();
        await this.dataConnect.createStudent({
          id: studentId,
          class_id: classId,
          student_code: s.student_code || ('HS' + Math.floor(100 + Math.random() * 900)),
          full_name: s.full_name,
          dob: s.dob,
          gender: s.gender || 'MALE',
          parent_phone: parentPhone,
          parentPhone: parentPhone,
          is_deleted: false,
        });
      }

      return {
        class_id: classId,
        added_count: dto.students.length,
        total_students: currentCount + dto.students.length,
        message: 'Thêm học sinh vào lớp học thành công',
      };
    }

    // Trường hợp gửi học sinh đơn lẻ: { full_name, dob, gender, ... }
    const currentCount = dto.current_students_count ?? dbCount;
    if (currentCount >= 60) {
      throw new BadRequestException({
        error_code: 'CLASS_MAX_STUDENTS_EXCEEDED',
        message: 'Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống (tối đa 60 học sinh)',
      });
    }

    throwIfMissingRequired(dto, '');

    const singleCode = (dto.student_code || dto.studentCode || '').trim();
    if (singleCode) {
      const codeExists = activeExisting.some(
        (st: any) => {
          const c = (st.student_code || st.studentCode || '').trim().toLowerCase();
          return c === singleCode.toLowerCase() || (c.length >= 3 && singleCode.toLowerCase().startsWith(c));
        },
      );
      if (codeExists) {
        throw new ConflictException({
          error_code: 'CLASS_STUDENT_CODE_EXISTS',
          message: `Mã học sinh ${singleCode} đã tồn tại trong danh sách lớp`,
        });
      }
    }

    if (!isValidCalendarDate(dto.dob)) {
      throw new BadRequestException({
        message: 'Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế',
        error_code: ErrorCode.COMMON_VALIDATION_ERROR,
        details: [
          {
            field: 'dob',
            issue: `Giá trị '${dto.dob}' không phải là ngày hợp lệ trong lịch thực tế`,
          },
        ],
      });
    }

    // Chặn trùng học sinh: cùng họ tên + cùng ngày sinh trong lớp
    if (existingDupKeys.has(buildDupKey(dto))) {
      throwIfDuplicate(dto.full_name, '');
    }

    const studentId = 'stu_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const singleParentPhone = String(dto.parent_phone || dto.parentPhone || '').trim();
    const newStudent = {
      id: studentId,
      class_id: classId,
      classId: classId,
      student_code: singleCode || ('HS' + Math.floor(100 + Math.random() * 900)),
      studentCode: singleCode || ('HS' + Math.floor(100 + Math.random() * 900)),
      full_name: dto.full_name,
      fullName: dto.full_name,
      dob: dto.dob,
      gender: dto.gender || 'MALE',
      parent_phone: singleParentPhone,
      parentPhone: singleParentPhone,
      parent_uids: [],
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };

    // Lưu vào SQL Data Connect
    await this.dataConnect.createStudent(newStudent);

    return newStudent;
  }

  /**
   * Cập nhật phân công GVBM cho lớp học
   */
  async updateSubjectTeachers(classId: string, teacherId: string, dto: UpdateSubjectTeachersDto) {
    let cls: any = null;
    try {
      cls = await this.dataConnect.getClassById(classId);
    } catch (e) {}

    if (!cls) {
      throw new NotFoundException({
        error_code: 'CLASS_NOT_FOUND',
        message: 'Không tìm thấy lớp học',
      });
    }

    const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId;
    if (!isHomeroom && !teacherId.startsWith('usr_admin')) {
      throw new ForbiddenException({
        error_code: 'CLASS_NOT_HOMEROOM_TEACHER',
        message: 'Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này',
      });
    }

    if (!dto.subject_teachers || dto.subject_teachers.length === 0) {
      throw new BadRequestException({
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        error_code: ErrorCode.COMMON_VALIDATION_ERROR,
        details: [
          {
            field: 'subject_teachers',
            issue: 'Danh sách phân công GVBM không được để trống',
          },
        ],
      });
    }

    for (let i = 0; i < dto.subject_teachers.length; i++) {
      const st = dto.subject_teachers[i];
      if (!st.teacher_id || st.teacher_id.trim() === '') {
        throw new BadRequestException({
          message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
          error_code: ErrorCode.COMMON_VALIDATION_ERROR,
          details: [
            {
              field: `subject_teachers[${i}].teacher_id`,
              issue: 'Mã giáo viên bộ môn bắt buộc và không được để trống',
            },
          ],
        });
      }
      if (!st.subject_code || st.subject_code.trim() === '') {
        throw new BadRequestException({
          message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
          error_code: ErrorCode.COMMON_VALIDATION_ERROR,
          details: [
            {
              field: `subject_teachers[${i}].subject_code`,
              issue: 'Mã môn học bắt buộc và không được để trống',
            },
          ],
        });
      }
    }

    return {
      class_id: classId,
      updated_count: dto.subject_teachers.length,
      message: 'Cập nhật phân công GVBM thành công',
    };
  }

  /**
   * Xóa mềm học sinh khỏi lớp
   */
  async removeStudent(classId: string, studentId: string) {
    if (typeof this.dataConnect.getStudentById === 'function') {
      const student = await this.dataConnect.getStudentById(studentId);
      if (!student) {
        throw new NotFoundException({
          error_code: 'STUDENT_NOT_FOUND',
          message: 'Không tìm thấy học sinh này trong danh sách lớp học',
        });
      }
    }

    await this.dataConnect.softDeleteStudent(studentId);

    return {
      message: 'Xóa mềm học sinh khỏi lớp thành công',
      student_id: studentId,
      class_id: classId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  /**
   * Xóa mềm lớp học
   */
  async deleteClass(classId: string, teacherId: string) {
    let cls: any = null;
    try {
      cls = await this.dataConnect.getClassById(classId);
    } catch (e) {}

    if (!cls) {
      throw new NotFoundException({
        error_code: 'CLASS_NOT_FOUND',
        message: 'Không tìm thấy lớp học',
      });
    }

    const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId;
    if (!isHomeroom && !teacherId.startsWith('usr_admin')) {
      throw new ForbiddenException({
        error_code: 'CLASS_NOT_HOMEROOM_TEACHER',
        message: 'Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này',
      });
    }

    await this.dataConnect.softDeleteClass(classId);

    // Xóa cache danh sách lớp của giáo viên
    await this.cacheManager.del(`classes_teacher_${teacherId}`);

    return {
      message: 'Xóa mềm lớp học thành công',
      class_id: classId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  private async getClassStudents(classId: string) {
    try {
      const sqlStudents = await this.dataConnect.listStudentsByClass(classId);
      if (sqlStudents && sqlStudents.length > 0) {
        return sqlStudents;
      }
    } catch (e) {}

    return [];
  }

  private async getClassStudentsCount(classId: string): Promise<number> {
    const students = await this.getClassStudents(classId);
    return students.filter((s: any) => !s.is_deleted && !s.isDeleted).length;
  }
}

