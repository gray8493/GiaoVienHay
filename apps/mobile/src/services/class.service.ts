import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';
import { getCurrentAcademicYear } from '../utils/academic';

export interface StudentItem {
  id: string;
  student_code: string;
  full_name: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE';
  parent_phone?: string;
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
  icon_name?: 'groups' | 'square_foot' | 'laptop_mac' | 'school';
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
}

export interface AddStudentPayload {
  full_name: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE';
  parent_phone?: string;
}

export interface InviteCodeResult {
  class_id: string;
  invite_code: string;
  expires_in_hours: number;
}

const SUBJECT_LABELS: Record<string, string> = {
  MATH: 'Toán',
  LIT: 'Ngữ văn',
  LITERATURE: 'Ngữ văn',
  ENG: 'Tiếng Anh',
  ENGLISH: 'Tiếng Anh',
  CS: 'Tin học',
  INFORMATICS: 'Tin học',
  SCIENCE: 'Khoa học',
  ETHICS: 'Đạo đức',
};

export const classService = {
  async getClassDetail(classId: string): Promise<ClassDetailData> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        const resJson = await response.json();
        return resJson.data || resJson;
      }
    } catch (e) {
      console.warn('Backend not reachable, fallback to mock class detail:', e);
    }

    return {
      id: classId,
      name: 'Lớp học',
      grade_level: 1,
      academic_year: getCurrentAcademicYear(),
      school_name: '',
      student_count: 0,
      students: [],
    };
  },

  async generateInviteCode(classId: string): Promise<InviteCodeResult> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        const resJson = await response.json();
        return resJson.data || resJson;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo mã mời');
    } catch (e: any) {
      console.warn('generateInviteCode failed:', e?.message);
      throw e;
    }
  },

  async addStudent(classId: string, payload: AddStudentPayload): Promise<StudentItem> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const resJson = await response.json();
        return resJson.data || resJson;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể thêm học sinh');
    } catch (e: any) {
      console.warn('addStudent failed:', e?.message);
      throw e;
    }
  },

  async removeStudent(classId: string, studentId: string): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        return true;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể xoá học sinh');
    } catch (e: any) {
      console.warn('removeStudent failed:', e?.message);
      throw e;
    }
  },

  async createClass(payload: { name: string; grade_level: number; academic_year: string }): Promise<any> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const resJson = await response.json();
        return resJson.data || resJson;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo lớp học');
    } catch (e: any) {
      console.warn('createClass failed:', e?.message);
      throw e;
    }
  },

  async joinClass(inviteCode: string): Promise<any> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      });

      if (response.ok) {
        const resJson = await response.json();
        return resJson.data || resJson;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Mã mời tham gia lớp học không hợp lệ');
    } catch (e: any) {
      throw e;
    }
  },

  async getMyClasses(): Promise<MyClassItem[]> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/classes/my-classes`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        const resJson = await response.json();
        const list = Array.isArray(resJson)
          ? resJson
          : Array.isArray(resJson?.data)
          ? resJson.data
          : Array.isArray(resJson?.data?.classes)
          ? resJson.data.classes
          : Array.isArray(resJson?.classes)
          ? resJson.classes
          : [];

        // Lọc bỏ lớp mẫu fallback 'cls_1a_2026' do backend tự sinh khi tài khoản mới chưa có lớp trong DB
        const realClasses = list.filter((item: any) => item.id !== 'cls_1a_2026');
        const currentUserId = authService.getUser()?.id;

        return realClasses.map((item: any) => {
          const roleType = (item.role_type || item.role_in_class || 'SUBJECT') as 'HOMEROOM' | 'SUBJECT';
          const assigned = Array.isArray(item.subject_teachers)
            ? item.subject_teachers.find(
                (st: any) => (st.teacher_id || st.teacherId) === currentUserId
              )
            : undefined;
          const subjectCode = assigned?.subject_code || assigned?.subjectCode || item.subject_code;

          return {
            id: item.id,
            name: item.name?.startsWith('Lớp') ? item.name : `Lớp ${item.name}`,
            grade_level: item.grade_level ?? item.gradeLevel ?? 0,
            academic_year: item.academic_year ?? item.academicYear ?? '',
            school_name: item.school_name ?? item.schoolName ?? '',
            student_count: item.student_count ?? item.total_students ?? item.studentCount ?? 0,
            role_type: roleType,
            subject_name: subjectCode
              ? SUBJECT_LABELS[subjectCode] || subjectCode
              : item.subject_name || undefined,
            icon_name: item.icon_name || undefined,
          };
        });
      }
      console.warn(`getMyClasses failed with status ${response.status}`);
    } catch (e) {
      console.warn('Backend not reachable, returning empty class list:', e);
    }

    // Nếu không kết nối được hoặc lỗi thì trả về mảng rỗng để giáo viên mới thấy giao diện tạo lớp
    return [];
  },
};
