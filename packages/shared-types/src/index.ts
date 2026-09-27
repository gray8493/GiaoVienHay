export * from './error-codes';

// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
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
  EXCUSED_ABSENCE = 'EXCUSED_ABSENCE',
  UNEXCUSED_ABSENCE = 'UNEXCUSED_ABSENCE',
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
