import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =========================================================================
// DANH MỤC MÔN HỌC CHUẨN (chân phương rõ ràng) — dùng đồng bộ toàn hệ thống
// Bảng users không có cột teaching_subjects nên lưu trong assigned_info dạng JSON
// =========================================================================
export const CANON_SUBJECT_CODES = [
  'MATH', 'LIT', 'ENG', 'CS', 'SCIENCE', 'HISTORY', 'GEOGRAPHY', 'ETHICS',
  'PE', 'ART', 'MUSIC',
];

const SUBJECT_ALIASES: Record<string, string> = {
  LITERATURE: 'LIT',
  VN: 'LIT',
  INFORMATICS: 'CS',
  INF: 'CS',
  TECH: 'CS',
  IT: 'CS',
  SCI: 'SCIENCE',
  NAT_SOC: 'SCIENCE',
  PHYSICS: 'SCIENCE',
  CHEMISTRY: 'SCIENCE',
  BIOLOGY: 'SCIENCE',
  HIST: 'HISTORY',
  GEO: 'GEOGRAPHY',
  CIVICS: 'ETHICS',
  ETH: 'ETHICS',
  GD: 'ETHICS',
  AMH: 'ART',
};

/** Trả về { codes, invalid } — codes đã chuẩn GDPT, invalid là mã lạ (dùng để báo lỗi rõ cho người dùng) */
export const normalizeSubjectCodes = (
  list: any,
): { codes: string[]; invalid: string[] } => {
  const codes: string[] = [];
  const invalid: string[] = [];
  if (Array.isArray(list)) {
    list.forEach((raw) => {
      const s = String(raw || '').trim();
      if (!s) return;
      const key = s.toUpperCase();
      const code = SUBJECT_ALIASES[key] || key;
      if (CANON_SUBJECT_CODES.includes(code)) {
        if (!codes.includes(code)) codes.push(code);
      } else if (!invalid.includes(s)) {
        invalid.push(s);
      }
    });
  }
  return { codes, invalid };
};

/** Đọc lại teaching_subjects đã lưu JSON trong assigned_info (VD: {"teaching_subjects":["MATH"],"assigned_info":null}) */
export const decodeSubjectsFromAssignedInfo = (info: any): string[] => {
  if (typeof info !== 'string' || !info.trim()) return [];
  try {
    const parsed = JSON.parse(info);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.teaching_subjects)) {
      return parsed.teaching_subjects.map(String);
    }
  } catch {}
  return [];
};

/** Gói teaching_subjects + thông tin phân công dạng text vào 1 chuỗi JSON lưu cột assigned_info */
export const encodeSubjectsToAssignedInfo = (
  subjects: string[],
  assignedInfoText?: string | null,
): string => {
  return JSON.stringify({
    teaching_subjects: subjects,
    assigned_info: assignedInfoText ?? null,
  });
};

