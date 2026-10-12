import { Platform } from 'react-native';

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
    full_name: 'Trần Gia Bảo',
    dob: '2014-03-12',
    gender: 'MALE',
    parent_phone: '0912 345 678',
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
  async getClassDetail(classId: string = 'cls_6a1'): Promise<ClassDetailData> {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend not reachable, fallback to mock class detail:', e);
    }

    return {
      id: classId,
      name: 'Lớp 6A1',
      grade_level: 6,
      academic_year: '2026-2027',
      school_name: 'THCS Lê Quý Đôn',
      homeroom_teacher: 'Cô Nguyễn Thu Hà',
      student_count: 38,
      invite_code: 'INV-6A1-9821',
      students: DEFAULT_STUDENTS,
    };
  },

  async generateInviteCode(classId: string = 'cls_6a1'): Promise<InviteCodeResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
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

  async addStudent(classId: string = 'cls_6a1', payload: AddStudentPayload): Promise<StudentItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend not reachable, fallback to local student create:', e);
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    return {
      id: 'stu_' + Date.now(),
      student_code: `HS240${randomNum}`,
      full_name: payload.full_name,
      dob: payload.dob || '2014-01-01',
      gender: payload.gender || 'MALE',
      parent_phone: payload.parent_phone || '',
    };
  },

  async removeStudent(classId: string = 'cls_6a1', studentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_jwt_token_demo',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
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
      const response = await fetch(`${API_BASE_URL}/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_jwt_token_demo',
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      });

      if (response.ok) {
        return await response.json();
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Mã mời tham gia lớp học không hợp lệ');
    } catch (e: any) {
      throw e;
    }
  },

  async getMyClasses(): Promise<MyClassItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/my-classes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_jwt_token_demo',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any, idx: number) => ({
            id: item.id || `cls_${idx}`,
            name: item.name?.startsWith('Lớp') ? item.name : `Lớp ${item.name}`,
            grade_level: item.grade_level || 6,
            academic_year: item.academic_year || '2026–2027',
            school_name: item.school_name || 'THCS Lê Quý Đôn',
            student_count: item.student_count || (idx === 0 ? 38 : idx === 1 ? 36 : 35),
            role_type: (item.role_type || (idx === 0 ? 'HOMEROOM' : 'SUBJECT')) as 'HOMEROOM' | 'SUBJECT',
            subject_name: item.subject_name || (idx === 1 ? 'Toán' : idx === 2 ? 'Tin Học' : undefined),
            icon_name: (idx === 0 ? 'groups' : idx === 1 ? 'square_foot' : 'laptop_mac') as any,
          }));
        }
      }
    } catch (e) {
      console.warn('Backend not reachable, fallback getMyClasses:', e);
    }

    return [
      {
        id: 'cls_6a1',
        name: 'Lớp 6A1',
        grade_level: 6,
        academic_year: '2026–2027',
        school_name: 'THCS Lê Quý Đôn',
        student_count: 38,
        role_type: 'HOMEROOM',
        icon_name: 'groups',
      },
      {
        id: 'cls_6a2',
        name: 'Lớp 6A2',
        grade_level: 6,
        academic_year: '2026–2027',
        school_name: 'THCS Lê Quý Đôn',
        student_count: 36,
        role_type: 'SUBJECT',
        subject_name: 'Toán',
        icon_name: 'square_foot',
      },
      {
        id: 'cls_6a3',
        name: 'Lớp 6A3',
        grade_level: 6,
        academic_year: '2026–2027',
        school_name: 'THCS Lê Quý Đôn',
        student_count: 35,
        role_type: 'SUBJECT',
        subject_name: 'Tin Học',
        icon_name: 'laptop_mac',
      },
    ];
  },
};
