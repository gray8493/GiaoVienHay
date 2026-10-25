/**
 * Hằng số học thuật dùng chung toàn app (mobile).
 * Trước đây các map này bị nhân bản ở class.service / remarks.service / parent.service
 * và một số màn hình — giờ về một nguồn duy nhất tại đây.
 */

// Nhãn môn học theo mã canonical của backend
export const SUBJECT_LABELS: Record<string, string> = {
  MATH: 'Toán',
  LIT: 'Ngữ văn',
  LITERATURE: 'Ngữ văn',
  ENG: 'Tiếng Anh',
  ENGLISH: 'Tiếng Anh',
  CS: 'Tin học',
  INFORMATICS: 'Tin học',
  SCIENCE: 'Khoa học tự nhiên',
  PHYSICS: 'Vật lý',
  CHEM: 'Hóa học',
  BIO: 'Sinh học',
  HIST: 'Lịch sử',
  HISTORY: 'Lịch sử',
  GEO: 'Địa lý',
  GEOGRAPHY: 'Địa lý',
  GDCD: 'GDCD',
  ETHICS: 'Đạo đức',
  TECH: 'Công nghệ',
  MUSIC: 'Âm nhạc',
  ART: 'Mỹ thuật',
  PE: 'Giáo dục thể chất',
};

// Danh mục môn học chuẩn của trường (Tiểu học & THCS) — mã canonical của backend
export const SCHOOL_SUBJECTS: string[] = [
  'MATH',
  'LIT',
  'ENG',
  'CS',
  'SCIENCE',
  'PHYSICS',
  'CHEM',
  'BIO',
  'HIST',
  'GEO',
  'GDCD',
  'ETHICS',
  'TECH',
  'MUSIC',
  'ART',
  'PE',
];

// Nhãn loại bài kiểm tra theo enum GradeType của backend
export const EXAM_TYPE_LABELS: Record<string, string> = {
  ORAL_TEST: 'Kiểm tra miệng',
  QUIZ: 'Kiểm tra',
  TEST_15P: 'Kiểm tra 15 phút',
  TEST_1P: 'Kiểm tra 1 tiết',
  MID_TERM: 'Thi giữa kỳ',
  FINAL: 'Thi cuối kỳ',
};

export const WEEKDAY_FULL_LABELS = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

export const WEEKDAY_SHORT_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
