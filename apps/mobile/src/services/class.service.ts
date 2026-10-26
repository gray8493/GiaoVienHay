import { api } from './http';
import { authService } from './auth.service';
import { SUBJECT_LABELS } from '../constants/academic';

export interface StudentItem {
  id: string;
  student_code: string;
  full_name: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE';
  parent_phone?: string;
  parent_name?: string;
  parent_relationship?: string;
  is_parent_app_connected?: boolean;
}

export interface MyClassItem {
  id: string;
  name: string;
  grade_level: number;
  academic_year: string;
  school_name?: string;
  student_count: number;
  role_type: 'HOMEROOM' | 'SUBJECT';
  subject_name?: string;
  subject_names?: string[];
  icon_name?: 'groups' | 'square_foot' | 'laptop_mac' | 'school';
}

export interface SubjectTeacherItem {
  teacher_id: string;
  teacher_name: string;
  subject_code: string;
  subject_name?: string;
  phone?: string;
  email?: string;
  is_homeroom?: boolean;
  is_current_user?: boolean;
  assigned_at?: string;
}

export interface ClassDetailData {
  id: string;
  name: string;
  grade_level: number;
  academic_year: string;
  school_name: string;
  homeroom_teacher?: string;
  student_count: number;
  invite_code?: string;
  students: StudentItem[];
  subject_teachers?: SubjectTeacherItem[];
}

/**
 * Kết quả xem trước mã mời. Với giáo viên, server trả thêm môn thuộc hồ sơ
 * và môn đã có GV khác phụ trách để UI không phải tự suy đoán mã môn.
 */
export interface JoinPreviewData {
  class_id: string;
  name: string;
  grade_level?: number;
  academic_year?: string;
  school_name?: string;
  homeroom_teacher?: string;
  student_count?: number;
  invite_code: string;
  is_homeroom?: boolean;
  profile_subjects?: { code: string; label: string }[];
  assigned_subjects?: {
    subject_code: string;
    subject_name?: string;
    teacher_id: string;
    teacher_name: string;
    is_me?: boolean;
  }[];
  my_subject_codes?: string[];
}

export interface JoinSubjectOption {
  code: string;
  label: string;
  /** GV khác đang phụ trách môn này trong lớp -> không được chọn */
  taken_by?: string;
  /** Chính giáo viên đang phụ trách môn này trong lớp */
  is_mine?: boolean;
}

/**
 * Môn được phép nhận khi vào lớp bằng mã, dựng từ dữ liệu server đã chuẩn hoá
 * để các màn hình join không phải tự phân tích tên/mã môn ở client.
 */
export const buildJoinSubjectOptions = (preview: JoinPreviewData): JoinSubjectOption[] => {
  const assigned = preview.assigned_subjects || [];
  return (preview.profile_subjects || []).map((s) => {
    const holder = assigned.find((a) => a.subject_code === s.code && !a.is_me);
    return {
      code: s.code,
      label: s.label,
      is_mine: assigned.some((a) => a.subject_code === s.code && a.is_me),
      taken_by: holder ? holder.teacher_name : undefined,
    };
  });
};

export interface AddStudentPayload {
  full_name: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE';
  parent_phone?: string;
  parent_name?: string;
  parent_relationship?: string;
  student_code?: string;
}

export interface InviteCodeResult {
  class_id: string;
  class_name?: string;
  invite_code: string;
}

export interface MyClassRoleInfo {
  isHomeroom: boolean;
  /** Môn được phân công trực tiếp cho tôi trong lớp (bảng phân công) */
  myAssignedCodes: string[];
  /** Môn đã có phân công trong lớp (mọi giáo viên) */
  allAssignedCodes: string[];
  /** Môn từ API my-subject (phân công lớp → my-subject → hồ sơ) */
  apiSubjectCodes: string[];
  /** Môn trong hồ sơ giáo viên (teaching_subjects) */
  profileSubjectCodes: string[];
}

export { SUBJECT_LABELS, SCHOOL_SUBJECTS } from '../constants/academic';

const normalizeInviteCode = (raw: string): string => String(raw || '').trim().toUpperCase();

