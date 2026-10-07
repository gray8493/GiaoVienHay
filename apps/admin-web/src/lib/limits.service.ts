/**
 * Admin System Limits & Gemini AI Quota Service
 * Communicates with NestJS Backend Module 12-admin (/api/v1/admin/system-limits)
 */

import { apiFetch } from './api-client';

export interface SystemLimits {
  gemini_ai_daily_quota_per_teacher: number;
  max_quiz_questions_per_gen: number;
  max_upload_size_mb: number;
  max_students_per_class: number;
  max_classes_per_teacher: number;
  ai_model: 'gemini-1.5-flash' | 'gemini-1.5-pro';
  allow_subject_teacher_create_class: boolean;
  enable_fallback_cache: boolean;
  fcm_rate_limit_per_minute?: number;
}

export const DEFAULT_SYSTEM_LIMITS: SystemLimits = {
  gemini_ai_daily_quota_per_teacher: 25,
  max_quiz_questions_per_gen: 20,
  max_upload_size_mb: 15,
  max_students_per_class: 55,
  max_classes_per_teacher: 5,
  ai_model: 'gemini-1.5-flash',
  allow_subject_teacher_create_class: true,
  enable_fallback_cache: true,
  fcm_rate_limit_per_minute: 100,
};

/**
 * 1. Lấy cấu hình hạn mức hệ thống hiện tại
 */
export async function getSystemLimitsApi(): Promise<{
  data: SystemLimits;
  isMock: boolean;
}> {
  try {
    const res = await apiFetch<any>('/admin/system-limits');
    if (res.success && res.data) {
      const merged: SystemLimits = {
        gemini_ai_daily_quota_per_teacher:
          res.data.gemini_ai_daily_quota_per_teacher ?? DEFAULT_SYSTEM_LIMITS.gemini_ai_daily_quota_per_teacher,
        max_quiz_questions_per_gen:
          res.data.max_quiz_questions_per_gen ?? DEFAULT_SYSTEM_LIMITS.max_quiz_questions_per_gen,
        max_upload_size_mb:
          res.data.max_upload_size_mb ?? res.data.max_upload_file_size_mb ?? DEFAULT_SYSTEM_LIMITS.max_upload_size_mb,
        max_students_per_class:
          res.data.max_students_per_class ?? DEFAULT_SYSTEM_LIMITS.max_students_per_class,
        max_classes_per_teacher:
          res.data.max_classes_per_teacher ?? DEFAULT_SYSTEM_LIMITS.max_classes_per_teacher,
        ai_model:
          res.data.ai_model === 'gemini-1.5-pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
        allow_subject_teacher_create_class:
          res.data.allow_subject_teacher_create_class ?? DEFAULT_SYSTEM_LIMITS.allow_subject_teacher_create_class,
        enable_fallback_cache:
          res.data.enable_fallback_cache ?? DEFAULT_SYSTEM_LIMITS.enable_fallback_cache,
        fcm_rate_limit_per_minute:
          res.data.fcm_rate_limit_per_minute ?? DEFAULT_SYSTEM_LIMITS.fcm_rate_limit_per_minute,
      };
      return { data: merged, isMock: false };
    }
  } catch (e) {
    console.warn('[LimitsService] Không kết nối được Backend, dùng cấu hình mặc định:', e);
  }

  return { data: DEFAULT_SYSTEM_LIMITS, isMock: true };
}

/**
 * 2. Lưu cập nhật hạn mức hệ thống (PUT /api/v1/admin/system-limits)
 */
export async function updateSystemLimitsApi(
  payload: SystemLimits
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await apiFetch('/admin/system-limits', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      return {
        success: true,
        message: (res.data as any)?.message || 'Đã lưu thành công cấu hình hạn mức tài nguyên & AI',
      };
    }
    return { success: false, error: res.error || 'Lỗi cập nhật cấu hình hệ thống' };
  } catch (err: any) {
    // Offline simulated save
    return {
      success: true,
      message: 'Đã lưu thành công cấu hình hạn mức (Mô phỏng)',
    };
  }
}