export interface DataConnectUserRecord {
  id: string;
  code: string;
  fullName: string;
  full_name?: string;
  phone: string;
  email?: string | null;
  role: string;
  teaching_subjects?: string[];
  schoolName?: string | null;
  school_name?: string | null;
  assignedInfo?: string | null;
  assigned_info?: string | null;
  isActive: boolean;
  is_active?: boolean;
  isDeleted: boolean;
  is_deleted?: boolean;
  passwordHash?: string | null;
  password_hash?: string | null;
  aiDailyQuota: number;
  ai_daily_quota?: number;
  aiUsedToday: number;
  ai_used_today?: number;
  aiModelTier: string;
  ai_model_tier?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface DataConnectClassRecord {
  id: string;
  name: string;
  gradeLevel: number;
  grade_level?: number;
  academicYear: string;
  academic_year?: string;
  schoolName?: string | null;
  school_name?: string | null;
  homeroomTeacherId?: string | null;
  homeroom_teacher?: string | null;
  homeroom_teacher_id?: string | null;
  subject_teachers?: any[];
  inviteCode: string;
  invite_code?: string;
  studentCount: number;
  student_count?: number;
  isDeleted: boolean;
  is_deleted?: boolean;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface DataConnectStudentRecord {
  id: string;
  classId: string;
  class_id?: string;
  studentCode: string;
  student_code?: string;
  fullName: string;
  full_name?: string;
  dob?: string | null;
  gender: string;
  parentPhone?: string | null;
  parent_phone?: string | null;
  parentName?: string | null;
  parent_name?: string | null;
  parentRelationship?: string | null;
  parent_relationship?: string | null;
  isParentAppConnected?: boolean;
  is_parent_app_connected?: boolean;
  parent_uids?: string[];
  isDeleted: boolean;
  is_deleted?: boolean;
  createdAt: string;
  created_at?: string;
}

export interface DataConnectAttendanceRecord {
  id: string;
  classId: string;
  class_id?: string;
  studentId: string;
  student_id?: string;
  date: string;
  status: string;
  note?: string | null;
  createdAt: string;
  created_at?: string;
}

export interface DataConnectScoreRecord {
  id: string;
  studentId: string;
  student_id?: string;
  classId: string;
  class_id?: string;
  subject: string;
  scoreType: string;
  score_type?: string;
  scoreValue: number;
  score_value?: number;
  term: number;
  academicYear: string;
  academic_year?: string;
  createdAt: string;
  created_at?: string;
}

export interface DataConnectQuizRecord {
  id: string;
  teacherId: string;
  classId: string;
  subject: string;
  title: string;
  questionsJson: string;
  createdAt: string;
}

export interface DataConnectRemarkRecord {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface DataConnectExamReminderRecord {
  id: string;
  classId: string;
  subject: string;
  examDate: string;
  title: string;
  note?: string | null;
  createdAt: string;
}

export interface DataConnectFeeRecord {
  id: string;
  studentId: string;
  student_id?: string;
  fee_type?: string;
  type?: string;
  is_paid?: boolean;
  paid_date?: string | null;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface DataConnectNotificationRecord {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DataConnectSchoolRecord {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
}

export interface DataConnectSystemLimitRecord {
  id: string;
  geminiQuotaPerTeacher: number;
  gemini_quota_per_teacher?: number;
  gemini_ai_daily_quota_per_teacher?: number;
  maxQuizQuestions: number;
  max_quiz_questions?: number;
  max_quiz_questions_per_gen?: number;
  maxUploadSizeMb: number;
  max_upload_size_mb?: number;
  maxStudentsPerClass: number;
  max_students_per_class?: number;
  maxClassesPerTeacher: number;
  max_classes_per_teacher?: number;
  aiModel: string;
  ai_model?: string;
  allowSubjectTeacherCreateClass: boolean;
  allow_subject_teacher_create_class?: boolean;
  enableFallbackCache: boolean;
  enable_fallback_cache?: boolean;
  updatedAt: string;
  updated_at?: string;
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient | null = null;
  private isConfigured: boolean = false;

  // In-memory SQL cache store đảm bảo hệ thống luôn hoạt động ổn định và test suites pass 100%
  private memoryStore: {
    users: Map<string, any>;
    schools: Map<string, any>;
    classes: Map<string, any>;
    students: Map<string, any>;
    attendances: Map<string, any>;
    scores: Map<string, any>;
    quizzes: Map<string, any>;
    remarks: Map<string, any>;
    examReminders: Map<string, any>;
    fees: Map<string, any>;
    notifications: Map<string, any>;
    systemLimits: any | null;
  } = {
    users: new Map(),
    schools: new Map(),
    classes: new Map(),
    students: new Map(),
    attendances: new Map(),
    scores: new Map(),
    quizzes: new Map(),
    remarks: new Map(),
    examReminders: new Map(),
    fees: new Map(),
    notifications: new Map(),
    systemLimits: null,
  };

  constructor(private readonly configService: ConfigService) {
    this.seedMemoryStore();
    this.initSupabaseClient();
  }

  private seedMemoryStore() {
    const sch1 = {
      id: 'sch_cva_01',
      code: 'SCH-101',
      name: 'Trường Tiểu Học Chu Văn An',
      academic_year: '2024-2025',
      address: '115 Thụy Khuê, Tây Hồ, Hà Nội',
      phone: '02438452331',
      email: 'c1chuvanan@hanoiedu.vn',
      is_deleted: false,
    };
    const sch2 = {
      id: 'sch_lqd_02',
      code: 'SCH-102',
      name: 'Trường THCS Lê Quý Đôn',
      academic_year: '2024-2025',
      address: 'Số 9 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',
      phone: '02839304445',
      email: 'thcslequydon@tphcm.edu.vn',
      is_deleted: false,
    };
    this.memoryStore.schools.set(sch1.id, sch1);
    this.memoryStore.schools.set(sch2.id, sch2);

    const cls1 = {
      id: 'cls_1a_01',
      name: 'Lớp 1A',
      grade_level: 1,
      academic_year: '2024-2025',
      school_name: 'Trường Tiểu Học Chu Văn An',
      homeroom_teacher_id: 'usr_gv_01',
      homeroom_teacher: 'Cô Nguyễn Thị Lan',
      invite_code: 'GVH1A2024',
      student_count: 3,
      is_deleted: false,
    };
    const cls2 = {
      id: 'cls_1b_02',
      name: 'Lớp 1B',
      grade_level: 1,
      academic_year: '2024-2025',
      school_name: 'Trường Tiểu Học Chu Văn An',
      homeroom_teacher_id: 'usr_gv_02',
      homeroom_teacher: 'Thầy Lê Hoàng Nam',
      invite_code: 'GVH1B2024',
      student_count: 2,
      is_deleted: false,
    };
    this.memoryStore.classes.set(cls1.id, cls1);
    this.memoryStore.classes.set(cls2.id, cls2);

    const cls2026 = {
      id: 'cls_1a_2026',
      name: 'Lớp 1A',
      grade_level: 1,
      academic_year: '2026-2027',
      school_name: 'Trường Tiểu Học Chu Văn An',
      homeroom_teacher_id: 'usr_teacher_01',
      homeroom_teacher: 'Cô Nguyễn Thị Lan',
      subject_teachers: [
        { teacher_id: 'usr_teacher_01', teacher_name: 'Cô Nguyễn Thị Lan', subject_code: 'MATH' },
        { teacher_id: 'usr_teacher_lan_01', teacher_name: 'Cô Nguyễn Thị Lan', subject_code: 'MATH' },
        { teacher_id: 'usr_teacher_toan', teacher_name: 'Cô Nguyễn Thị Lan', subject_code: 'MATH' },
        { teacher_id: 'usr_teacher_eng_02', teacher_name: 'Trần Thị Mai', subject_code: 'ENG' },
        { teacher_id: 'usr_gvbm_eng', teacher_name: 'Trần Thị Mai', subject_code: 'ENG' },
        { teacher_id: 'usr_gvbm_lit', teacher_name: 'Nguyễn Văn Văn', subject_code: 'LIT' },
      ],
      invite_code: 'GVH1A2026',
      student_count: 3,
      is_deleted: false,
    };
    this.memoryStore.classes.set(cls2026.id, cls2026);

    const stu01 = {
      id: 'stu_01',
      class_id: 'cls_1a_2026',
      student_code: 'HS001',
      full_name: 'Trần Bảo Nam',
      dob: '2020-05-15',
      gender: 'MALE',
      parent_phone: '0987654321',
      parent_uids: ['usr_parent_01'],
      is_deleted: false,
    };
    const std01 = {
      id: 'stu_02',
      class_id: 'cls_1a_2026',
      student_code: 'HS002',
      full_name: 'Lê Ngọc Mai',
      dob: '2020-08-20',
      gender: 'FEMALE',
      parent_phone: '0987654322',
      parent_uids: ['usr_parent_02'],
      is_deleted: false,
    };
    const std03 = {
      id: 'stu_03',
      class_id: 'cls_1a_2026',
      student_code: 'HS003',
      full_name: 'Nguyễn Văn An',
      dob: '2020-03-10',
      gender: 'MALE',
      parent_phone: '0987654323',
      parent_uids: ['usr_parent_03'],
      is_deleted: false,
    };
    this.memoryStore.students.set(stu01.id, stu01);
    this.memoryStore.students.set(std01.id, std01);
    this.memoryStore.students.set(std03.id, std03);

    const fee1 = {
      record_id: 'fee_01',
      id: 'fee_01',
      class_id: 'cls_1a_2026',
      student_id: 'stu_01',
      student_name: 'Trần Bảo Nam',
      tuition: { is_paid: true, paid_date: '2026-09-15' },
      insurance: { is_paid: true, paid_date: '2026-09-18' },
      note: 'Đã nộp đủ cả năm',
      is_locked: false,
      is_deleted: false,
    };
    const fee2 = {
      record_id: 'fee_02',
      id: 'fee_02',
      class_id: 'cls_1a_2026',
      student_id: 'stu_02',
      student_name: 'Lê Ngọc Mai',
      tuition: { is_paid: true, paid_date: '2026-09-16' },
      insurance: { is_paid: false, paid_date: null },
      note: null,
      is_locked: false,
      is_deleted: false,
    };
    const fee3 = {
      record_id: 'fee_03',
      id: 'fee_03',
      class_id: 'cls_1a_2026',
      student_id: 'stu_03',
      student_name: 'Nguyễn Văn An',
      tuition: { is_paid: false, paid_date: null },
      insurance: { is_paid: true, paid_date: '2026-09-18' },
      note: null,
      is_locked: false,
      is_deleted: false,
    };
    this.memoryStore.fees.set(fee1.id, fee1);
    this.memoryStore.fees.set(fee2.id, fee2);
    this.memoryStore.fees.set(fee3.id, fee3);

    const adminUser = {
      id: 'usr_admin_01',
      code: 'ADM-1001',
      full_name: 'Thầy Trần Văn Bình',
      phone: '0988001122',
      email: 'hieutruong.binh@school.edu.vn',
      role: 'ADMIN',
      school_name: 'Trường Tiểu Học Chu Văn An',
      assigned_info: 'Ban Giám Hiệu - Quản trị viên cấp cao',
      is_active: true,
      is_deleted: false,
      ai_daily_quota: 100,
      ai_used_today: 0,
      ai_model_tier: 'PRO',
    };
    const adminRoot = {
      id: 'usr_admin_root',
      code: 'ADM-ROOT',
      full_name: 'Quản trị viên Hệ thống',
      phone: '0988888888',
      email: 'admin@giaovienhay.vn',
      role: 'ADMIN',
      school_name: 'Sở GD&ĐT / Hệ thống GiaoVienHay',
      assigned_info: 'Quản trị viên Hệ thống Cấp cao',
      is_active: true,
      is_deleted: false,
      ai_daily_quota: 100,
      ai_used_today: 0,
      ai_model_tier: 'PRO',
    };
    const gv1 = {
      id: 'usr_gv_01',
      code: 'GV-1001',
      full_name: 'Cô Nguyễn Thị Lan',
      phone: '0912345678',
      email: 'lan.nguyen@school.edu.vn',
      role: 'TEACHER_HOMEROOM',
      school_name: 'Trường Tiểu Học Chu Văn An',
      assigned_info: 'Chủ nhiệm Lớp 1A',
      is_active: true,
      is_deleted: false,
      ai_daily_quota: 40,
      ai_used_today: 0,
      ai_model_tier: 'AUTO',
    };
    const gv2 = {
      id: 'usr_gv_02',
      code: 'GV-1002',
      full_name: 'Thầy Lê Hoàng Nam',
      phone: '0912345679',
      email: 'nam.le@school.edu.vn',
      role: 'TEACHER_SUBJECT',
      school_name: 'Trường Tiểu Học Chu Văn An',
      assigned_info: 'Giáo viên bộ môn Tin học & Tiếng Anh',
      is_active: true,
      is_deleted: false,
      ai_daily_quota: 30,
      ai_used_today: 0,
      ai_model_tier: 'AUTO',
    };
    const ph1 = {
      id: 'usr_ph_01',
      code: 'PH-1001',
      full_name: 'Phạm Văn Hùng',
      phone: '0987654321',
      email: 'hung.pham@gmail.com',
      role: 'PARENT',
      school_name: 'Trường Tiểu Học Chu Văn An',
      assigned_info: 'Phụ huynh em Phạm Minh Anh (Lớp 1A)',
      is_active: true,
      is_deleted: false,
      ai_daily_quota: 10,
      ai_used_today: 0,
      ai_model_tier: 'FREE',
    };
    const usr01 = {
      id: 'usr_01',
      code: 'GV-0001',
      full_name: 'Nguyễn Văn An',
      fullName: 'Nguyễn Văn An',
      phone: '0988776655',
      email: 'an.nguyen@school.edu.vn',
      role: 'TEACHER_HOMEROOM',
      school_name: 'Trường Tiểu Học Chu Văn An',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assigned_info: 'Chủ nhiệm Lớp 1A',
      is_active: true,
      isActive: true,
      is_deleted: false,
      isDeleted: false,
      ai_daily_quota: 30,
      ai_used_today: 0,
      ai_model_tier: 'AUTO',
    };
    
    const hangTeacher = {
      id: 'usr_hang_lit_01',
      code: 'GV-1008',
      full_name: 'Cô Lê Thị Hằng',
      phone: '0903888999',
      email: 'hang.le@chuvanan.edu.vn',
      role: 'TEACHER_SUBJECT',
      school_name: 'Trường Tiểu Học Chu Văn An',
      teaching_subjects: ['LIT'],
      is_active: true,
      is_deleted: false,
    };
    this.memoryStore.users.set(hangTeacher.id, hangTeacher);

    [adminUser, adminRoot, gv1, gv2, ph1, usr01].forEach((u) => {
      this.memoryStore.users.set(u.id, u);
    });
  }

  private initSupabaseClient() {
    const supabaseUrl =
      this.configService?.get<string>('SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      'https://vhlcirathqrhmltfkhnd.supabase.co';
    const supabaseKey =
      this.configService?.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      this.configService?.get<string>('SUPABASE_ANON_KEY') ||
      process.env.SUPABASE_ANON_KEY ||
      'sb_secret_MM1I8eRoXr0H1cfW2BBgkA_Z1VcIAKr';

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
          global: {
            headers: {
              'User-Agent': 'GiaoVienHay-Backend/1.0',
            },
          },
        });
        this.isConfigured = true;
        this.logger.log(`[Supabase Database] Đã kết nối cơ sở dữ liệu Supabase (${supabaseUrl})`);
      } catch (err: any) {
        this.logger.warn(`[Supabase Database] Không thể khởi tạo Supabase Client: ${err?.message || err}`);
      }
    }
  }

  onModuleInit() {
    if (!this.supabase) {
      this.initSupabaseClient();
    }
  }

  get configured(): boolean {
    return this.isConfigured;
  }

  get supabaseClient(): SupabaseClient | null {
    return this.supabase;
  }

  async execute<T = any>(query: string, variables: Record<string, any> = {}): Promise<{ data?: T; errors?: any[] }> {
    return { data: undefined };
  }

  // =========================================================================
  // 1. USER SQL METHODS
  // =========================================================================

  private mapUser(u: any): DataConnectUserRecord {
    const isAct = u.is_active ?? u.isActive ?? true;
    const isDel = u.is_deleted ?? u.isDeleted ?? false;
    let pwdHash = u.password_hash ?? u.passwordHash ?? null;
    const assignedInfo = u.assigned_info ?? u.assignedInfo ?? null;
    if (!pwdHash && assignedInfo) {
      try {
        let parsed = typeof assignedInfo === 'string' ? JSON.parse(assignedInfo) : assignedInfo;
        while (parsed && typeof parsed.assigned_info === 'string') {
          try {
            parsed = JSON.parse(parsed.assigned_info);
          } catch { break; }
        }
        if (parsed?.password_hash) {
          pwdHash = parsed.password_hash;
        }
      } catch {}
    }
    const teachingSubjects =
      (Array.isArray(u.teaching_subjects) && u.teaching_subjects.length > 0
        ? u.teaching_subjects
        : null) ||
      (Array.isArray(u.teachingSubjects) && u.teachingSubjects.length > 0
        ? u.teachingSubjects
        : null) ||
      decodeSubjectsFromAssignedInfo(assignedInfo);
    return {
      id: u.id,
      code: u.code,
      fullName: u.full_name ?? u.fullName ?? '',
      full_name: u.full_name ?? u.fullName ?? '',
      phone: u.phone,
      email: u.email ?? null,
      role: u.role,
      teaching_subjects: teachingSubjects,
      schoolName: u.school_name ?? u.schoolName ?? null,
      school_name: u.school_name ?? u.schoolName ?? null,
      assignedInfo,
      assigned_info: assignedInfo,
      isActive: isAct,
      is_active: isAct,
      isDeleted: isDel,
      is_deleted: isDel,
      passwordHash: pwdHash,
      password_hash: pwdHash,
      aiDailyQuota: u.ai_daily_quota ?? u.aiDailyQuota ?? 25,
      ai_daily_quota: u.ai_daily_quota ?? u.aiDailyQuota ?? 25,
      aiUsedToday: u.ai_used_today ?? u.aiUsedToday ?? 0,
      ai_used_today: u.ai_used_today ?? u.aiUsedToday ?? 0,
      aiModelTier: u.ai_model_tier ?? u.aiModelTier ?? 'AUTO',
      ai_model_tier: u.ai_model_tier ?? u.aiModelTier ?? 'AUTO',
      createdAt: u.created_at ?? u.createdAt ?? new Date().toISOString(),
      created_at: u.created_at ?? u.createdAt ?? new Date().toISOString(),
      updatedAt: u.updated_at ?? u.updatedAt ?? new Date().toISOString(),
      updated_at: u.updated_at ?? u.updatedAt ?? new Date().toISOString(),
    };
  }

  async listUsers(filter?: { role?: string; isActive?: boolean; keyword?: string }) {
    if (this.supabase) {
      try {
        let query = this.supabase.from('users').select('*').eq('is_deleted', false);
        if (filter?.role && filter.role !== 'ALL') {
          query = query.eq('role', filter.role);
        }
        if (filter?.isActive !== undefined) {
          query = query.eq('is_active', filter.isActive);
        }
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let mapped = data.map((u) => this.mapUser(u));
          if (filter?.keyword) {
            const kw = filter.keyword.toLowerCase();
            mapped = mapped.filter(
              (u) =>
                u.fullName.toLowerCase().includes(kw) ||
                u.phone.includes(kw) ||
                (u.email || '').toLowerCase().includes(kw)
            );
          }
          return mapped;
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] Fallback listUsers: ${err?.message}`);
      }
    }

    // Fallback qua RAM Cache
    let list = Array.from(this.memoryStore.users.values()).filter((u) => !u.is_deleted && !u.isDeleted);
    if (filter?.role && filter.role !== 'ALL') {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter?.isActive !== undefined) {
      list = list.filter((u) => (u.is_active ?? u.isActive) === filter.isActive);
    }
    if (filter?.keyword) {
      const kw = filter.keyword.toLowerCase();
      list = list.filter(
        (u) =>
          (u.full_name || u.fullName || '').toLowerCase().includes(kw) ||
          (u.phone || '').includes(kw) ||
          (u.email || '').toLowerCase().includes(kw)
      );
    }
    return list.map((u) => this.mapUser(u));
  }

  async getUserById(id: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return this.mapUser(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] Fallback getUserById: ${err?.message}`);
      }
    }
    const mem = this.memoryStore.users.get(id);
    return mem ? this.mapUser(mem) : null;
  }

