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

// 5 Giáo viên mẫu chuẩn phong cách nghiệp vụ Sư phạm GiaoVienHay kèm hạn mức AI
export const INITIAL_TEACHERS: TeacherUser[] = [
  {
    id: 'usr_gv_01',
    code: 'GV-1001',
    full_name: 'Cô Nguyễn Thị Lan',
    phone: '0912345678',
    email: 'lan.nguyen@school.edu.vn',
    role: 'TEACHER_HOMEROOM',
    school_name: 'Trường Tiểu Học Chu Văn An',
    subject: 'Toán học & Tiếng Việt',
    assigned_class: 'Lớp 1A (Chủ nhiệm)',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    ai_daily_quota: 35,
    ai_used_today: 14,
    ai_model_tier: 'AUTO',
  },
  {
    id: 'usr_gv_02',
    code: 'GV-1002',
    full_name: 'Thầy Lê Văn Hùng',
    phone: '0912334455',
    email: 'hung.le@school.edu.vn',
    role: 'TEACHER_SUBJECT',
    school_name: 'Trường Tiểu Học Chu Văn An',
    subject: 'Ngữ văn & Lịch sử',
    assigned_class: 'Khối 4, Khối 5',
    is_active: true,
    created_at: '2026-09-02T08:30:00.000Z',
    ai_daily_quota: 25,
    ai_used_today: 8,
    ai_model_tier: 'FLASH',
  },
  {
    id: 'usr_gv_03',
    code: 'GV-1003',
    full_name: 'Cô Phạm Thanh Mai',
    phone: '0934567890',
    email: 'mai.pham@school.edu.vn',
    role: 'TEACHER_HOMEROOM',
    school_name: 'Trường Tiểu Học Chu Văn An',
    subject: 'Tiếng Anh',
    assigned_class: 'Lớp 2B (Chủ nhiệm)',
    is_active: true,
    created_at: '2026-09-03T09:00:00.000Z',
    ai_daily_quota: 50,
    ai_used_today: 23,
    ai_model_tier: 'PRO',
  },
  {
    id: 'usr_gv_04',
    code: 'GV-1004',
    full_name: 'Thầy Hoàng Minh Tuấn',
    phone: '0945678901',
    email: 'tuan.hoang@school.edu.vn',
    role: 'TEACHER_SUBJECT',
    school_name: 'Trường Tiểu Học Chu Văn An',
    subject: 'Khoa học tự nhiên & STEM',
    assigned_class: 'Khối 3, Khối 4',
    is_active: true,
    created_at: '2026-09-05T07:45:00.000Z',
    ai_daily_quota: 40,
    ai_used_today: 19,
    ai_model_tier: 'PRO',
  },
  {
    id: 'usr_gv_05',
    code: 'GV-1005',
    full_name: 'Cô Đỗ Thu Hà',
    phone: '0956789012',
    email: 'ha.do@school.edu.vn',
    role: 'TEACHER_SUBJECT',
    school_name: 'Trường Tiểu Học Chu Văn An',
    subject: 'Tin học & Ứng dụng AI',
    assigned_class: 'Toàn trường',
    is_active: true,
    created_at: '2026-09-06T10:15:00.000Z',
    ai_daily_quota: 60,
    ai_used_today: 37,
    ai_model_tier: 'PRO',
  },
];

export const INITIAL_PARENTS: ParentUser[] = [];
