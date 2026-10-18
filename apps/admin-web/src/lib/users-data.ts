export interface TeacherUser {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  email: string;
  role: 'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT';
  school_name: string;
  subject: string;
  assigned_class: string;
  is_active: boolean;
  status_reason?: string;
  created_at: string;
  // Quản lý hạn mức sử dụng AI từng giáo viên
  ai_daily_quota?: number; // Hạn mức lượt gọi/ngày (mặc định 25)
  ai_used_today?: number; // Số lượt đã gọi trong ngày
  ai_model_tier?: 'FLASH' | 'PRO' | 'AUTO'; // Gói model AI
}

export interface LinkedStudent {
  student_code: string;
  full_name: string;
  class_name: string;
}

export interface ParentUser {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  email: string;
  school_name: string;
  students: LinkedStudent[];
  is_active: boolean;
  status_reason?: string;
  created_at: string;
}

