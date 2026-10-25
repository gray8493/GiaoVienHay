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

    // Môn phụ trách của lớp = môn của chính GVCN (từ hồ sơ thật) ∪ môn GVBM được phân công
    let homeroomSubjects: string[] = [];
    try {
      homeroomSubjects = (await this.getTeacherAssignmentContext(teacherId)).profileSubjects;
    } catch (e) {}
    const assignedSubjects = [
      ...homeroomSubjects,
      ...subjectTeachers
        .map((st: any) => st.subject_code || st.subjectCode)
        .filter(Boolean),
    ];
    const uniqueSubjects = Array.from(
      new Set(assignedSubjects.map((s: any) => String(s).trim().toUpperCase())),
    );
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

  /**
   * Lấy ngữ cảnh phân công của giáo viên từ users.assigned_info:
   * - profileSubjects: môn trong hồ sơ giáo viên (teaching_subjects)
   * - classSubjects: bản ghi phân công theo lớp { classId: [subject_code] } hoặc
   *   dạng danh sách [{ class_id, subject_code | subject_codes }]
   * - joinedClassIds: các lớp giáo viên đã tham gia
   * Đây là nguồn dữ liệu thật dùng làm fallback khi cột classes.subject_teachers
   * chưa tồn tại trên DB (chưa chạy migration 001).
   */
  private normalizeTeacherClassSubjects(raw: any): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    if (Array.isArray(raw)) {
      for (const item of raw) {
        const classId = String(item?.class_id || item?.classId || '');
        const codes = Array.isArray(item?.subject_codes)
          ? item.subject_codes
          : item?.subject_code
          ? [item.subject_code]
          : [];
        if (classId && codes.length > 0) {
          const upper = codes.map((s: any) => String(s).trim().toUpperCase()).filter(Boolean);
          map[classId] = Array.from(new Set([...(map[classId] || []), ...upper]));
        }
      }
    } else if (raw && typeof raw === 'object') {
      for (const [classId, codes] of Object.entries(raw)) {
        if (classId && Array.isArray(codes)) {
          const upper = codes.map((s: any) => String(s).trim().toUpperCase()).filter(Boolean);
          if (upper.length > 0) {
            map[classId] = Array.from(new Set([...(map[classId] || []), ...upper]));
          }
        }
      }
    }
    return map;
  }

  private async getTeacherAssignmentContext(teacherId: string) {
    let info: Record<string, any> = {};
    try {
      info = (await this.dataConnect.getUserAssignedInfo(teacherId)) || {};
    } catch (e) {}
    const profileSubjects: string[] = Array.isArray(info.teaching_subjects)
      ? info.teaching_subjects.map((s: any) => String(s).trim().toUpperCase()).filter(Boolean)
      : [];
    const joinedClassIds: string[] = Array.isArray(info.joined_class_ids)
      ? info.joined_class_ids.map(String)
      : [];
    return {
      profileSubjects,
      joinedClassIds,
      classSubjects: this.normalizeTeacherClassSubjects(info.class_subjects),
    };
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

    let teacherCtx: { profileSubjects: string[]; joinedClassIds: string[]; classSubjects: Record<string, string[]> } = {
      profileSubjects: [],
      joinedClassIds: [],
      classSubjects: {},
    };
    try {
      teacherCtx = await this.getTeacherAssignmentContext(teacherId);
    } catch (e) {}

    try {
      const knownIds = new Set(classes.map((c: any) => c.id || c.class_id));
      for (const joinedId of teacherCtx.joinedClassIds) {
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

        // Phân công môn thật của giáo viên này trong lớp:
        // 1) từ cột classes.subject_teachers (nếu DB đã có migration)
        // 2) fallback bản ghi per-class trong users.assigned_info (join bằng mã)
        // 3) fallback môn trong hồ sơ giáo viên (teaching_subjects)
        const classAssigned = Array.isArray(c.subject_teachers)
          ? c.subject_teachers.filter(
              (st: any) => (st.teacher_id || st.teacherId) === teacherId,
            )
          : [];
        let mySubjectCodes = classAssigned
          .map((st: any) => String(st.subject_code || st.subjectCode || '').trim().toUpperCase())
          .filter(Boolean);
        if (mySubjectCodes.length === 0) {
          mySubjectCodes = [...(teacherCtx.classSubjects[classId] || [])];
        }
        if (mySubjectCodes.length === 0 && !isHomeroom) {
          mySubjectCodes = [...teacherCtx.profileSubjects];
        }

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
          my_subject_codes: mySubjectCodes,
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

      const SUBJECT_MAP: Record<string, string> = {
        MATH: 'Toán học',
        LIT: 'Ngữ văn',
        LITERATURE: 'Ngữ văn',
        ENG: 'Tiếng Anh',
        ENGLISH: 'Tiếng Anh',
        CS: 'Tin học',
        INFORMATICS: 'Tin học',
        SCIENCE: 'Khoa học tự nhiên',
        PHYSICS: 'Vật lý',
        CHEM: 'Hóa học',
        BIO: 'Sinh học',
        HIST: 'Lịch sử',
        HISTORY: 'Lịch sử',
        GEO: 'Địa lý',
        GEOGRAPHY: 'Địa lý',
        GDCD: 'Giáo dục công dân',
        ETHICS: 'Đạo đức',
        TECH: 'Công nghệ',
        MUSIC: 'Âm nhạc',
        ART: 'Mỹ thuật',
        PE: 'Giáo dục thể chất',
        EXPERIENCE: 'Hoạt động trải nghiệm',
      };

      // Gom danh sách Giáo Viên Bộ Môn (GVBM)
      const rawSubjectTeachers = Array.isArray(cls.subject_teachers) ? [...cls.subject_teachers] : [];
      const teacherMap = new Map<string, any>();

      for (const st of rawSubjectTeachers) {
        const tid = String(st.teacher_id || st.teacherId || '');
        const scode = String(st.subject_code || st.subjectCode || 'MATH').toUpperCase();
        const key = `${tid}_${scode}`;
        let u: any = null;
        if (tid && typeof this.dataConnect.getUserById === 'function') {
          u = await this.dataConnect.getUserById(tid).catch(() => null);
        }
        teacherMap.set(key, {
          teacher_id: tid,
          teacher_name: st.teacher_name || u?.full_name || u?.fullName || 'Giáo viên bộ môn',
          subject_code: scode,
          subject_name: st.subject_name || SUBJECT_MAP[scode] || scode,
          phone: st.phone || u?.phone || '',
          email: st.email || u?.email || '',
          is_homeroom: tid === (cls.homeroom_teacher_id || cls.homeroomTeacherId),
          is_current_user: tid === userId,
          assigned_at: st.assigned_at || st.assignedAt || new Date().toISOString(),
        });
      }

      // Nếu người dùng hiện tại là giáo viên và đã tham gia lớp này với tư cách GVBM
      // Chỉ hiển thị dữ liệu thật của giáo viên, không suy đoán tên/SĐT/email
      const userSubs = Array.isArray(user.teaching_subjects) ? user.teaching_subjects : [];
      if (isTeacher && !isHomeroom && joinedClassIds.includes(classId) && userSubs.length > 0) {
        for (const sub of userSubs) {
          const scode = String(sub).toUpperCase();
          const key = `${userId}_${scode}`;
          if (!teacherMap.has(key)) {
            teacherMap.set(key, {
              teacher_id: userId,
              teacher_name: user.full_name || (user as any).name || '',
              subject_code: scode,
              subject_name: SUBJECT_MAP[scode] || scode,
              phone: user.phone || '',
              email: user.email || '',
              is_homeroom: false,
              is_current_user: true,
              assigned_at: new Date().toISOString(),
            });
          }
        }
      }

      const finalSubjectTeachers = Array.from(teacherMap.values()).sort((a, b) => {
        if (a.is_current_user && !b.is_current_user) return -1;
        if (!a.is_current_user && b.is_current_user) return 1;
        return a.teacher_name.localeCompare(b.teacher_name);
      });

      // Phụ huynh THẬT: liên kết app ghi parent_phone = SĐT tài khoản PH,
      // nên tra tài khoản PARENT theo SĐT để lấy đúng họ tên.
      // (Trước đây khối này BỊA tên 'Nguyễn Văn Thắng' + map 6 phụ huynh mẫu)
      const parentAccountsByPhone = new Map<string, { full_name: string; phone: string }>();
      try {
        if (typeof (this.dataConnect as any).listUsers === 'function') {
          const parentUsers = await this.dataConnect.listUsers({ role: 'PARENT' });
          for (const u of parentUsers || []) {
            const phone = String(u.phone || '').trim();
            if (phone) {
              parentAccountsByPhone.set(phone, {
                full_name: u.full_name || u.fullName || '',
                phone,
              });
            }
          }
        }
      } catch {}

      const enrichedStudents = visibleStudents.map((st: any) => {
        const rawPhone = String(st.parent_phone || st.parentPhone || '').replace(/\s+/g, '');
        const account = rawPhone ? parentAccountsByPhone.get(rawPhone) : undefined;

        const finalParentName = (account?.full_name || '')
          .replace(/^(Bác|Cô|Chú|Anh|Chị|Ông|Bà)\s+/i, '')
          .trim();
        const finalParentRel =
          account ? 'Bố' : (st.parent_relationship || st.parentRelationship || 'Bố');
        const finalConnected = !!account;

        return {
          ...st,
          parent_name: finalParentName,
          parentName: finalParentName,
          parent_relationship: finalParentRel,
          parentRelationship: finalParentRel,
          is_parent_app_connected: finalConnected,
          isParentAppConnected: finalConnected,
        };
      });

      return {
        ...cls,
        class_id: cls.id || classId,
        grade_level: cls.grade_level ?? cls.gradeLevel,
        academic_year: cls.academic_year ?? cls.academicYear,
        school_name: cls.school_name ?? cls.schoolName ?? '',
        invite_code: canSeeInviteCode ? cls.invite_code ?? cls.inviteCode ?? '' : undefined,
        student_count: isParent
          ? enrichedStudents.length
          : cls.student_count ?? cls.studentCount ?? activeStudents.length,
        total_students: enrichedStudents.length,
        homeroom_teacher: homeroomTeacherName || null,
        students: enrichedStudents,
        subject_teachers: finalSubjectTeachers,
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
      const ctx = await this.getTeacherAssignmentContext(teacherId);
      const isMember =
        isHomeroom ||
        assigned.length > 0 ||
        (ctx.classSubjects[classId] || []).length > 0 ||
        ctx.joinedClassIds.includes(classId);

      if (!isMember) {
        throw new ForbiddenException({
          error_code: 'ACAD_NOT_ASSIGNED_TEACHER',
          message: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp',
        });
      }

      // Chuỗi dữ liệu thật: phân công trên lớp → bản ghi per-class → môn hồ sơ giáo viên
      let teachingSubjects = assigned
        .map((st: any) => String(st.subject_code || st.subjectCode || '').trim().toUpperCase())
        .filter(Boolean);
      if (teachingSubjects.length === 0) {
        teachingSubjects = [...(ctx.classSubjects[classId] || [])];
      }
      if (teachingSubjects.length === 0 && !isHomeroom) {
        teachingSubjects = [...ctx.profileSubjects];
      }

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
      teaching_subjects: [],
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

  async previewClassByInvite(inviteCode: string) {
    const cleanCode = String(inviteCode || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new BadRequestException({
        error_code: 'CLASS_INVITE_CODE_INVALID',
        message: 'Vui lòng cung cấp mã mời',
      });
    }
    const cls = await this.dataConnect.getClassByInviteCode(cleanCode);
    if (!cls) {
      throw new NotFoundException({
        error_code: 'CLASS_INVITE_CODE_INVALID',
        message: 'Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn',
      });
    }

    const homeroomName =
      cls.homeroom_teacher ||
      (cls.homeroom_teacher_id
        ? await this.dataConnect
            .getUserById(cls.homeroom_teacher_id)
            .then((u: any) => u?.full_name || u?.fullName)
            .catch(() => null)
        : null);

    return {
      class_id: cls.id,
      name: cls.name,
      grade_level: cls.grade_level ?? cls.gradeLevel,
      academic_year: cls.academic_year ?? cls.academicYear,
      school_name: cls.school_name ?? cls.schoolName ?? '',
      homeroom_teacher: homeroomName || 'Giáo viên chủ nhiệm',
      student_count: cls.student_count ?? cls.studentCount ?? 0,
      invite_code: cleanCode,
    };
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
        const classId = targetClass.id || targetClass.class_id;
        const students = await this.dataConnect.listStudentsByClass(classId);
        const activeStudents = (students || []).filter((s: any) => !s.is_deleted && !s.isDeleted);

        const childName = String(dto.child_name || '').trim();
        const rawDob = String(dto.dob || '').trim();
        const relationship = String(dto.relationship || 'Bố').trim();
        const gender = String(dto.gender || 'MALE').toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE';

        // Chuẩn hóa ngày sinh nếu phụ huynh nhập DD/MM/YYYY
        let normalizedDob = rawDob;
        const dmyMatch = rawDob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmyMatch) {
          const d = dmyMatch[1].padStart(2, '0');
          const m = dmyMatch[2].padStart(2, '0');
          const y = dmyMatch[3];
          normalizedDob = `${y}-${m}-${d}`;
        }

        if (childName) {
          // PHƯƠNG ÁN 1: Phụ huynh tự điền thông tin con
          // 1. Tìm xem em bé đã có trong lớp chưa (so khớp tên không phân biệt dấu/hoa thường)
          const normalizeForCompare = (str: string) =>
            str
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .trim()
              .replace(/\s+/g, ' ');

          const normChildName = normalizeForCompare(childName);
          let matchedStudent = activeStudents.find((s: any) => {
            const sName = normalizeForCompare(s.full_name || s.fullName || '');
            if (sName !== normChildName) return false;
            if (normalizedDob && s.dob) {
              return s.dob === normalizedDob || s.dob === rawDob;
            }
            return true;
          });

          if (matchedStudent) {
            // Em bé đã có sẵn trong danh sách lớp của GVCN -> Ghép phụ huynh vào em này!
            matchedStudent.parent_phone = userPhone || matchedStudent.parent_phone || user.phone;
            matchedStudent.parent_name = user.full_name || matchedStudent.parent_name;
            matchedStudent.parent_relationship = relationship;
            matchedStudent.is_parent_app_connected = true;

            await this.dataConnect.createStudent(matchedStudent).catch(() => null);
            linkedStudents = [matchedStudent];
          } else {
            // Em bé chưa có trong lớp -> Tự động tạo hồ sơ học sinh mới vào lớp!
            const newStudentId =
              'stu_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
            const studentCode = 'HS' + Math.floor(100 + Math.random() * 900);
            const newStudent = {
              id: newStudentId,
              class_id: classId,
              classId: classId,
              student_code: studentCode,
              studentCode: studentCode,
              full_name: childName,
              fullName: childName,
              dob: normalizedDob || '2018-01-01',
              gender: gender,
              parent_phone: userPhone || user.phone || '',
              parentPhone: userPhone || user.phone || '',
              parent_name: user.full_name || (user as any).name || '',
              parentName: user.full_name || (user as any).name || '',
              parent_relationship: relationship,
              parentRelationship: relationship,
              is_parent_app_connected: true,
              isParentAppConnected: true,
              parent_uids: [userId],
              is_deleted: false,
              created_at: new Date().toISOString(),
            };

            await this.dataConnect.createStudent(newStudent);
            linkedStudents = [newStudent];
          }
        } else {
          // Fallback: Nếu không gửi child_name, quét theo SĐT như cũ
          linkedStudents = activeStudents.filter(
            (s: any) =>
              userPhone && normalizePhone(s.parent_phone || s.parentPhone) === userPhone,
          );

          if (linkedStudents.length === 0) {
            throw new ForbiddenException({
              error_code: 'PARENT_PHONE_NOT_MATCHED',
              message:
                'Số điện thoại của tài khoản không khớp với học sinh nào trong lớp. Vui lòng nhập họ tên của con để hoàn tất liên kết.',
            });
          }
        }
      }
    }

    const patch: Record<string, any> = {};
    const classId = targetClass?.id || targetClass?.class_id || '';
    let teacherSubjectCode = 'MATH';

    if (isParent) {
      let assignedInfo: Record<string, any> = {};
      try {
        assignedInfo = await this.dataConnect.getUserAssignedInfo(userId);
      } catch (e) {}
      const existingLinked = Array.isArray(assignedInfo.linked_student_ids)
        ? assignedInfo.linked_student_ids.map(String)
        : [];
      const newLinkedIds = linkedStudents.map((s: any) => String(s.id));
      patch.linked_student_ids = Array.from(new Set([...existingLinked, ...newLinkedIds]));
    } else {
      patch.joined_class_ids = [classId].filter(Boolean);

      // Xác định môn học giáo viên đăng ký phụ trách
      const requestedSubject = String(dto.subject_code || '').trim().toUpperCase();
      const userSubjects = Array.isArray(user.teaching_subjects) ? user.teaching_subjects : [];
      const fallbackSubject = userSubjects.length > 0 ? String(userSubjects[0]).trim().toUpperCase() : 'MATH';
      teacherSubjectCode = requestedSubject || fallbackSubject;

      // Ghi phân công GVBM vào danh sách subject_teachers của lớp (nếu DB có cột)
      if (classId) {
        const currentTeachers = Array.isArray(targetClass.subject_teachers) ? [...targetClass.subject_teachers] : [];
        const existingIdx = currentTeachers.findIndex(
          (st: any) =>
            (st.teacher_id === userId || st.teacherId === userId) &&
            (st.subject_code || st.subjectCode || '').toUpperCase() === teacherSubjectCode,
        );

        if (existingIdx === -1) {
          currentTeachers.push({
            teacher_id: userId,
            subject_code: teacherSubjectCode,
            teacher_name: user.full_name || (user as any).name || 'Giáo viên bộ môn',
          });
        }
        targetClass.subject_teachers = currentTeachers;

        if (typeof (this.dataConnect as any).updateClassSubjectTeachers === 'function') {
          await (this.dataConnect as any).updateClassSubjectTeachers(classId, currentTeachers);
        }

        // Song song: lưu bản ghi phân công per-class vào users.assigned_info
        // (cột text luôn ghi được qua REST, không phụ thuộc migration cột jsonb)
        try {
          const teacherInfo = await this.dataConnect.getUserAssignedInfo(userId);
          const existingMap = this.normalizeTeacherClassSubjects(teacherInfo?.class_subjects);
          const mergedCodes = Array.from(
            new Set([...(existingMap[classId] || []), teacherSubjectCode]),
          );
          const classSubjectPatch: Record<string, string[]> = { ...existingMap, [classId]: mergedCodes };
          await this.dataConnect.mergeUserAssignedInfo(userId, {
            class_subjects: classSubjectPatch,
          });
        } catch (e) {}

        await this.cacheManager.del(`class_${classId}`);
        await this.cacheManager.del(`class_detail_${classId}`);
      }
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
      class_id: classId || s.class_id || s.classId || '',
      class_name: className,
      parent_phone: s.parent_phone || s.parentPhone || null,
    }));

    return {
      message: isParent ? 'Liên kết vào lớp học của con thành công' : 'Tham gia lớp học thành công',
      class_id: classId,
      class_name: className,
      user_id: userId,
      role: isParent ? 'PARENT' : 'TEACHER',
      subject_code: !isParent ? teacherSubjectCode : undefined,
      grade_level: targetClass?.grade_level ?? targetClass?.gradeLevel,
      academic_year: targetClass?.academic_year ?? targetClass?.academicYear,
      school_name: targetClass?.school_name ?? targetClass?.schoolName,
      student_count: targetClass?.student_count ?? targetClass?.studentCount ?? 0,
      students,
      child: students[0] || null,
    };
  }

  async addStudent(classId: string, dto: any, teacherId?: string) {
    if (teacherId) {
      await this.requireHomeroomClass(classId, teacherId);
    }
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
        const parentName = String(s.parent_name || s.parentName || '').trim() || null;
        const parentRelationship = String(s.parent_relationship || s.parentRelationship || 'Bố').trim();
        await this.dataConnect.createStudent({
          id: studentId,
          class_id: classId,
          student_code: s.student_code || ('HS' + Math.floor(100 + Math.random() * 900)),
          full_name: s.full_name,
          dob: s.dob,
          gender: s.gender || 'MALE',
          parent_phone: parentPhone,
          parentPhone: parentPhone,
          parent_name: parentName,
          parentName: parentName,
          parent_relationship: parentRelationship,
          parentRelationship: parentRelationship,
          is_parent_app_connected: false,
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
    const singleParentName = String(dto.parent_name || dto.parentName || '').trim() || null;
    const singleParentRel = String(dto.parent_relationship || dto.parentRelationship || 'Bố').trim();
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
      parent_name: singleParentName,
      parentName: singleParentName,
      parent_relationship: singleParentRel,
      parentRelationship: singleParentRel,
      is_parent_app_connected: false,
      isParentAppConnected: false,
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

    if (typeof (this.dataConnect as any).updateClassSubjectTeachers === 'function') {
      await (this.dataConnect as any).updateClassSubjectTeachers(classId, dto.subject_teachers);
    }
    await this.cacheManager.del(`class_${classId}`);
    await this.cacheManager.del(`class_detail_${classId}`);

    return {
      class_id: classId,
      updated_count: dto.subject_teachers.length,
      message: 'Cập nhật phân công GVBM thành công',
    };
  }

  /**
   * Xóa mềm học sinh khỏi lớp
   */
  async removeStudent(classId: string, studentId: string, teacherId?: string) {
    if (teacherId) {
      await this.requireHomeroomClass(classId, teacherId);
    }
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

