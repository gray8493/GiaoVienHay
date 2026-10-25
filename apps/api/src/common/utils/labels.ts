/**
 * Nhãn hiển thị tiếng Việt dùng chung cho thông báo giáo viên -> phụ huynh
 * (Module 06 - Bảng điểm, 09 - Lịch kiểm tra, 11 - Notifications)
 * Lưu ý: giữ nguyên nhãn cũ của module 09 để không đổi hành vi hiện có.
 */

export const SUBJECT_LABELS: Record<string, string> = {
  MATH: 'Toán',
  LIT: 'Ngữ văn',
  LITERATURE: 'Ngữ văn',
  ENG: 'Tiếng Anh',
  ENGLISH: 'Tiếng Anh',
  CS: 'Tin học',
  INFORMATICS: 'Tin học',
  SCIENCE: 'Khoa học',
  ETHICS: 'Đạo đức',
};

export const subjectLabel = (subjectCode?: string): string =>
  SUBJECT_LABELS[subjectCode || ''] || subjectCode || '';

export const EXAM_TYPE_LABELS: Record<string, string> = {
  ORAL_TEST: 'Kiểm tra miệng',
  QUIZ: 'Kiểm tra',
  TEST_15P: 'Kiểm tra 15 phút',
  TEST_1P: 'Kiểm tra 1 tiết',
  MID_TERM: 'Thi Giữa kỳ',
  FINAL: 'Thi Cuối kỳ',
};

export const examTypeLabel = (examType?: string): string =>
  EXAM_TYPE_LABELS[examType || ''] || examType || '';

// Dùng cho thông báo công bố bảng điểm (module 06)
export const SCORE_TYPE_LABELS: Record<string, string> = {
  ORAL_TEST: 'kiểm tra miệng',
  QUIZ: 'kiểm tra',
  TEST_15P: 'kiểm tra 15 phút',
  TEST_1P: 'kiểm tra 1 tiết',
  MID_TERM: 'thi giữa học kỳ',
  FINAL: 'thi cuối kỳ',
};

export const scoreTypeLabel = (scoreType?: string): string =>
  SCORE_TYPE_LABELS[scoreType || ''] || scoreType || '';
