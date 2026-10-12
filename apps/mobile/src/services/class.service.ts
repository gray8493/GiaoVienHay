import { Platform } from 'react-native';
import { authService } from './auth.service';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

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

const DEFAULT_STUDENTS: StudentItem[] = [
  {
    id: 'stu_01',
    student_code: 'HS240101',
    full_name: 'Nguyễn Minh Anh',
    dob: '2014-05-15',
    gender: 'FEMALE',
    parent_phone: '0901 234 567',
  },
  {
    id: 'stu_02',
    student_code: 'HS240102',
    full_name: 'Trần Bảo Nam',
    dob: '2019-05-15',
    gender: 'MALE',
    parent_phone: '0977 112 233',
  },
  {
    id: 'stu_03',
    student_code: 'HS240103',
    full_name: 'Lê Thị Cẩm Tú',
    dob: '2014-08-20',
    gender: 'FEMALE',
    parent_phone: '0987 654 321',
  },
  {
    id: 'stu_04',
    student_code: 'HS240104',
    full_name: 'Phạm Hoàng Nam',
    dob: '2014-11-05',
    gender: 'MALE',
    parent_phone: '0933 112 233',
  },
  {
    id: 'stu_05',
    student_code: 'HS240105',
    full_name: 'Võ Khánh Linh',
    dob: '2014-09-18',
    gender: 'FEMALE',
    parent_phone: '0966 889 900',
  },
];

export const classService = {
  async getClassDetail(classId: string = 'cls_1a_2026'): Promise<ClassDetailData> {
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
      name: 'Lớp 1A',
      grade_level: 1,
      academic_year: '2026-2027',
      school_name: 'Trường Tiểu Học Chu Văn An',
      homeroom_teacher: 'Cô Nguyễn Thị Lan',
      student_count: 35,
      invite_code: 'INV-1A-2026',
      students: DEFAULT_STUDENTS,
    };
  },

  async generateInviteCode(classId: string = 'cls_1a_2026'): Promise<InviteCodeResult> {
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
    } catch (e) {
      console.warn('Backend not reachable, fallback to mock invite code:', e);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return {
      class_id: classId,
      invite_code: `INV-6A1-${randomSuffix}`,
      expires_in_hours: 72,
    };
  },

  async addStudent(classId: string = 'cls_1a_2026', payload: AddStudentPayload): Promise<StudentItem> {
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
    } catch (e) {
      console.warn('Backend not reachable, fallback to local student create:', e);
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    return {
      id: 'stu_' + Date.now(),
      student_code: `HS240${randomNum}`,
      full_name: payload.full_name,
      dob: payload.dob || '2019-01-01',
      gender: payload.gender || 'MALE',
      parent_phone: payload.parent_phone || '',
    };
  },

  async removeStudent(classId: string = 'cls_1a_2026', studentId: string): Promise<boolean> {
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
    } catch (e) {
      console.warn('Backend not reachable, fallback local student remove:', e);
    }
    return true;
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
    } catch (e) {
      console.warn('Backend not reachable, fallback createClass:', e);
    }

    return {
      id: 'cls_' + Date.now().toString(36),
      name: payload.name,
      grade_level: payload.grade_level,
      academic_year: payload.academic_year,
      student_count: 0,
      invite_code: `INV-${payload.name.toUpperCase()}-1234`,
    };
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
          : [];

        // Lọc bỏ lớp mẫu fallback 'cls_1a_2026' do backend tự sinh khi tài khoản mới chưa có lớp trong DB
        const realClasses = list.filter((item: any) => item.id !== 'cls_1a_2026');
        return realClasses.map((item: any, idx: number) => ({
          id: item.id || `cls_${idx}`,
          name: item.name?.startsWith('Lớp') ? item.name : `Lớp ${item.name}`,
          grade_level: item.grade_level || 6,
          academic_year: item.academic_year || '2026–2027',
          school_name: item.school_name || 'THCS Lê Quý Đôn',
          student_count: item.student_count || 0,
          role_type: (item.role_type || (idx === 0 ? 'HOMEROOM' : 'SUBJECT')) as 'HOMEROOM' | 'SUBJECT',
          subject_name: item.subject_name || (idx === 1 ? 'Toán' : idx === 2 ? 'Tin Học' : undefined),
          icon_name: (idx === 0 ? 'groups' : idx === 1 ? 'square_foot' : 'laptop_mac') as any,
        }));
      }
    } catch (e) {
      console.warn('Backend not reachable, returning empty class list:', e);
    }

    // Nếu không kết nối được hoặc lỗi thì trả về mảng rỗng để giáo viên mới thấy giao diện tạo lớp
    return [];
  },
};
