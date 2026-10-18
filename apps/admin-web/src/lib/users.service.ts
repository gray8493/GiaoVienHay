/**
 * Admin Users Service for GiaoVienHay Web Portal
 * Communicates with NestJS Backend Module 12-admin (/api/v1/admin/users)
 * Provides seamless Hybrid operation (Live API + Smart Mock Fallback)
 */

import { apiFetch } from './api-client';
import { UserRole } from '@giaovienhay/shared-types';
import { TeacherUser, ParentUser } from './users-data';

export interface QueryUsersParams {
  role?: UserRole | string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface AdminUsersApiResponse {
  total: number;
  page: number;
  limit: number;
  items: Array<{
    id: string;
    code?: string;
    full_name: string;
    phone: string;
    email?: string | null;
    role: UserRole | string;
    school_name?: string | null;
    assigned_info?: string;
    is_active: boolean;
    status_reason?: string;
    created_at: string;
    students?: Array<{
      student_code: string;
      full_name: string;
      class_name: string;
    }>;
  }>;
}

/**
 * 1. Lấy danh sách Giáo viên (kết nối API Backend + Fallback 5 giáo viên mẫu)
 */
export async function getTeachersList(params?: {
  keyword?: string;
  role?: string;
  page?: number;
  limit?: number;
}): Promise<{ teachers: TeacherUser[]; total: number; isMock: boolean }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.keyword) searchParams.set('keyword', params.keyword);
    if (params?.role && params.role !== 'ALL') searchParams.set('role', params.role);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit || 50));

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiFetch<AdminUsersApiResponse>(`/admin/users${queryStr}`);

    if (res.success && res.data && res.data.items && res.data.items.length > 0) {
      // Lọc các users có vai trò là Giáo viên
      const apiTeachers = res.data.items.filter(
        (u) =>
          u.role === UserRole.TEACHER_HOMEROOM ||
          u.role === UserRole.TEACHER_SUBJECT ||
          u.role === 'TEACHER_HOMEROOM' ||
          u.role === 'TEACHER_SUBJECT'
      );

      if (apiTeachers.length > 0) {
        const mappedTeachers: TeacherUser[] = apiTeachers.map((u, idx) => ({
          id: u.id,
          code: u.code || `GV-${String(8800 + idx)}`,
          full_name: u.full_name,
          phone: u.phone,
          email: u.email || `${u.phone}@giaovienhay.vn`,
          role: (u.role === UserRole.TEACHER_HOMEROOM ? 'TEACHER_HOMEROOM' : 'TEACHER_SUBJECT') as
            | 'TEACHER_HOMEROOM'
            | 'TEACHER_SUBJECT',
          school_name: u.school_name || 'Chưa phân trường',
          subject: u.assigned_info || 'Bộ môn',
          assigned_class: u.assigned_info || (u.role === 'TEACHER_HOMEROOM' ? 'Chủ nhiệm' : 'Bộ môn'),
          is_active: u.is_active,
          status_reason: u.status_reason,
          created_at: u.created_at || new Date().toISOString(),
          ai_daily_quota: (u as any).ai_daily_quota ?? 25,
          ai_used_today: (u as any).ai_used_today ?? 0,
          ai_model_tier: (u as any).ai_model_tier ?? 'AUTO',
        }));

        return {
          teachers: mappedTeachers,
          total: mappedTeachers.length,
          isMock: false,
        };
      }
    }
  } catch (err) {
    console.warn('[UsersService] Không kết nối được Backend /admin/users:', err);
  }

  // Không có dữ liệu thật từ Backend → trả về rỗng (không dùng dữ liệu mẫu).
  return {
    teachers: [],
    total: 0,
    isMock: false,
  };
}

/**
 * 2. Lấy danh sách Phụ huynh (kết nối API Backend)
 */
export async function getParentsList(params?: {
  keyword?: string;
  page?: number;
  limit?: number;
}): Promise<{ parents: ParentUser[]; total: number; isMock: boolean }> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('role', UserRole.PARENT);
    if (params?.keyword) searchParams.set('keyword', params.keyword);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit || 50));

    const res = await apiFetch<AdminUsersApiResponse>(`/admin/users?${searchParams.toString()}`);

    if (res.success && res.data && res.data.items) {
      const apiParents = res.data.items.filter(
        (u) => u.role === UserRole.PARENT || u.role === 'PARENT'
      );

      const mappedParents: ParentUser[] = apiParents.map((u, idx) => ({
        id: u.id,
        code: u.code || `PH-${String(1090 + idx)}`,
        full_name: u.full_name,
        phone: u.phone,
        email: u.email || `${u.phone}@gmail.com`,
        school_name: u.school_name || 'Chưa phân trường',
        students: u.students || [],
        is_active: u.is_active,
        status_reason: u.status_reason,
        created_at: u.created_at || new Date().toISOString(),
      }));

      return {
        parents: mappedParents,
        total: mappedParents.length,
        isMock: false,
      };
    }
  } catch (err) {
    console.warn('[UsersService] Không kết nối được Backend Phụ huynh:', err);
  }

  return {
    parents: [],
    total: 0,
    isMock: false,
  };
}

/**
 * 3. Tạo mới tài khoản Người dùng (POST /api/v1/admin/users)
 */
export async function createAdminUser(payload: {
  full_name: string;
  phone: string;
  email?: string;
  role: UserRole | string;
  school_name?: string;
  subject?: string;
  assigned_class?: string;
  ai_daily_quota?: number;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const cleanPhone = payload.phone.replace(/\s+/g, '').trim();

  try {
    const res = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        full_name: payload.full_name.trim(),
        phone: cleanPhone,
        email: payload.email?.trim() || undefined,
        role: payload.role,
        school_name: payload.school_name?.trim() || 'Trường Tiểu Học Chu Văn An',
        ai_daily_quota: payload.ai_daily_quota || 25,
      }),
    });

    if (res.success) {
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Không thể tạo tài khoản trên hệ thống' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Không thể kết nối máy chủ để tạo tài khoản.' };
  }
}

/**
 * 4. Cập nhật trạng thái Khóa / Mở khóa tài khoản (PATCH /api/v1/admin/users/:id/status)
 */
export async function updateUserStatus(
  userId: string,
  isActive: boolean,
  reason?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await apiFetch(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        is_active: isActive,
        reason: reason?.trim() || undefined,
      }),
    });

    if (res.success) {
      return {
        success: true,
        message: isActive ? 'Đã mở khóa tài khoản thành công' : 'Đã khóa tài khoản thành công',
      };
    }
    return { success: false, error: res.error || 'Cập nhật trạng thái thất bại' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Không thể kết nối máy chủ.' };
  }
}

/**
 * 5. Cập nhật Hạn mức sử dụng AI cho từng Giáo viên
 */
export async function updateTeacherAiQuota(
  teacherId: string,
  payload: {
    ai_daily_quota: number;
    ai_model_tier?: 'FLASH' | 'PRO' | 'AUTO';
    reset_used?: boolean;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await apiFetch(`/admin/users/${teacherId}/ai-quota`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      return {
        success: true,
        message: 'Cập nhật hạn mức AI giáo viên thành công',
      };
    }
    return { success: false, error: res.error || 'Cập nhật hạn mức AI thất bại' };
  } catch (err: any) {
    console.warn('[UsersService] Không kết nối được endpoint AI Quota:', err);
    return { success: false, error: err?.message || 'Không thể kết nối máy chủ.' };
  }
}
