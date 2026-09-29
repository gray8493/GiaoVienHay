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
  GRADE_PUBLISHED = 'GRADE_PUBLISHED',
  REMARK_NEW = 'REMARK_NEW',
  EXAM_REMINDER = 'EXAM_REMINDER',
  FEE_REMINDER = 'FEE_REMINDER',
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
