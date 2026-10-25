export * from './error-codes';
import { ErrorCode } from './error-codes';

export const CommonErrorCode = ErrorCode;
export const AuthErrorCode = ErrorCode;

// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER_HOMEROOM = 'TEACHER_HOMEROOM',
  TEACHER_SUBJECT = 'TEACHER_SUBJECT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
}

// Subjects
export enum Subject {
  MATH = 'MATH',
  LITERATURE = 'LITERATURE',
  ENGLISH = 'ENGLISH',
  PHYSICS = 'PHYSICS',
  CHEMISTRY = 'CHEMISTRY',
  BIOLOGY = 'BIOLOGY',
  HISTORY = 'HISTORY',
  GEOGRAPHY = 'GEOGRAPHY',
  CIVICS = 'CIVICS',
  INFORMATICS = 'INFORMATICS',
  PHYSICAL_EDUCATION = 'PHYSICAL_EDUCATION',
  MUSIC = 'MUSIC',
  ART = 'ART',
}

// Attendance Status
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT_EXCUSED = 'ABSENT_EXCUSED',
  ABSENT_UNEXCUSED = 'ABSENT_UNEXCUSED',
  LATE = 'LATE',
}

// Grade Types
export enum GradeType {
  ORAL_TEST = 'ORAL_TEST',
  QUIZ = 'QUIZ',
  TEST_15P = 'TEST_15P',
  TEST_1P = 'TEST_1P',
  MID_TERM = 'MID_TERM',
  FINAL = 'FINAL',
}

// Quiz & Game Modes
export enum GameMode {
  STANDARD_QUIZ = 'STANDARD_QUIZ',
  GOLDEN_BELL = 'GOLDEN_BELL',
  RACING = 'RACING',
  MYSTERY_BOX = 'MYSTERY_BOX',
}

// AI Question Difficulty Levels
export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED',
}

// Fee Types
export enum FeeType {
  TUITION = 'TUITION',
  INSURANCE = 'INSURANCE',
  BOTH = 'BOTH',
}

// Notification Types
export enum NotificationType {
  ATTENDANCE_ABSENT = 'ATTENDANCE_ABSENT',
  ATTENDANCE_LATE = 'ATTENDANCE_LATE',
  ATTENDANCE_PRESENT = 'ATTENDANCE_PRESENT',
  GRADE_PUBLISHED = 'GRADE_PUBLISHED',
  REMARK_NEW = 'REMARK_NEW',
  EXAM_REMINDER = 'EXAM_REMINDER',
  FEE_REMINDER = 'FEE_REMINDER',
  FEE_STATUS_UPDATED = 'FEE_STATUS_UPDATED',
  SYSTEM = 'SYSTEM',
}

// Gender
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

// Standard API Response Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  status_code: number;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  status_code: number;
  message: string;
  error_code: string;
  details?: any;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// DB Base Entity & Soft Delete (is_deleted: false/0: Active, true/1: Deleted)
// ---------------------------------------------------------------------------
export interface SoftDeletable {
  /** 
   * Trạng thái xóa mềm: 
   * - false hoặc 0: Đang hoạt động (chưa xóa)
   * - true hoặc 1: Đã xóa mềm (không hiển thị trong các truy vấn thông thường)
   */
  is_deleted: boolean;
  deleted_at?: string | null;
}

export interface BaseEntity extends SoftDeletable {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserEntity extends BaseEntity {
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  school_name?: string | null;
  teaching_subjects?: Subject[] | string[];
  is_active: boolean;
}

export interface ClassEntity extends BaseEntity {
  name: string;
  grade_level: number;
  academic_year: string;
  school_name: string;
  homeroom_teacher_id: string;
  subject_teacher_ids: string[];
  invite_code: string;
  student_count: number;
}

export interface StudentEntity extends BaseEntity {
  class_id: string;
  class_name: string;
  student_code: string;
  full_name: string;
  dob?: string | null;
  gender: Gender | string;
  parent_phone?: string | null;
  parent_uids?: string[];
}

export interface AttendanceEntity extends BaseEntity {
  class_id: string;
  student_id: string;
  student_name?: string;
  attendance_date: string;
  period: number;
  status: AttendanceStatus;
  note?: string | null;
  recorded_by: string;
}

export interface ScoreEntity extends BaseEntity {
  class_id: string;
  student_id: string;
  subject_code: string;
  semester: number;
  score_type: GradeType | string;
  score_value: number;
  teacher_comment?: string | null;
  is_published: boolean;
  recorded_by: string;
}

export interface QuizEntity extends BaseEntity {
  quiz_id: string;
  title: string;
  subject_code: string;
  class_id: string;
  difficulty_level: DifficultyLevel | string;
  total_questions: number;
  available_modes: GameMode[] | string[];
  questions: any[];
  created_by: string;
}

export interface RemarkEntity extends BaseEntity {
  student_id: string;
  class_id: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  content: string;
  parent_acknowledged: boolean;
  acknowledged_at?: string | null;
}

export interface ExamReminderEntity extends BaseEntity {
  class_id: string;
  subject_code: string;
  exam_type: string;
  exam_date: string;
  message: string;
  created_by: string;
}

export interface FeeInsuranceEntity extends BaseEntity {
  student_id: string;
  student_name: string;
  class_id: string;
  term_name: string;
  tuition?: {
    is_paid: boolean;
    paid_date?: string | null;
    amount: number;
  };
  insurance?: {
    is_paid: boolean;
    paid_date?: string | null;
    amount: number;
    deadline?: string | null;
  };
  note?: string | null;
}

export interface NotificationEntity extends BaseEntity {
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  metadata?: Record<string, any>;
}
