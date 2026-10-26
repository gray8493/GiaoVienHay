import { api } from './http';
import { EXAM_TYPE_LABELS, SUBJECT_LABELS, WEEKDAY_FULL_LABELS } from '../constants/academic';

export type RemarkStatus = 'SENT' | 'NONE';

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
  teacher_name?: string;
  content: string;
  created_at: string;
}

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
  (code && SUBJECT_LABELS[code]) || code || 'Môn học';

const normalizeRemarkRecord = (raw: any): RawRemarkRecord => ({
  remark_id: String(raw.remark_id ?? raw.id ?? ''),
  student_id: String(raw.student_id ?? raw.studentId ?? ''),
  student_name: raw.student_name ?? raw.studentName ?? '',
  subject_code: String(raw.subject_code ?? raw.subjectCode ?? raw.subject ?? ''),
  teacher_name: raw.teacher_name ?? raw.teacherName ?? '',
  content: String(raw.content ?? ''),
  created_at: String(raw.created_at ?? raw.createdAt ?? ''),
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
    day_of_week: raw.day_of_week ?? (validDate ? WEEKDAY_FULL_LABELS[dateObj!.getDay()] : ''),
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
      const data = await api<any>(`/remarks/class/${classId}`);
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      return list.map(normalizeRemarkRecord);
    } catch (e) {
      console.warn('Backend remarks not reachable:', e);
      return [];
    }
  },

  async getStudentRemarks(studentId: string = ''): Promise<RawRemarkRecord[]> {
    if (!studentId) return [];
    try {
      const data = await api<any>(`/remarks/student/${studentId}`);
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      return list.map(normalizeRemarkRecord);
    } catch (e) {
      console.warn('getStudentRemarks not reachable:', e);
      return [];
    }
  },

  async createRemark(payload: CreateRemarkPayload): Promise<boolean> {
    await api('/remarks', {
      method: 'POST',
      body: {
        student_id: payload.student_id,
        class_id: payload.class_id,
        subject_code: payload.subject_code,
        content: payload.content,
      },
      errorMessage: 'Không thể gửi nhận xét',
    });
    return true;
  },

  async getClassExamReminders(classId: string = ''): Promise<ExamReminderItem[]> {
    if (!classId || classId === 'cls_empty') return [];
    try {
      const data = await api<any>(`/exam-reminders/class/${classId}`);
      const list = Array.isArray(data) ? data : Array.isArray(data?.reminders) ? data.reminders : [];
      return list.map(normalizeExamReminder);
    } catch (e) {
      console.warn('Backend exam-reminders not reachable:', e);
      return [];
    }
  },

  async createExamReminder(payload: CreateExamReminderPayload): Promise<boolean> {
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

    if (!payload.class_id || payload.class_id === 'cls_empty') {
      throw new Error('Chưa xác định được lớp học. Vui lòng chọn lớp trước khi tạo lịch kiểm tra.');
    }

    await api('/exam-reminders', {
      method: 'POST',
      body: {
        class_id: payload.class_id,
        subject_code: payload.subject_code,
        exam_type: normalizedType,
        exam_date: normalizedDate,
        message: payload.message,
      },
      errorMessage: 'Không thể tạo lịch kiểm tra',
    });
    return true;
  },
};
