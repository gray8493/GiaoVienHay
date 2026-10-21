import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';

export type RemarkStatus = 'READ' | 'UNREAD' | 'NONE';

export interface StudentRemarkItem {
  id: string;
  student_id: string;
  student_code: string;
  student_name: string;
  subject_code: string;
  subject_name: string;
  content: string | null;
  status: RemarkStatus;
  sent_date: string | null;
  teacher_name?: string;
}

export interface ExamReminderItem {
  id: string;
  class_id: string;
  subject_code: string;
  subject_name: string;
  exam_type: string; // 'Kiểm tra 15 phút' | 'Kiểm tra 1 tiết' | 'Thi Giữa kỳ' | 'Thi Cuối kỳ'
  exam_date: string; // YYYY-MM-DD
  day_of_week: string; // 'Thứ Sáu', 'Thứ Ba', 'Thứ Năm'
  day_number: string; // '09', '13', '22'
  month_str: string; // 'Th10'
  message: string;
  teacher_name: string;
  created_at: string;
  title?: string;
}

export interface CreateRemarkPayload {
  student_id: string;
  class_id: string;
  subject_code?: string;
  content: string;
}

export interface CreateExamReminderPayload {
  class_id: string;
  subject_code: string;
  exam_type: string;
  exam_date: string;
  message: string;
}

export interface RawRemarkRecord {
  remark_id: string;
  student_id: string;
  student_name?: string;
  subject_code: string;
  content: string;
  created_at: string;
  parent_acknowledged?: boolean;
}

const SUBJECT_LABELS: Record<string, string> = {
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

const WEEKDAY_LABELS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const EXAM_TYPE_LABELS: Record<string, string> = {
  ORAL_TEST: 'Kiểm tra miệng',
  QUIZ: 'Kiểm tra',
  TEST_15P: 'Kiểm tra 15 phút',
  TEST_1P: 'Kiểm tra 1 tiết',
  MID_TERM: 'Thi Giữa kỳ',
  FINAL: 'Thi Cuối kỳ',
};

const formatReminderCreatedAt = (value: any): string => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${mi}`;
};

export const subjectLabel = (code: string | undefined | null): string =>
  SUBJECT_LABELS[code || ''] ?? 'Toán học';

const normalizeRemarkRecord = (raw: any): RawRemarkRecord => ({
  remark_id: String(raw.remark_id ?? raw.id ?? ''),
  student_id: String(raw.student_id ?? raw.studentId ?? ''),
  student_name: raw.student_name ?? raw.studentName ?? '',
  subject_code: String(raw.subject_code ?? raw.subjectCode ?? raw.subject ?? 'MATH'),
  content: String(raw.content ?? ''),
  created_at: String(raw.created_at ?? raw.createdAt ?? ''),
  parent_acknowledged: raw.parent_acknowledged === true || raw.parentAcknowledged === true,
});

// Chuẩn hóa record từ backend (camelCase: classId/subject/examDate/title/note)
// về shape ExamReminderItem dùng cho UI
const normalizeExamReminder = (raw: any): ExamReminderItem => {
  const rawSubject = raw.subject_code ?? raw.subjectCode ?? raw.subject ?? '';
  const examDate = String(raw.exam_date ?? raw.examDate ?? '').split('T')[0];
  const dateObj = examDate ? new Date(`${examDate}T00:00:00`) : null;
  const validDate = dateObj !== null && !isNaN(dateObj.getTime());

  return {
    id: raw.id,
    class_id: raw.class_id ?? raw.classId ?? '',
    subject_code: rawSubject,
    subject_name:
      raw.subject_name ??
      SUBJECT_LABELS[rawSubject] ??
      (rawSubject && !/^[A-Z0-9_]+$/.test(rawSubject) ? rawSubject : ''),
    exam_type: EXAM_TYPE_LABELS[raw.exam_type ?? raw.examType] ?? raw.exam_type ?? raw.examType ?? '',
    exam_date: examDate,
    day_of_week: raw.day_of_week ?? (validDate ? WEEKDAY_LABELS[dateObj!.getDay()] : ''),
    day_number: raw.day_number ?? (validDate ? String(dateObj!.getDate()).padStart(2, '0') : ''),
    month_str: raw.month_str ?? (validDate ? `Th${dateObj!.getMonth() + 1}` : ''),
    message: raw.message ?? raw.note ?? '',
    teacher_name: raw.teacher_name ?? '',
    created_at: formatReminderCreatedAt(raw.created_at ?? raw.createdAt),
    title: raw.title ?? '',
  };
};

export const remarksService = {
  async getClassRemarks(classId: string = ''): Promise<RawRemarkRecord[]> {
    if (!classId || classId === 'cls_empty') return [];
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/remarks/class/${classId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data !== undefined ? resJson.data : resJson;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        return list.map(normalizeRemarkRecord);
      }
    } catch (e) {
      console.warn('Backend remarks not reachable:', e);
    }
    return [];
  },

  async getStudentRemarks(studentId: string = ''): Promise<RawRemarkRecord[]> {
    if (!studentId) return [];
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/remarks/student/${studentId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data !== undefined ? resJson.data : resJson;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        return list.map(normalizeRemarkRecord);
      }
    } catch (e) {
      console.warn('getStudentRemarks not reachable:', e);
    }
    return [];
  },

  async createRemark(payload: CreateRemarkPayload): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          student_id: payload.student_id,
          class_id: payload.class_id,
          subject_code: payload.subject_code || 'MATH',
          content: payload.content,
        }),
      });
      if (response.ok) {
        return true;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể gửi nhận xét');
    } catch (e: any) {
      console.warn('createRemark failed:', e?.message);
      throw e;
    }
  },

  async getClassExamReminders(classId: string = ''): Promise<ExamReminderItem[]> {
    if (!classId || classId === 'cls_empty') return [];
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/exam-reminders/class/${classId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data !== undefined ? resJson.data : resJson;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.reminders)
          ? data.reminders
          : [];
        return list.map(normalizeExamReminder);
      }
    } catch (e) {
      console.warn('Backend exam-reminders not reachable:', e);
    }
    return [];
  },

  async createExamReminder(payload: CreateExamReminderPayload): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();

      // Chuẩn hóa exam_type sang enum GradeType Backend
      let normalizedType = 'TEST_15P';
      const rawType = payload.exam_type?.toUpperCase() || '';
      if (rawType.includes('15') || rawType === 'TEST_15P') normalizedType = 'TEST_15P';
      else if (rawType.includes('1 TIẾT') || rawType.includes('45') || rawType === 'TEST_1P') normalizedType = 'TEST_1P';
      else if (rawType.includes('GIỮA') || rawType === 'MID_TERM') normalizedType = 'MID_TERM';
      else if (rawType.includes('CUỐI') || rawType === 'FINAL') normalizedType = 'FINAL';
      else if (rawType.includes('MIỆNG') || rawType === 'ORAL_TEST') normalizedType = 'ORAL_TEST';

      // Chuẩn hóa ngày DD/MM/YYYY sang YYYY-MM-DD
      let normalizedDate = payload.exam_date;
      if (payload.exam_date && payload.exam_date.includes('/')) {
        const parts = payload.exam_date.split('/');
        if (parts.length === 3) {
          normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/exam-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          class_id: payload.class_id || 'cls_1a_2026',
          subject_code: payload.subject_code || 'MATH',
          exam_type: normalizedType,
          exam_date: normalizedDate,
          message: payload.message,
        }),
      });
      if (response.ok) {
        return true;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo lịch kiểm tra');
    } catch (e: any) {
      console.warn('createExamReminder failed:', e?.message);
      throw e;
    }
  },
};
