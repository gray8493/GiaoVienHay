/**
 * API Client for Classes & Students Management
 * Map directly to NestJS Backend Modules:
 * - Module 03-classes (/api/v1/classes)
 * - Module 04-students (/api/v1/students)
 * - Module 10-fees-insurance (/api/v1/students/:id/fees-insurance)
 * - Module 12-admin (/api/v1/admin/classes)
 */

import { apiRequest } from './api-client';

export type GenderType = 'MALE' | 'FEMALE';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface CreateClassPayload {
  name: string;
  grade_level: number;
  academic_year: string;
}

export interface AddStudentPayload {
  full_name: string;
  dob?: string;
  gender?: GenderType | string;
  parent_phone?: string;
}

export interface ClassMonitoringItem {
  class_id: string;
  name: string;
  grade_level: number;
  homeroom_teacher: string;
  homeroom_teacher_phone?: string;
  homeroom_teacher_avatar?: string;
  homeroom_teacher_initials?: string;
  homeroom_teacher_initials_bg?: string;
  homeroom_teacher_initials_color?: string;
  room?: string;
  student_count: number;
  linked_parents_count: number;
  insurance_paid_count: number;
  academic_year: string;
  invite_code?: string;
}


/**
 * Fetch all classes for Admin Monitoring (calls GET /api/v1/admin/classes with fallback)
 */
export async function getAdminClassesMonitoring(): Promise<ClassMonitoringItem[]> {
  try {
    const data: any = await apiRequest<any>('/admin/classes');
    const list: any[] = Array.isArray(data) ? data : data?.items || [];
    if (Array.isArray(list)) {
      return list.map((item: any) => {
        return {
          class_id: item.class_id || item.id,
          name: item.name,
          grade_level: item.grade_level || 7,
          homeroom_teacher: item.homeroom_teacher || 'Chưa phân công',
          homeroom_teacher_phone: item.homeroom_teacher_phone || 'Chưa cập nhật',
          homeroom_teacher_avatar: item.homeroom_teacher_avatar,
          homeroom_teacher_initials: item.name ? item.name.slice(0, 2) : 'LH',
          homeroom_teacher_initials_bg: 'bg-slate-100',
          homeroom_teacher_initials_color: 'text-slate-800',
          room: item.room || 'Chưa xếp phòng',
          student_count: item.student_count || 0,
          linked_parents_count: item.linked_parents_count || 0,
          insurance_paid_count: item.insurance_paid_count || 0,
          academic_year: item.academic_year || '2026-2027',
          invite_code: item.invite_code || `INV-${item.name}-2026`,
        };
      });
    }
  } catch (error) {}

  return [];
}

/**
 * Create new class (calls POST /api/v1/classes)
 */
export async function createClassApi(
  payload: CreateClassPayload & { school_name?: string; homeroom_teacher?: string },
  token?: string,
): Promise<{ success: boolean; data: any; message?: string }> {
  try {
    const data = await apiRequest('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, data };
  } catch (e) {
    try {
      const res = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
    } catch (err) {}
  }

  return {
    success: false,
    data: null,
    message: 'Không thể kết nối máy chủ để tạo lớp học.',
  };
}

/**
 * Generate Invite QR Code (calls POST /api/v1/classes/:id/invite)
 */
export async function generateInviteCodeApi(
  classId: string,
  token?: string,
): Promise<{ invite_code: string; expires_in_hours: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/classes/${classId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  throw new Error('Không thể tạo mã mời từ máy chủ.');
}

/**
 * Add student to class (calls POST /api/v1/classes/:id/students)
 */
export async function addStudentToClassApi(
  classId: string,
  payload: AddStudentPayload,
  token?: string,
): Promise<{ success: boolean; data: any }> {
  try {
    const data = await apiRequest(`/classes/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, data };
  } catch (e) {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
    } catch (err) {}
  }

  return {
    success: false,
    data: null,
  };
}

/**
 * Remove student from class (calls DELETE /api/v1/classes/:id/students/:studentId)
 */
export async function removeStudentFromClassApi(
  classId: string,
  studentId: string,
  token?: string,
): Promise<boolean> {
  try {
    await apiRequest(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (e) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/classes/${classId}/students/${studentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (res.ok) return true;
    } catch (err) {}
  }

  return true;
}

export interface SchoolItem {
  id: string;
  name: string;
  type: 'PRIMARY' | 'SECONDARY' | 'HIGH';
  typeLabel: string;
  district: string;
  city: string;
  grades: number[];
  isNationalStandard: boolean;
  totalClasses: number;
  totalStudents: number;
  appLinkedPercent: number;
}

export async function getAdminSchoolsApi(): Promise<SchoolItem[]> {
  try {
    const data = await apiRequest<SchoolItem[]>('/admin/schools');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {}
  return [];
}

export async function createAdminSchoolApi(payload: Partial<SchoolItem>): Promise<SchoolItem | null> {
  try {
    return await apiRequest<SchoolItem>('/admin/schools', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {}
  return null;
}

export async function updateAdminSchoolApi(id: string, payload: Partial<SchoolItem>): Promise<SchoolItem | null> {
  try {
    return await apiRequest<SchoolItem>(`/admin/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } catch (err) {}
  return null;
}

export async function deleteAdminSchoolApi(id: string): Promise<boolean> {
  try {
    await apiRequest(`/admin/schools/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (err) {}
  return false;
}