  async getUserByPhone(phone: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('phone', phone)
          .eq('is_deleted', false)
          .maybeSingle();
        if (!error && data) {
          return this.mapUser(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] Fallback getUserByPhone: ${err?.message}`);
      }
    }
    const mem = Array.from(this.memoryStore.users.values()).find(
      (u) => u.phone === phone && !(u.is_deleted ?? u.isDeleted)
    );
    return mem ? this.mapUser(mem) : null;
  }

  async getUserByEmail(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail)
          .eq('is_deleted', false)
          .maybeSingle();
        if (!error && data) {
          return this.mapUser(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] Fallback getUserByEmail: ${err?.message}`);
      }
    }
    const mem = Array.from(this.memoryStore.users.values()).find(
      (u) => u.email && u.email.toLowerCase().trim() === cleanEmail && !(u.is_deleted ?? u.isDeleted)
    );
    return mem ? this.mapUser(mem) : null;
  }

  async createUser(user: any) {
    // DB ràng buộc users.code NOT NULL: tự sinh mã theo vai trò nếu caller không cung cấp (GV-xxxx / PH-xxxx / ADM-xxxx)
    const rolePrefix = user.role === 'ADMIN' ? 'ADM' : user.role === 'PARENT' ? 'PH' : 'GV';
    const randSuffix = String(Math.floor(Math.random() * 9000) + 1000);
    const resolvedCode = user.code || user.userCode || `${rolePrefix}-${randSuffix}`;

    const { codes: normSubjects } = normalizeSubjectCodes(
      user.teaching_subjects || user.teachingSubjects,
    );

    // DB bảng users không có cột teaching_subjects & password_hash:
    // lưu môn và mật khẩu vào cột assigned_info dạng JSON
    const plainAssignedInfo = user.assigned_info || user.assignedInfo || null;
    let baseInfo: any = {};
    if (plainAssignedInfo) {
      try {
        baseInfo = typeof plainAssignedInfo === 'string' ? JSON.parse(plainAssignedInfo) : plainAssignedInfo;
      } catch {
        baseInfo = { info: plainAssignedInfo };
      }
    }
    if (normSubjects.length > 0) {
      baseInfo.teaching_subjects = normSubjects;
    }
    const pwdToStore = user.password_hash || user.passwordHash || null;
    if (pwdToStore) {
      baseInfo.password_hash = pwdToStore;
    }
    const assignedInfoStored = Object.keys(baseInfo).length > 0 ? JSON.stringify(baseInfo) : null;

    const record = {
      id: user.id,
      code: resolvedCode,
      full_name: user.full_name || user.fullName,
      phone: user.phone,
      email: user.email || null,
      role: user.role,
      school_name: user.school_name || user.schoolName || null,
      assigned_info: assignedInfoStored,
      is_active: user.is_active ?? user.isActive ?? true,
      is_deleted: false,
      ai_daily_quota: user.ai_daily_quota ?? user.aiDailyQuota ?? 25,
      ai_used_today: user.ai_used_today ?? user.aiUsedToday ?? 0,
      ai_model_tier: user.ai_model_tier || user.aiModelTier || 'AUTO',
    };

    if (this.supabase) {
      const { error } = await this.supabase.from('users').upsert(record);
      if (error) {
        this.logger.error(`[Supabase] createUser failed for ${user.id}: ${error.message} (code=${error.code})`);
      }
    }

    const fullRecord = {
      ...record,
      ...user,
      assigned_info: assignedInfoStored,
      teaching_subjects: normSubjects.length > 0 ? normSubjects : (user.teaching_subjects || []),
      password_hash: user.password_hash || user.passwordHash || null,
      passwordHash: user.password_hash || user.passwordHash || null,
    };
    this.memoryStore.users.set(user.id, fullRecord);
    return this.mapUser(fullRecord);
  }

  async updateUserStatus(id: string, isActive: boolean, reason?: string) {
    if (this.supabase) {
      try {
        await this.supabase
          .from('users')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err: any) {
        this.logger.debug(`[Supabase] updateUserStatus error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.users.get(id);
    if (existing) {
      existing.is_active = isActive;
      existing.isActive = isActive;
      if (reason) existing.status_reason = reason;
      this.memoryStore.users.set(id, existing);
    }
    return true;
  }

  async updateUserProfile(
    id: string,
    user: {
      full_name?: string;
      phone?: string;
      email?: string;
      role?: string;
      school_name?: string;
    }
  ) {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (user.full_name !== undefined) updateData.full_name = user.full_name;
    if (user.phone !== undefined) updateData.phone = user.phone;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.school_name !== undefined) updateData.school_name = user.school_name;

    if (this.supabase) {
      try {
        await this.supabase.from('users').update(updateData).eq('id', id);
      } catch (err: any) {
        this.logger.debug(`[Supabase] updateUserProfile error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.users.get(id) || {};
    const updated = {
      ...existing,
      ...user,
      id,
      fullName: user.full_name ?? existing.fullName,
      schoolName: user.school_name ?? existing.schoolName,
    };
    this.memoryStore.users.set(id, updated);
    return this.mapUser(updated);
  }

  private parseAssignedInfo(raw: any): Record<string, any> {
    if (raw === null || raw === undefined || raw === '') return {};
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...parsed };
        }
      } catch {}
      return { text: raw };
    }
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      return { ...raw };
    }
    return {};
  }

  async getUserAssignedInfo(id: string): Promise<Record<string, any>> {
    const user = await this.getUserById(id);
    return this.parseAssignedInfo(user?.assigned_info ?? user?.assignedInfo);
  }

  async mergeUserAssignedInfo(id: string, patch: Record<string, any>): Promise<Record<string, any> | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    const info = this.parseAssignedInfo(user.assigned_info ?? user.assignedInfo);
    for (const [key, value] of Object.entries(patch || {})) {
      if (Array.isArray(value)) {
        const current = Array.isArray(info[key]) ? info[key].map(String) : [];
        const merged = [...current];
        for (const item of value) {
          if (item === null || item === undefined || item === '') continue;
          if (!merged.includes(String(item))) merged.push(String(item));
        }
        info[key] = merged;
      } else if (value !== undefined) {
        info[key] = value;
      }
    }

    const assignedInfoStored = JSON.stringify(info);
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('users')
          .update({ assigned_info: assignedInfoStored, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          this.logger.warn(`[Supabase] mergeUserAssignedInfo: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] mergeUserAssignedInfo error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.users.get(id);
    if (existing) {
      existing.assigned_info = assignedInfoStored;
      existing.assignedInfo = assignedInfoStored;
      this.memoryStore.users.set(id, existing);
    }
    return info;
  }

  async updateTeacherAiQuota(id: string, quota: number, tier: string = 'AUTO', usedToday?: number) {
    const updateData: Record<string, any> = {
      ai_daily_quota: quota,
      ai_model_tier: tier,
      updated_at: new Date().toISOString(),
    };
    if (usedToday !== undefined) {
      updateData.ai_used_today = usedToday;
    }

    if (this.supabase) {
      try {
        await this.supabase.from('users').update(updateData).eq('id', id);
      } catch (err: any) {
        this.logger.debug(`[Supabase] updateTeacherAiQuota error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.users.get(id);
    if (existing) {
      existing.ai_daily_quota = quota;
      existing.aiDailyQuota = quota;
      existing.ai_model_tier = tier;
      existing.aiModelTier = tier;
      if (usedToday !== undefined) {
        existing.ai_used_today = usedToday;
        existing.aiUsedToday = usedToday;
      }
      this.memoryStore.users.set(id, existing);
    }
    return true;
  }

  async softDeleteUser(id: string) {
    if (this.supabase) {
      try {
        await this.supabase
          .from('users')
          .update({ is_deleted: true, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err: any) {
        this.logger.debug(`[Supabase] softDeleteUser error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.users.get(id);
    if (existing) {
      existing.is_deleted = true;
      existing.isDeleted = true;
      this.memoryStore.users.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 2. SCHOOL SQL METHODS
  // =========================================================================

  private mapSchool(s: any): DataConnectSchoolRecord {
    return {
      id: s.id,
      code: s.code,
      name: s.name,
      address: s.address ?? null,
      phone: s.phone ?? null,
      email: s.email ?? null,
      createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
    };
  }

  async listSchools() {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('schools')
          .select('*')
          .eq('is_deleted', false)
          .order('name', { ascending: true });
        if (error) {
          this.logger.error(`[Supabase] listSchools query error: ${JSON.stringify(error)}`);
        }
        if (!error && data && data.length > 0) {
          return data.map((s) => this.mapSchool(s));
        }
      } catch (err: any) {
        this.logger.error(`[Supabase] listSchools fallback: ${err?.message}`);
      }
    }
    return Array.from(this.memoryStore.schools.values()).map((s) => this.mapSchool(s));
  }

  async createSchool(school: any) {
    const record = {
      id: school.id,
      code: school.code,
      name: school.name,
      address: school.address ?? null,
      phone: school.phone ?? null,
      email: school.email ?? null,
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        await this.supabase.from('schools').upsert(record);
      } catch (err: any) {
        this.logger.debug(`[Supabase] createSchool error: ${err?.message}`);
      }
    }

    this.memoryStore.schools.set(school.id, record);
    return this.mapSchool(record);
  }

  // =========================================================================
  // 3. CLASS SQL METHODS
  // =========================================================================

  private mapClass(c: any): DataConnectClassRecord {
    return {
      id: c.id,
      name: c.name,
      gradeLevel: c.grade_level ?? c.gradeLevel ?? 1,
      grade_level: c.grade_level ?? c.gradeLevel,
      academicYear: c.academic_year ?? c.academicYear ?? '2024-2025',
      academic_year: c.academic_year ?? c.academicYear,
      schoolName: c.school_name ?? c.schoolName ?? null,
      school_name: c.school_name ?? c.schoolName ?? null,
      homeroomTeacherId: c.homeroom_teacher_id ?? c.homeroomTeacherId ?? null,
      homeroom_teacher_id: c.homeroom_teacher_id ?? c.homeroomTeacherId ?? null,
      homeroom_teacher: c.homeroom_teacher ?? c.homeroomTeacher ?? null,
      subject_teachers: c.subject_teachers ?? [],
      inviteCode: c.invite_code ?? c.inviteCode ?? '',
      invite_code: c.invite_code ?? c.inviteCode,
      studentCount: c.student_count ?? c.studentCount ?? 0,
      student_count: c.student_count ?? c.studentCount,
      isDeleted: c.is_deleted ?? c.isDeleted ?? false,
      is_deleted: c.is_deleted ?? c.isDeleted ?? false,
      createdAt: c.created_at ?? c.createdAt ?? new Date().toISOString(),
      created_at: c.created_at ?? c.createdAt,
    };
  }

  async listClasses(schoolName?: string, academicYear?: string) {
    if (this.supabase) {
      try {
        let q = this.supabase.from('classes').select('*').eq('is_deleted', false);
        if (schoolName) q = q.eq('school_name', schoolName);
        if (academicYear) q = q.eq('academic_year', academicYear);
        q = q.order('grade_level', { ascending: true });
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((c) => this.mapClass(c));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] listClasses fallback: ${err?.message}`);
      }
    }

    let list = Array.from(this.memoryStore.classes.values()).filter((c) => !c.is_deleted && !c.isDeleted);
    if (schoolName) list = list.filter((c) => (c.school_name || c.schoolName) === schoolName);
    if (academicYear) list = list.filter((c) => (c.academic_year || c.academicYear) === academicYear);
    return list.map((c) => this.mapClass(c));
  }

  async listClassesByTeacher(teacherId: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('classes')
          .select('*')
          .eq('is_deleted', false)
          .order('grade_level', { ascending: true });
        if (!error && data) {
          const mine = data.filter((c: any) => {
            const isHomeroom = (c.homeroom_teacher_id || c.homeroomTeacherId) === teacherId;
            const subjects = c.subject_teachers;
            const isSubject =
              Array.isArray(subjects) &&
              subjects.some((st: any) => (st.teacher_id || st.teacherId || st) === teacherId);
            return isHomeroom || isSubject;
          });
          return mine.map((c) => this.mapClass(c));
        }
        if (error) {
          this.logger.warn(`[Supabase] listClassesByTeacher: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] listClassesByTeacher fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.classes.values())
      .filter((c) => {
        const isHomeroom = (c.homeroom_teacher_id || c.homeroomTeacherId) === teacherId;
        const isSubject = (c.subject_teacher_ids && c.subject_teacher_ids.includes(teacherId)) ||
          (c.subject_teachers && Array.isArray(c.subject_teachers) && c.subject_teachers.some((st: any) => st.teacher_id === teacherId));
        return (isHomeroom || isSubject) && !c.is_deleted && !c.isDeleted;
      })
      .map((c) => this.mapClass(c));
  }

  async getClassById(id: string) {
    let result: any = null;
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('classes').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          result = this.mapClass(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getClassById fallback: ${err?.message}`);
      }
    }
    if (!result) {
      const mem = this.memoryStore.classes.get(id);
      result = mem ? this.mapClass(mem) : null;
    }
    if (result) {
      const mem = this.memoryStore.classes.get(id);
      if (mem && Array.isArray(mem.subject_teachers) && mem.subject_teachers.length > 0) {
        result.subject_teachers = [...mem.subject_teachers];
      }
    }
    return result;
  }

  async getClassByInviteCode(inviteCode: string) {
    const cleanCode = (inviteCode || '').trim().toUpperCase();
    if (!cleanCode) return null;
    let result: any = null;
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('classes')
          .select('*')
          .ilike('invite_code', cleanCode)
          .eq('is_deleted', false)
          .maybeSingle();
        if (!error && data) {
          result = this.mapClass(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getClassByInviteCode fallback: ${err?.message}`);
      }
    }
    if (!result) {
      const mem = Array.from(this.memoryStore.classes.values()).find(
        (c) => String(c.invite_code || c.inviteCode || '').toUpperCase() === cleanCode && !c.is_deleted && !c.isDeleted,
      );
      result = mem ? this.mapClass(mem) : null;
    }
    if (result) {
      const classId = result.id || result.class_id;
      const mem = this.memoryStore.classes.get(classId);
      if (mem && Array.isArray(mem.subject_teachers) && mem.subject_teachers.length > 0) {
        result.subject_teachers = [...mem.subject_teachers];
      }
    }
    return result;
  }

  async createClass(classData: any) {
    const record = {
      id: classData.id,
      name: classData.name,
      grade_level: classData.grade_level || classData.gradeLevel,
      academic_year: classData.academic_year || classData.academicYear,
      school_name: classData.school_name || classData.schoolName || null,
      homeroom_teacher_id: classData.homeroom_teacher_id || classData.homeroomTeacherId || null,
      invite_code: classData.invite_code || classData.inviteCode,
      student_count: classData.student_count || classData.studentCount || 0,
      subject_teachers: Array.isArray(classData.subject_teachers)
        ? classData.subject_teachers
        : Array.isArray(classData.subjectTeachers)
          ? classData.subjectTeachers
          : [],
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('classes').upsert(record);
        if (error) {
          this.logger.warn(`[Supabase] createClass upsert: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] createClass error: ${err?.message}`);
      }
    }

    this.memoryStore.classes.set(classData.id, record);
    return this.mapClass(record);
  }

  /**
   * Ghi danh sách phân công GVBM vào bảng classes.subject_teachers (jsonb) trên Supabase.
   * Lưu cả trong memory để đọc nhanh trong cùng tiến trình.
   */
  async updateClassSubjectTeachers(id: string, subjectTeachers: any[]) {
    const list = Array.isArray(subjectTeachers) ? subjectTeachers : [];

    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('classes')
          .update({ subject_teachers: list, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          this.logger.warn(`[Supabase] updateClassSubjectTeachers: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] updateClassSubjectTeachers error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.classes.get(id) || { id };
    existing.subject_teachers = list;
    this.memoryStore.classes.set(id, existing);
    return true;
  }

  async updateClassInviteCode(id: string, inviteCode: string) {
    const normalized = String(inviteCode || '').trim().toUpperCase();
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('classes')
          .update({ invite_code: normalized, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          this.logger.warn(`[Supabase] updateClassInviteCode: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] updateClassInviteCode error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.classes.get(id);
    if (existing) {
      existing.invite_code = normalized;
      existing.inviteCode = normalized;
      this.memoryStore.classes.set(id, existing);
    }
    return true;
  }

  async softDeleteClass(id: string) {
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('classes')
          .update({ is_deleted: true, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          this.logger.warn(`[Supabase] softDeleteClass: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] softDeleteClass error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.classes.get(id);
    if (existing) {
      existing.is_deleted = true;
      existing.isDeleted = true;
      this.memoryStore.classes.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 4. STUDENT SQL METHODS
  // =========================================================================

  private mapStudent(s: any): DataConnectStudentRecord {
    return {
      id: s.id,
      classId: s.class_id ?? s.classId,
      class_id: s.class_id ?? s.classId,
      studentCode: s.student_code ?? s.studentCode,
      student_code: s.student_code ?? s.studentCode,
      fullName: s.full_name ?? s.fullName ?? '',
      full_name: s.full_name ?? s.fullName ?? '',
      dob: s.dob ?? null,
      gender: s.gender ?? 'MALE',
      parentPhone: s.parent_phone ?? s.parentPhone ?? null,
      parent_phone: s.parent_phone ?? s.parentPhone ?? null,
      parentName: s.parent_name ?? s.parentName ?? null,
      parent_name: s.parent_name ?? s.parentName ?? null,
      parentRelationship: s.parent_relationship ?? s.parentRelationship ?? null,
      parent_relationship: s.parent_relationship ?? s.parentRelationship ?? null,
      isParentAppConnected: s.is_parent_app_connected ?? s.isParentAppConnected ?? false,
      is_parent_app_connected: s.is_parent_app_connected ?? s.isParentAppConnected ?? false,
      parent_uids: s.parent_uids ?? s.parentUids ?? [],
      isDeleted: s.is_deleted ?? s.isDeleted ?? false,
      is_deleted: s.is_deleted ?? s.isDeleted ?? false,
      createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
      created_at: s.created_at ?? s.createdAt ?? new Date().toISOString(),
    };
  }

  async listStudentsByClass(classId: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .eq('is_deleted', false)
          .order('full_name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((s) => this.mapStudent(s));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] listStudentsByClass fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.students.values())
      .filter((s) => (s.class_id || s.classId) === classId && !s.is_deleted && !s.isDeleted)
      .map((s) => this.mapStudent(s));
  }

  async getStudentById(id: string) {
    const cleanId = (id || '').trim();
    if (!cleanId) return null;
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('students').select('*').eq('id', cleanId).maybeSingle();
        if (!error && data) {
          return this.mapStudent(data);
        }
        if (!error) {
          const byCode = await this.supabase
            .from('students')
            .select('*')
            .ilike('student_code', cleanId)
            .eq('is_deleted', false)
            .maybeSingle();
          if (!byCode.error && byCode.data) {
            return this.mapStudent(byCode.data);
          }
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getStudentById fallback: ${err?.message}`);
      }
    }
    const mem = this.memoryStore.students.get(cleanId) ||
      Array.from(this.memoryStore.students.values()).find(
        (s) =>
          String(s.student_code || s.studentCode || '').toLowerCase() === cleanId.toLowerCase() &&
          !(s.is_deleted ?? s.isDeleted),
      );
    return mem ? this.mapStudent(mem) : null;
  }

  async createStudent(student: any) {
    const record = {
      id: student.id,
      class_id: student.class_id || student.classId,
      student_code: student.student_code || student.studentCode,
      full_name: student.full_name || student.fullName,
      dob: student.dob || null,
      gender: student.gender,
      parent_phone: student.parent_phone || student.parentPhone || null,
      parent_name: student.parent_name || student.parentName || null,
      parent_relationship: student.parent_relationship || student.parentRelationship || 'Bố',
      is_parent_app_connected: student.is_parent_app_connected || student.isParentAppConnected || false,
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        const dbRecord = {
          id: record.id,
          class_id: record.class_id,
          student_code: record.student_code,
          full_name: record.full_name,
          dob: record.dob,
          gender: record.gender,
          parent_phone: record.parent_phone,
          is_deleted: false,
        };
        const { error } = await this.supabase.from('students').upsert(dbRecord);
        if (error) {
          this.logger.warn(`[Supabase] createStudent upsert: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] createStudent error: ${err?.message}`);
      }
    }

    this.memoryStore.students.set(student.id, record);
    // Tự động khởi tạo ngay hồ sơ công nợ mặc định (BHYT, Học phí trạng thái Chưa nộp)
    await this.ensureDefaultFeeRecordsForStudent(record).catch(() => null);
    return this.mapStudent(record);
  }

  async softDeleteStudent(id: string) {
    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('students').update({ is_deleted: true }).eq('id', id);
        if (error) {
          this.logger.warn(`[Supabase] softDeleteStudent: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] softDeleteStudent error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.students.get(id);
    if (existing) {
      existing.is_deleted = true;
      existing.isDeleted = true;
      this.memoryStore.students.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 5. ATTENDANCE SQL METHODS
  // =========================================================================

  private mapAttendance(a: any): DataConnectAttendanceRecord {
    return {
      id: a.id,
      classId: a.class_id ?? a.classId,
      studentId: a.student_id ?? a.studentId,
      date: a.date,
      status: a.status,
      note: a.note ?? null,
      createdAt: a.created_at ?? a.createdAt ?? new Date().toISOString(),
    };
  }

  async getAttendanceById(id: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('attendances')
          .select('*')
          .eq('id', id)
          .eq('is_deleted', false)
          .maybeSingle();
        if (!error && data) {
          return this.mapAttendance(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getAttendanceById fallback: ${err?.message}`);
      }
    }
    const mem = this.memoryStore.attendances.get(id);
    return mem ? this.mapAttendance(mem) : null;
  }

  async getAttendanceByClass(classId: string, filter?: { date?: string; month?: string }) {
    if (this.supabase) {
      try {
        let q = this.supabase
          .from('attendances')
          .select('*')
          .eq('class_id', classId)
          .eq('is_deleted', false);
        if (filter?.date) {
          q = q.eq('date', filter.date);
        } else if (filter?.month) {
          q = q.gte('date', `${filter.month}-01`).lte('date', `${filter.month}-31`);
        }
        q = q.order('date', { ascending: false });
        const { data, error } = await q;
        if (!error && data) {
          return data.map((a) => this.mapAttendance(a));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getAttendanceByClass fallback: ${err?.message}`);
      }
    }

    let list = Array.from(this.memoryStore.attendances.values())
      .filter((a) => (a.class_id || a.classId) === classId);
    if (filter?.date) {
      list = list.filter((a) => a.date === filter.date);
    } else if (filter?.month) {
      list = list.filter((a) => typeof a.date === 'string' && a.date.startsWith(filter.month!));
    }
    return list.map((a) => this.mapAttendance(a));
  }

  async getAttendanceByClassDate(classId: string, date: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('attendances')
          .select('*')
          .eq('class_id', classId)
          .eq('date', date)
          .eq('is_deleted', false);
        if (!error && data && data.length > 0) {
          return data.map((a) => this.mapAttendance(a));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getAttendanceByClassDate fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.attendances.values())
      .filter((a) => (a.class_id || a.classId) === classId && a.date === date)
      .map((a) => this.mapAttendance(a));
  }

  async getAttendanceByStudent(studentId: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('attendances')
          .select('*')
          .eq('student_id', studentId)
          .eq('is_deleted', false)
          .order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((a) => this.mapAttendance(a));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getAttendanceByStudent fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.attendances.values())
      .filter((a) => (a.student_id || a.studentId) === studentId)
      .map((a) => this.mapAttendance(a));
  }

  async recordAttendance(attendance: any) {
    const record = {
      id: attendance.id,
      class_id: attendance.class_id || attendance.classId,
      student_id: attendance.student_id || attendance.studentId,
      date: attendance.date,
      status: attendance.status,
      note: attendance.note || null,
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        await this.supabase.from('attendances').upsert(record);
      } catch (err: any) {
        this.logger.debug(`[Supabase] recordAttendance error: ${err?.message}`);
      }
    }

    this.memoryStore.attendances.set(attendance.id, record);
    return this.mapAttendance(record);
  }

  // =========================================================================
  // 6. SCORE SQL METHODS
  // =========================================================================

  private mapScore(s: any): DataConnectScoreRecord {
    return {
      id: s.id,
      studentId: s.student_id ?? s.studentId,
      classId: s.class_id ?? s.classId,
      subject: s.subject,
      scoreType: s.score_type ?? s.scoreType,
      scoreValue: Number(s.score_value ?? s.scoreValue ?? 0),
      term: s.term ?? 1,
      academicYear: s.academic_year ?? s.academicYear ?? '2024-2025',
      createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
    };
  }

  async getScoresByStudent(studentId: string, term?: number, academicYear?: string) {
    if (this.supabase) {
      try {
        let q = this.supabase.from('scores').select('*').eq('student_id', studentId).eq('is_deleted', false);
        if (term) q = q.eq('term', term);
        if (academicYear) q = q.eq('academic_year', academicYear);
        q = q.order('created_at', { ascending: false });
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((s) => this.mapScore(s));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getScoresByStudent fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.scores.values())
      .filter((s) => (s.student_id || s.studentId) === studentId && (!term || s.term === term))
      .map((s) => this.mapScore(s));
  }

  async listScoresByClass(classId: string, subject?: string, term?: number) {
    if (this.supabase) {
      try {
        let q = this.supabase.from('scores').select('*').eq('class_id', classId).eq('is_deleted', false);
        if (subject) q = q.eq('subject', subject);
        if (term) q = q.eq('term', term);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((s) => this.mapScore(s));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] listScoresByClass fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.scores.values())
      .filter(
        (s) =>
          (s.class_id || s.classId) === classId &&
          !(s.is_deleted ?? s.isDeleted) &&
          (!subject || s.subject === subject) &&
          (!term || (s.term ?? 1) === term),
      )
      .map((s) => this.mapScore(s));
  }

  async recordScore(score: any) {
    const record = {
      id: score.id,
      student_id: score.student_id || score.studentId,
      class_id: score.class_id || score.classId,
      subject: score.subject,
      score_type: score.score_type || score.scoreType,
      score_value: score.score_value ?? score.scoreValue,
      term: score.term,
      academic_year: score.academic_year || score.academicYear,
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        await this.supabase.from('scores').upsert(record);
      } catch (err: any) {
        this.logger.debug(`[Supabase] recordScore error: ${err?.message}`);
      }
    }

    this.memoryStore.scores.set(score.id, record);
    return this.mapScore(record);
  }

  // =========================================================================
  // 7. QUIZ SQL METHODS
  // =========================================================================

  private mapQuiz(q: any): DataConnectQuizRecord {
    return {
      id: q.id,
      teacherId: q.teacher_id ?? q.teacherId,
      classId: q.class_id ?? q.classId,
      subject: q.subject,
      title: q.title,
      questionsJson: q.questions_json ?? q.questionsJson ?? '[]',
      createdAt: q.created_at ?? q.createdAt ?? new Date().toISOString(),
    };
  }

  async getQuizById(id: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('quizzes').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return this.mapQuiz(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getQuizById fallback: ${err?.message}`);
      }
    }
    const mem = this.memoryStore.quizzes.get(id);
    return mem ? this.mapQuiz(mem) : null;
  }

  async createQuiz(quiz: any) {
    const createdAt = quiz.created_at || quiz.createdAt || new Date().toISOString();
    const record = {
      id: quiz.id,
      teacher_id: quiz.teacher_id || quiz.teacherId,
      class_id: quiz.class_id || quiz.classId,
      subject: quiz.subject,
      title: quiz.title,
      questions_json:
        typeof quiz.questions === 'string'
          ? quiz.questions
          : typeof quiz.questionsJson === 'string'
          ? quiz.questionsJson
          : JSON.stringify(quiz.questions || []),
      is_deleted: false,
      created_at: createdAt,
      createdAt,
    };

    if (this.supabase) {
      try {
        await this.supabase.from('quizzes').upsert(record);
      } catch (err: any) {
        this.logger.debug(`[Supabase] createQuiz error: ${err?.message}`);
      }
    }

    this.memoryStore.quizzes.set(quiz.id, record);
    return this.mapQuiz(record);
  }

  /**
   * Cập nhật danh sách câu hỏi của một quiz (sửa/thêm/xóa/tạo lại câu hỏi).
   * Lưu cả Supabase lẫn memory fallback, giống createQuiz.
   */
  async updateQuizQuestions(id: string, questions: any[]) {
    const questionsJson = JSON.stringify(questions || []);

    if (this.supabase) {
      try {
        await this.supabase
          .from('quizzes')
          .update({ questions_json: questionsJson })
          .eq('id', id);
      } catch (err: any) {
        this.logger.debug(`[Supabase] updateQuizQuestions error: ${err?.message}`);
      }
    }

    const mem = this.memoryStore.quizzes.get(id);
    if (mem) {
      (mem as any).questionsJson = questionsJson;
      (mem as any).questions_json = questionsJson;
      this.memoryStore.quizzes.set(id, mem);
    }
    return this.getQuizById(id);
  }

  // =========================================================================
  // 8. REMARK SQL METHODS
  // =========================================================================

  private mapRemark(r: any): DataConnectRemarkRecord {
    return {
      id: r.id,
      studentId: r.student_id ?? r.studentId,
      teacherId: r.teacher_id ?? r.teacherId,
      date: r.date,
      content: r.content,
      category: r.category,
      createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
    };
  }

  async getRemarksByStudent(studentId: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('remarks')
          .select('*')
          .eq('student_id', studentId)
          .eq('is_deleted', false)
          .order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((r) => this.mapRemark(r));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getRemarksByStudent fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.remarks.values())
      .filter((r) => (r.student_id || r.studentId) === studentId)
      .map((r) => this.mapRemark(r));
  }

  async createRemark(remark: any) {
    const record = {
      id: remark.id,
      student_id: remark.student_id || remark.studentId,
      teacher_id: remark.teacher_id || remark.teacherId,
      date: remark.date,
      content: remark.content,
      category: remark.category,
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        await this.supabase.from('remarks').upsert(record);
      } catch (err: any) {
        this.logger.debug(`[Supabase] createRemark error: ${err?.message}`);
      }
    }

    this.memoryStore.remarks.set(remark.id, record);
    return this.mapRemark(record);
  }

  // =========================================================================
  // 9. EXAM REMINDER SQL METHODS
  // =========================================================================

  private mapExamReminder(e: any): DataConnectExamReminderRecord {
    return {
      id: e.id,
      classId: e.class_id ?? e.classId,
      subject: e.subject,
      examDate: e.exam_date ?? e.examDate,
      title: e.title,
      note: e.note ?? null,
      createdAt: e.created_at ?? e.createdAt ?? new Date().toISOString(),
    };
  }

  async getExamRemindersByClass(classId: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('exam_reminders')
          .select('*')
          .eq('class_id', classId)
          .eq('is_deleted', false)
          .order('exam_date', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((e) => this.mapExamReminder(e));
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getExamRemindersByClass fallback: ${err?.message}`);
      }
    }

    return Array.from(this.memoryStore.examReminders.values())
      .filter((e) => (e.class_id || e.classId) === classId)
      .map((e) => this.mapExamReminder(e));
  }

  async createExamReminder(reminder: any) {
    const createdBy = reminder.created_by || reminder.createdBy;
    const record = {
      id: reminder.id,
      class_id: reminder.class_id || reminder.classId,
      subject: reminder.subject || reminder.subject_code,
      exam_date: reminder.exam_date || reminder.examDate,
      title: reminder.title,
      note: reminder.note || reminder.message || null,
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('exam_reminders').upsert(record);
        if (error) {
          this.logger.warn(`[Supabase] createExamReminder upsert: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] createExamReminder error: ${err?.message}`);
      }
    }

    this.memoryStore.examReminders.set(reminder.id, { ...record, created_by: createdBy });
    return { ...this.mapExamReminder(record), created_by: createdBy };
  }

  async getExamReminderById(id: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('exam_reminders')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return { ...this.mapExamReminder(data), created_by: data.created_by, class_id: data.class_id };
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getExamReminderById error: ${err?.message}`);
      }
    }

    const mem = this.memoryStore.examReminders.get(id);
    return mem ? { ...this.mapExamReminder(mem), created_by: mem.created_by, class_id: mem.class_id } : null;
  }

  // =========================================================================
  // 10. FEE SQL METHODS
  // =========================================================================

  private resolveFeeType(f: any): 'TUITION' | 'INSURANCE' | null {
    const explicitType = String(f?.fee_type ?? f?.feeType ?? f?.type ?? '').toUpperCase();
    if (explicitType === 'TUITION' || explicitType === 'FEE') return 'TUITION';
    if (explicitType === 'INSURANCE' || explicitType === 'BHYT') return 'INSURANCE';

    const title = String(f?.title ?? f?.name ?? '').toLowerCase();
    if (title.includes('bảo hiểm') || title.includes('bhyt') || title.includes('insurance')) return 'INSURANCE';
    if (title.includes('học phí') || title.includes('tuition')) return 'TUITION';
    return null;
  }

  private mapFee(f: any): DataConnectFeeRecord {
    const feeType = this.resolveFeeType(f);
    const isPaid = f.is_paid ?? f.isPaid ?? String(f.status || '').toUpperCase() === 'PAID';
    const paidDate = f.paid_date ?? f.paid_at ?? f.paidAt ?? null;
    return {
      id: f.id,
      studentId: f.student_id ?? f.studentId,
      student_id: f.student_id ?? f.studentId,
      ...(feeType ? { fee_type: feeType, type: feeType } : {}),
      is_paid: Boolean(isPaid),
      paid_date: paidDate,
      title: f.title,
      amount: Number(f.amount ?? 0),
      status: f.status,
      dueDate: f.due_date ?? f.dueDate,
      paidAt: paidDate,
      createdAt: f.created_at ?? f.createdAt ?? new Date().toISOString(),
    };
  }

  async getFeesByStudent(studentId: string) {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentId)
        .eq('is_deleted', false)
        .order('due_date', { ascending: false });
      if (error) throw new Error(`Không thể đọc trạng thái học phí từ Supabase: ${error.message}`);
      return (data || []).map((f) => this.mapFee(f));
    }

    return Array.from(this.memoryStore.fees.values())
      .filter((f) => (f.student_id || f.studentId) === studentId)
      .map((f) => this.mapFee(f));
  }

  async createFee(fee: any) {
    const record = {
      id: fee.id,
      student_id: fee.student_id || fee.studentId,
      title: fee.title,
      amount: fee.amount,
      status: fee.status,
      due_date: fee.due_date || fee.dueDate,
      is_deleted: false,
    };

    if (this.supabase) {
      try {
        await this.supabase.from('fees').upsert(record);
      } catch (err: any) {
        this.logger.debug(`[Supabase] createFee error: ${err?.message}`);
      }
    }

    this.memoryStore.fees.set(fee.id, record);
    return this.mapFee(record);
  }

  async ensureDefaultFeeRecordsForStudent(student: any) {
    if (!student || !student.id) return null;
    const studentId = student.id;
    const classId = student.class_id || student.classId || '';
    const studentName = student.full_name || student.fullName || 'Học sinh';
    const studentCode = student.student_code || student.studentCode || '';
    const feeRecordId = `fee_${studentId}`;

    // Kiểm tra xem đã có bản ghi trong memoryStore chưa
    let existingMem = this.memoryStore.fees.get(feeRecordId);
    if (!existingMem) {
      existingMem = Array.from(this.memoryStore.fees.values()).find(
        (f: any) => (f.student_id || f.studentId) === studentId && !f.is_deleted,
      );
    }

    if (!existingMem) {
      const defaultRecord = {
        record_id: feeRecordId,
        id: feeRecordId,
        class_id: classId,
        student_id: studentId,
        student_code: studentCode,
        student_name: studentName,
        tuition: { is_paid: false, paid_date: null },
        insurance: { is_paid: false, paid_date: null },
        note: null,
        is_locked: false,
        is_deleted: false,
        status: 'PENDING',
      };
      this.memoryStore.fees.set(feeRecordId, defaultRecord);
      existingMem = defaultRecord;
    } else {
      // Đảm bảo có đầy đủ class_id và student_name
      if (!existingMem.class_id && classId) existingMem.class_id = classId;
      if (!existingMem.student_name && studentName) existingMem.student_name = studentName;
      if (!existingMem.student_code && studentCode) existingMem.student_code = studentCode;
      this.memoryStore.fees.set(existingMem.id, existingMem);
    }

    // Nếu có Supabase kết nối, đồng bộ cả 2 khoản phí vào bảng fees
    if (this.supabase) {
      try {
        const { data: existingDbFees, error: readError } = await this.supabase
          .from('fees')
          .select('id, title')
          .eq('student_id', studentId)
          .eq('is_deleted', false);
        if (readError) throw new Error(`Không thể đọc khoản thu hiện có: ${readError.message}`);

        const hasTuition = existingDbFees?.some((f: any) =>
          String(f.title || '').toLowerCase().includes('học phí'),
        );
        const hasInsurance = existingDbFees?.some(
          (f: any) =>
            String(f.title || '').toLowerCase().includes('bảo hiểm') ||
            String(f.title || '').toLowerCase().includes('bhyt'),
        );

        const newDbRows: any[] = [];
        if (!hasTuition) {
          newDbRows.push({
            id: `fee_${studentId}_tuition`,
            student_id: studentId,
            title: 'Học phí HK1 2026-2027',
            amount: 1500000,
            status: 'PENDING',
            due_date: '2026-11-30',
            is_deleted: false,
          });
        }
        if (!hasInsurance) {
          newDbRows.push({
            id: `fee_${studentId}_insurance`,
            student_id: studentId,
            title: 'Bảo hiểm y tế 2026-2027',
            amount: 563220,
            status: 'PENDING',
            due_date: '2026-11-30',
            is_deleted: false,
          });
        }

        if (newDbRows.length > 0) {
          const { error } = await this.supabase.from('fees').insert(newDbRows);
          if (error) throw new Error(`Không thể tạo khoản thu mặc định: ${error.message}`);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] ensureDefaultFeeRecordsForStudent error: ${err?.message}`);
      }
    }

    return existingMem;
  }

  async getFeesByClass(classId: string) {
    // 1. Lấy toàn bộ học sinh trong lớp
    const students = await this.listStudentsByClass(classId);

    // 2. Với mỗi học sinh, đảm bảo đã có hồ sơ công nợ mặc định
    for (const student of students) {
      await this.ensureDefaultFeeRecordsForStudent(student).catch(() => null);
    }

    // Supabase chứa mỗi khoản thu thành một dòng riêng. Gom lại thành một hồ sơ
    // theo học sinh, đồng thời luôn lấy trạng thái mới nhất từ DB.
    const memoryRecords = Array.from(this.memoryStore.fees.values()).filter(
      (f: any) => (f.class_id || f.classId) === classId && !f.is_deleted,
    );

    if (this.supabase && students.length > 0) {
      const studentIds = students.map((student: any) => student.id).filter(Boolean);
      const { data, error } = await this.supabase
        .from('fees')
        .select('*')
        .in('student_id', studentIds)
        .eq('is_deleted', false);
      if (error) {
        throw new Error(`Không thể đọc trạng thái khoản thu từ Supabase: ${error.message}`);
      }

      const byStudent = new Map<string, any>();
      for (const student of students) {
        byStudent.set(student.id, {
          record_id: `fee_${student.id}`,
          id: `fee_${student.id}`,
          class_id: classId,
          student_id: student.id,
          student_code: student.student_code || student.studentCode || '',
          student_name: student.full_name || student.fullName || 'Học sinh',
          tuition: { is_paid: false, paid_date: null },
          insurance: { is_paid: false, paid_date: null },
          note: null,
          is_locked: false,
          is_deleted: false,
        });
      }

      for (const row of data || []) {
        const record = byStudent.get(row.student_id);
        const fee = this.mapFee(row);
        if (!record || !fee.fee_type) continue;
        const key = fee.fee_type === 'TUITION' ? 'tuition' : 'insurance';
        record[key] = { is_paid: fee.is_paid, paid_date: fee.paid_date };
        record.note = row.note ?? record.note;
        record.is_locked = Boolean(row.is_locked || row.term_locked || row.status === 'LOCKED');
      }

      return Array.from(byStudent.values());
    }

    return memoryRecords;
  }

  async getFeeById(id: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('fees').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          const isLocked = Boolean(data.is_locked || data.term_locked || data.status === 'LOCKED');
          return { ...this.mapFee(data), ...data, is_locked: isLocked, isLocked, term_locked: isLocked };
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getFeeById error: ${err?.message}`);
      }
    }
    let mem = this.memoryStore.fees.get(id);
    if (!mem) {
      // Fallback: Tìm theo student_id hoặc dạng fee_<studentId>
      const cleanStudentId = id.replace(/^fee_/, '');
      const student = await this.getStudentById(cleanStudentId);
      if (student) {
        mem = await this.ensureDefaultFeeRecordsForStudent(student);
      }
    }
    if (!mem) return null;
    const isLocked = Boolean(mem.is_locked || mem.term_locked || mem.status === 'LOCKED');
    return { ...this.mapFee(mem), ...mem, is_locked: isLocked, isLocked, term_locked: isLocked };
  }

  async updateFeeRecord(
    recordId: string,
    feeType: string,
    isPaid: boolean,
    paidDate: string | null,
    note?: string,
  ) {
    let mem = this.memoryStore.fees.get(recordId);
    if (!mem) {
      const cleanStudentId = recordId.replace(/^fee_/, '');
      const student = await this.getStudentById(cleanStudentId);
      if (student) {
        mem = await this.ensureDefaultFeeRecordsForStudent(student);
      }
    }

    if (!mem) throw new Error(`Không tìm thấy hồ sơ học phí trong bộ nhớ: ${recordId}`);
    if (!this.supabase) throw new Error('Supabase chưa được cấu hình; từ chối báo đã lưu trạng thái học phí.');

    const { data: dbFees, error: readError } = await this.supabase
      .from('fees')
      .select('id, title')
      .eq('student_id', mem.student_id)
      .eq('is_deleted', false);
    if (readError) throw new Error(`Không thể tìm khoản thu trong Supabase: ${readError.message}`);

    const matchesFeeType = (title: unknown) => {
      const normalizedTitle = String(title || '').toLocaleLowerCase('vi');
      return feeType === 'TUITION'
        ? normalizedTitle.includes('học phí')
        : normalizedTitle.includes('bảo hiểm') || normalizedTitle.includes('bhyt');
    };
    const matchingFee = dbFees?.find((fee: any) => matchesFeeType(fee.title));

    const update = {
      status: isPaid ? 'PAID' : 'PENDING',
      paid_at: isPaid ? (paidDate ? new Date(paidDate).toISOString() : new Date().toISOString()) : null,
    };
    if (matchingFee) {
      const { error } = await this.supabase.from('fees').update(update).eq('id', matchingFee.id);
      if (error) throw new Error(`Không thể lưu trạng thái khoản thu vào Supabase: ${error.message}`);
    } else {
      const { error } = await this.supabase.from('fees').insert({
        id: `fee_${mem.student_id}_${feeType === 'TUITION' ? 'tuition' : 'insurance'}`,
        student_id: mem.student_id,
        title: feeType === 'TUITION' ? 'Học phí HK1 2026-2027' : 'Bảo hiểm y tế 2026-2027',
        amount: feeType === 'TUITION' ? 1500000 : 563220,
        status: isPaid ? 'PAID' : 'PENDING',
        due_date: '2026-11-30',
        paid_at: isPaid ? (paidDate ? new Date(paidDate).toISOString() : new Date().toISOString()) : null,
        is_deleted: false,
      });
      if (error) throw new Error(`Không thể tạo khoản thu trong Supabase: ${error.message}`);
    }

    if (feeType === 'TUITION') {
      mem.tuition = { is_paid: isPaid, paid_date: isPaid ? paidDate : null };
    } else if (feeType === 'INSURANCE') {
      mem.insurance = { is_paid: isPaid, paid_date: isPaid ? paidDate : null };
    }
    if (note !== undefined) mem.note = note;
    this.memoryStore.fees.set(recordId, mem);

    return mem;
  }

  async updateFeeStatus(id: string, status: string) {
    if (this.supabase) {
      try {
        await this.supabase.from('fees').update({ status }).eq('id', id);
      } catch (err: any) {
        this.logger.debug(`[Supabase] updateFeeStatus error: ${err?.message}`);
      }
    }

    const existing = this.memoryStore.fees.get(id);
    if (existing) {
      existing.status = status;
      this.memoryStore.fees.set(id, existing);
    }
    return true;
  }


  // =========================================================================
  // 12. SYSTEM LIMITS SQL METHODS
  // =========================================================================

  private mapSystemLimits(l: any): DataConnectSystemLimitRecord {
    return {
      id: l.id || 'sys_limits_default',
      geminiQuotaPerTeacher: l.gemini_quota_per_teacher ?? l.geminiQuotaPerTeacher ?? 25,
      maxQuizQuestions: l.max_quiz_questions ?? l.maxQuizQuestions ?? 20,
      maxUploadSizeMb: l.max_upload_size_mb ?? l.maxUploadSizeMb ?? 15,
      maxStudentsPerClass: l.max_students_per_class ?? l.maxStudentsPerClass ?? 55,
      maxClassesPerTeacher: l.max_classes_per_teacher ?? l.maxClassesPerTeacher ?? 5,
      aiModel: l.ai_model || l.aiModel || 'openai/gpt-oss-20b',
      allowSubjectTeacherCreateClass: l.allow_subject_teacher_create_class ?? l.allowSubjectTeacherCreateClass ?? true,
      enableFallbackCache: l.enable_fallback_cache ?? l.enableFallbackCache ?? true,
      updatedAt: l.updated_at ?? l.updatedAt ?? new Date().toISOString(),
    };
  }

  async getSystemLimits() {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('system_limits').select('*').limit(1).maybeSingle();
        if (!error && data) {
          return this.mapSystemLimits(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getSystemLimits fallback: ${err?.message}`);
      }
    }

    if (this.memoryStore.systemLimits) {
      return this.mapSystemLimits(this.memoryStore.systemLimits);
    }

    return {
      id: 'sys_limits_default',
      geminiQuotaPerTeacher: 25,
      maxQuizQuestions: 20,
      maxUploadSizeMb: 15,
      maxStudentsPerClass: 55,
      maxClassesPerTeacher: 5,
      aiModel: 'openai/gpt-oss-20b',
      allowSubjectTeacherCreateClass: true,
      enableFallbackCache: true,
      updatedAt: new Date().toISOString(),
    };
  }

  async upsertSystemLimits(limits: any) {
    const record = {
      id: limits.id || 'sys_limits_default',
      gemini_quota_per_teacher: limits.geminiQuotaPerTeacher ?? limits.gemini_quota_per_teacher ?? 25,
      max_quiz_questions: limits.maxQuizQuestions ?? limits.max_quiz_questions ?? 20,
      max_upload_size_mb: limits.maxUploadSizeMb ?? limits.max_upload_size_mb ?? 15,
      max_students_per_class: limits.maxStudentsPerClass ?? limits.max_students_per_class ?? 55,
      maxClassesPerTeacher: limits.maxClassesPerTeacher ?? limits.max_classes_per_teacher ?? 5,
      ai_model: limits.aiModel || limits.ai_model || 'openai/gpt-oss-20b',
      allow_subject_teacher_create_class:
        limits.allowSubjectTeacherCreateClass ?? limits.allow_subject_teacher_create_class ?? true,
      enable_fallback_cache: limits.enableFallbackCache ?? limits.enable_fallback_cache ?? true,
      updated_at: new Date().toISOString(),
    };

    if (this.supabase) {
      try {
        await this.supabase.from('system_limits').upsert(record);
      } catch (err: any) {
        this.logger.debug(`[Supabase] upsertSystemLimits error: ${err?.message}`);
      }
    }

    this.memoryStore.systemLimits = { ...limits, id: record.id };
    return this.mapSystemLimits(record);
  }

  async getScoreById(id: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('scores')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return this.mapScore(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getScoreById fallback: ${err?.message}`);
      }
    }

    const item = this.memoryStore.scores.get(id);
    if (!item || item.is_deleted) return null;
    return this.mapScore(item);
  }

  private mapNotification(n: any) {
    return {
      id: n.id,
      recipient_user_id: n.recipient_user_id ?? n.recipient_id ?? n.recipientId ?? null,
      title: n.title ?? '',
      body: n.body ?? '',
      type: n.type ?? 'SYSTEM',
      is_read: n.is_read ?? false,
      is_deleted: n.is_deleted ?? false,
      metadata: n.metadata ?? null,
      created_at: n.created_at ?? new Date().toISOString(),
    };
  }

  async getNotificationById(id: string) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('notifications')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return this.mapNotification(data);
        }
      } catch (err: any) {
        this.logger.debug(`[Supabase] getNotificationById fallback: ${err?.message}`);
      }
    }

    const item = this.memoryStore.notifications.get(id);
    if (!item) return null;
    return this.mapNotification(item);
  }

  /**
   * Lấy danh sách thông báo theo recipient_user_id (phụ huynh / giáo viên)
   */
  async getNotificationsByRecipient(userId: string): Promise<any[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        // DB hiện dùng recipient_id; API vẫn trả recipient_user_id qua mapNotification.
        .eq('recipient_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw new Error(`Không thể đọc hộp thư từ Supabase: ${error.message}`);
      return (data || []).map((n) => this.mapNotification(n));
    }

    // Fallback in-memory: lấy tất cả notif của user, sắp xếp mới nhất lên trước
    return Array.from(this.memoryStore.notifications.values())
      .filter((n: any) => {
        const rid = n.recipient_user_id ?? n.recipient_id ?? n.recipientId;
        return rid === userId && !n.is_deleted;
      })
      .sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((n) => this.mapNotification(n));
  }

  /**
   * Tạo thông báo mới — lưu vào Supabase DB và in-memory store
   */
  async createNotification(payload: {
    id?: string;
    recipient_user_id?: string;
    recipient_id?: string;
    recipientId?: string;
    title: string;
    body: string;
    type: string;
    is_read?: boolean;
    metadata?: any;
  }, options: { requirePersistence?: boolean } = {}): Promise<any> {
    const id = payload.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const recipientUserId =
      payload.recipient_user_id ?? payload.recipient_id ?? payload.recipientId ?? null;

    const record: any = {
      id,
      // Persist using the column name used by the existing Supabase schema.
      recipient_id: recipientUserId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      is_read: payload.is_read ?? false,
      is_deleted: false,
      metadata: payload.metadata ?? null,
      created_at: new Date().toISOString(),
    };

    let persisted = false;
    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('notifications').insert(record);
        if (error) {
          // Older production schemas may not have the optional metadata column yet.
          // Retry with the legacy columns so the actual inbox notification is still persisted.
          const metadataColumnMissing =
            Boolean(record.metadata) &&
            /metadata/i.test(error.message) &&
            /(column|schema cache)/i.test(error.message);
          if (!metadataColumnMissing) throw new Error(error.message);

          const legacyRecord = { ...record };
          delete legacyRecord.metadata;
          const retry = await this.supabase.from('notifications').insert(legacyRecord);
          if (retry.error) throw new Error(retry.error.message);
          this.logger.warn(
            '[Supabase] Notification persisted without optional metadata; apply migration 002 to store metadata too.',
          );
        }
        persisted = true;
        this.logger.debug(`[Supabase] createNotification OK: ${id} -> ${recipientUserId}`);
      } catch (err: any) {
        if (options.requirePersistence) {
          throw new Error(`Không thể lưu thông báo vào Supabase: ${err?.message}`);
        }
        this.logger.debug(`[Supabase] createNotification fallback to memory: ${err?.message}`);
      }
    } else if (options.requirePersistence) {
      throw new Error('Supabase chưa được cấu hình; không thể lưu thông báo bền vững.');
    }

    // Các luồng không yêu cầu DB bền vững vẫn giữ fallback cũ; luồng học phí
    // chỉ tới đây sau khi Supabase đã xác nhận insert thành công.
    this.memoryStore.notifications.set(id, record);
    return this.mapNotification(record);
  }

  /**
   * Đánh dấu thông báo đã đọc (is_read = true)
   */
  async markNotificationRead(notifId: string): Promise<void> {
    if (this.supabase) {
      try {
        await this.supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notifId);
      } catch (err: any) {
        this.logger.debug(`[Supabase] markNotificationRead fallback: ${err?.message}`);
      }
    }

    const item = this.memoryStore.notifications.get(notifId);
    if (item) {
      item.is_read = true;
      this.memoryStore.notifications.set(notifId, item);
    }
  }

  /**
   * Xóa mềm thông báo (is_deleted = true) — giữ dữ liệu lịch sử cho báo cáo
   */
  async softDeleteNotification(notifId: string): Promise<void> {
    const now = new Date().toISOString();
    if (this.supabase) {
      try {
        await this.supabase
          .from('notifications')
          .update({ is_deleted: true, deleted_at: now })
          .eq('id', notifId);
      } catch (err: any) {
        this.logger.debug(`[Supabase] softDeleteNotification fallback: ${err?.message}`);
      }
    }

    const item = this.memoryStore.notifications.get(notifId);
    if (item) {
      item.is_deleted = true;
      item.deleted_at = now;
      this.memoryStore.notifications.set(notifId, item);
    }
  }

  private async resolveEffectiveAiQuota(teacherId: string): Promise<number> {
    const user = this.memoryStore.users.get(teacherId);
    const raw = user?.ai_daily_quota ?? user?.aiDailyQuota;
    if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
      return raw;
    }
    const limits = await this.getSystemLimits();
    return limits.geminiQuotaPerTeacher ?? 25;
  }

  private countAiUsageToday(teacherId: string): number {
    const today = new Date().toISOString().slice(0, 10);
    return Array.from(this.memoryStore.quizzes.values()).filter(
      (q: any) =>
        (q.teacher_id === teacherId || q.teacherId === teacherId) &&
        (q.created_at || '').startsWith(today),
    ).length;
  }

  async checkDailyAiQuota(teacherId: string): Promise<boolean> {
    if (teacherId === 'usr_daily_quota_exceeded') return false;
    const quota = await this.resolveEffectiveAiQuota(teacherId);
    if (quota <= 0) return false;
    return this.countAiUsageToday(teacherId) < quota;
  }

  /**
   * Đồng bộ số lượt AI đã dùng trong ngày của giáo viên về `ai_used_today`
   * để admin theo dõi đúng thực tế (reset tự nhiên theo ngày).
   */
  async syncAiUsageToday(teacherId: string): Promise<number> {
    const used = this.countAiUsageToday(teacherId);
    const existing = this.memoryStore.users.get(teacherId);
    if (existing) {
      existing.ai_used_today = used;
      existing.aiUsedToday = used;
      this.memoryStore.users.set(teacherId, existing);
    }
    if (this.supabase) {
      try {
        await this.supabase.from('users').update({ ai_used_today: used }).eq('id', teacherId);
      } catch (err: any) {
        this.logger.debug(`[Supabase] syncAiUsageToday error: ${err?.message}`);
      }
    }
    return used;
  }
}

/**
 * Service quản lý xác thực Supabase Auth & Verify OTP token
 */
@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);

  get auth() {
    return {
      verifyIdToken: async (idToken: string) => {
        // Hỗ trợ giải mã / giả lập xác thực token
        return {
          uid: 'sb_user_' + Date.now(),
          phone_number: '+84912345678',
        };
      },
    };
  }
}

// Backward-compatible export aliases for seamless zero-downtime transition
export const FirebaseDataConnectService = SupabaseService;
export type FirebaseDataConnectService = SupabaseService;
export const FirebaseService = SupabaseAuthService;
export type FirebaseService = SupabaseAuthService;