export const classService = {
  normalizeInviteCode,

  async getClassDetail(classId: string): Promise<ClassDetailData> {
    return api<ClassDetailData>(`/classes/${classId}`, {
      errorMessage: 'Không thể tải thông tin lớp học',
    });
  },

  async getMySubject(classId: string): Promise<{ teaching_subjects: string[]; is_homeroom: boolean }> {
    if (!classId) return { teaching_subjects: [], is_homeroom: false };
    try {
      return await api<{ teaching_subjects: string[]; is_homeroom: boolean }>(
        `/classes/${classId}/my-subject`,
      );
    } catch (e: any) {
      console.warn('getMySubject failed:', e?.message);
      return { teaching_subjects: [], is_homeroom: false };
    }
  },

  async generateInviteCode(classId: string): Promise<InviteCodeResult> {
    return api<InviteCodeResult>(`/classes/${classId}/invite`, {
      method: 'POST',
      errorMessage: 'Không thể tạo mã mời',
    });
  },

  async addStudent(classId: string, payload: AddStudentPayload): Promise<StudentItem> {
    return api<StudentItem>(`/classes/${classId}/students`, {
      method: 'POST',
      body: payload,
      errorMessage: 'Không thể thêm học sinh',
    });
  },

  /**
   * Cập nhật hồ sơ học sinh tại chỗ — backend giữ nguyên student_id nên
   * điểm số, điểm danh, nhận xét và liên kết phụ huynh không bị mồ côi.
   */
  async updateStudent(
    classId: string,
    currentStudent: StudentItem,
    payload: AddStudentPayload,
  ): Promise<StudentItem> {
    return api<StudentItem>(`/classes/${classId}/students/${currentStudent.id}`, {
      method: 'PUT',
      body: { student_code: currentStudent.student_code, ...payload },
      errorMessage: 'Không thể cập nhật học sinh',
    });
  },

  async removeStudent(classId: string, studentId: string): Promise<boolean> {
    await api<boolean>(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
      errorMessage: 'Không thể xoá học sinh',
    });
    return true;
  },

  async createClass(payload: { name: string; grade_level: number; academic_year: string }): Promise<any> {
    return api(`/classes`, {
      method: 'POST',
      body: payload,
      errorMessage: 'Không thể tạo lớp học',
    });
  },

  async previewJoin(inviteCode: string): Promise<JoinPreviewData> {
    const normalizedCode = normalizeInviteCode(inviteCode);
    return api<JoinPreviewData>(`/classes/preview-invite/${encodeURIComponent(normalizedCode)}`, {
      errorMessage: 'Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn',
    });
  },

  async joinClass(inviteCode: string, subjectCodes?: string[]): Promise<any> {
    const normalizedCode = normalizeInviteCode(inviteCode);
    const payload: { invite_code: string; subject_codes?: string[] } = {
      invite_code: normalizedCode,
    };
    const codes = (subjectCodes || []).map((c) => String(c).trim().toUpperCase()).filter(Boolean);
    if (codes.length > 0) {
      payload.subject_codes = Array.from(new Set(codes));
    }
    return api('/classes/join', {
      method: 'POST',
      body: payload,
      errorMessage: 'Mã mời tham gia lớp học không hợp lệ',
    });
  },

  /**
   * Tìm kiếm giáo viên trong hệ thống theo tên hoặc số điện thoại.
   * Không có fallback dữ liệu mẫu — lỗi kết nối phải hiện cho người dùng thấy.
   */
  async searchTeachers(query?: string, subjectCode?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (subjectCode) params.append('subject_code', subjectCode);

    const data = await api<any[]>(`/users/teachers/search?${params.toString()}`, {
      errorMessage: 'Không thể tải danh sách giáo viên. Vui lòng thử lại.',
    });
    return Array.isArray(data) ? data : [];
  },

  /**
   * Cập nhật danh sách phân công GVBM cho lớp học
   */
  async updateSubjectTeachers(
    classId: string,
    subjectTeachers: { teacher_id: string; subject_code: string }[]
  ): Promise<boolean> {
    await api(`/classes/${classId}/subject-teachers`, {
      method: 'PUT',
      body: { subject_teachers: subjectTeachers },
      errorMessage: 'Cập nhật phân công thất bại',
    });
    return true;
  },

  async getMyClasses(): Promise<MyClassItem[]> {
    try {
      const data = await api<any>('/classes/my-classes');

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.classes)
        ? data.classes
        : [];

      const currentUserId = authService.getUser()?.id;

      return list.map((item: any) => {
        const roleType = (item.role_type || item.role_in_class || 'SUBJECT') as 'HOMEROOM' | 'SUBJECT';
        const assignedList = Array.isArray(item.subject_teachers)
          ? item.subject_teachers.filter(
              (st: any) => (st.teacher_id || st.teacherId) === currentUserId
            )
          : [];
        const subjectCodes: string[] = assignedList
          .map((st: any) => st.subject_code || st.subjectCode)
          .filter(Boolean);
        if (subjectCodes.length === 0) {
          const myCodes = item.my_subject_codes ?? item.mySubjectCodes;
          if (Array.isArray(myCodes)) {
            subjectCodes.push(...myCodes.filter(Boolean).map(String));
          }
        }
        const subjectNames = subjectCodes.map((code: string) => SUBJECT_LABELS[code] || code);
        const subjectCode = subjectCodes[0] || item.subject_code;

        return {
          id: item.id,
          name: item.name?.startsWith('Lớp') ? item.name : `Lớp ${item.name}`,
          grade_level: item.grade_level ?? item.gradeLevel ?? 0,
          academic_year: item.academic_year ?? item.academicYear ?? '',
          school_name: item.school_name ?? item.schoolName ?? '',
          student_count: item.student_count ?? item.total_students ?? item.studentCount ?? 0,
          role_type: roleType,
          subject_names: subjectNames.length > 0 ? subjectNames : undefined,
          subject_name: subjectCode
            ? SUBJECT_LABELS[subjectCode] || subjectCode
            : item.subject_name || undefined,
          icon_name: item.icon_name || undefined,
        };
      });
    } catch (e: any) {
      console.warn('getMyClasses failed:', e?.message);
      return [];
    }
  },

  /**
   * Xác định vai trò và các môn của giáo viên hiện tại trong một lớp.
   * Dùng chung cho Gradebook / RemarksExam / QuizGen — thay cho đoạn logic
   * bị nhân bản ở từng màn hình. Không bao giờ throw: lỗi mạng trả về
   * cấu trúc rỗng để màn hình xử lý empty state.
   * @param classDetail nếu caller đã có chi tiết lớp thì truyền vào để tránh gọi lại API
   */
  async getMyRoleInClass(
    classId: string,
    classDetail?: ClassDetailData | null,
  ): Promise<MyClassRoleInfo> {
    const empty: MyClassRoleInfo = {
      isHomeroom: false,
      myAssignedCodes: [],
      allAssignedCodes: [],
      apiSubjectCodes: [],
      profileSubjectCodes: [],
    };
    if (!classId || classId === 'cls_empty') return empty;

    const myId = authService.getUser()?.id || '';
    const profile = (authService.getUser() as any)?.teaching_subjects;
    const profileSubjectCodes = Array.isArray(profile) ? profile.filter(Boolean) : [];

    let cls: any = classDetail ?? null;
    if (!cls) {
      try {
        cls = await this.getClassDetail(classId);
      } catch (e) {
        // Lỗi mạng: vẫn thử my-subject để ít nhất biết môn mình dạy
      }
    }

    const subjectTeachers: any[] = Array.isArray(cls?.subject_teachers) ? cls.subject_teachers : [];
    const isHomeroom = !!(cls && (cls.homeroom_teacher_id || cls.homeroomTeacherId) === myId);
    const myAssignedCodes = subjectTeachers
      .filter((st: any) => (st.teacher_id || st.teacherId) === myId)
      .map((st: any) => st.subject_code || st.subjectCode)
      .filter(Boolean);
    const allAssignedCodes = subjectTeachers
      .map((st: any) => st.subject_code || st.subjectCode)
      .filter(Boolean);

    // my-subject chỉ cần gọi khi bảng phân công chưa cho biết môn của tôi
    let apiSubjectCodes: string[] = [];
    if (myAssignedCodes.length === 0) {
      try {
        const mySub = await this.getMySubject(classId);
        apiSubjectCodes = (mySub?.teaching_subjects || []).filter(Boolean);
      } catch (e) {
        // bỏ qua
      }
    }

    return {
      isHomeroom: isHomeroom || !!(cls && (cls as any).is_homeroom === true),
      myAssignedCodes,
      allAssignedCodes,
      apiSubjectCodes,
      profileSubjectCodes,
    };
  },
};
